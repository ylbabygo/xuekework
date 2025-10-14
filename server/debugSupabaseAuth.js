require('dotenv').config();
const databaseAdapter = require('./src/adapters/databaseAdapter');
const { generateToken, validatePassword } = require('./src/middleware/auth');

console.log('=== 调试Supabase认证问题 ===\n');

async function debugAuth() {
  try {
    const username = `testuser_${Date.now().toString().slice(-6)}`;
    const email = `test_${Date.now().toString().slice(-6)}@example.com`;
    const password = 'Test123!@#';

    console.log('1. 测试数据准备...');
    console.log(`用户名: ${username}`);
    console.log(`邮箱: ${email}`);
    console.log(`密码: ${password}\n`);

    console.log('2. 验证用户名格式...');
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(username)) {
      console.log('❌ 用户名格式不正确');
      return;
    }
    console.log('✅ 用户名格式正确\n');

    console.log('3. 验证密码强度...');
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      console.log('❌ 密码强度不足:', passwordValidation.errors);
      return;
    }
    console.log('✅ 密码强度符合要求\n');

    console.log('4. 检查用户名是否已存在...');
    try {
      const existingUser = await databaseAdapter.getUserByUsername(username);
      if (existingUser) {
        console.log('❌ 用户名已存在');
        return;
      }
    } catch (error) {
      console.log('✅ 用户名不存在，可以使用');
      console.log('检查错误（正常）:', error.message);
    }
    console.log();

    console.log('5. 哈希密码...');
    const passwordHash = await databaseAdapter.hashPassword(password);
    console.log('✅ 密码哈希完成');
    console.log('哈希值:', passwordHash.substring(0, 20) + '...\n');

    console.log('6. 创建用户...');
    const userData = {
      username,
      email,
      password_hash: passwordHash,
      role: 'standard_user'
    };
    console.log('用户数据:', userData);

    const user = await databaseAdapter.createUser(userData);
    console.log('✅ 用户创建成功!');
    console.log('创建的用户:', user);

    console.log('\n7. 生成JWT令牌...');
    const token = generateToken({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role || 'standard_user'
    });
    console.log('✅ JWT令牌生成成功');
    console.log('令牌:', token.substring(0, 50) + '...\n');

    console.log('8. 记录系统日志...');
    await databaseAdapter.createSystemLog({
      user_id: user.id,
      action: 'register',
      resource_type: 'user',
      resource_id: user.id,
      details: {
        message: '用户注册成功',
        username: user.username
      },
      ip_address: '127.0.0.1',
      user_agent: 'Debug Script'
    });
    console.log('✅ 系统日志记录成功\n');

    console.log('🎉 所有步骤都成功完成！');

  } catch (error) {
    console.error('❌ 调试过程中出现错误:');
    console.error('错误消息:', error.message);
    console.error('错误详情:', error);
    
    if (error.code) {
      console.error('错误代码:', error.code);
    }
    if (error.details) {
      console.error('错误详情:', error.details);
    }
    if (error.hint) {
      console.error('错误提示:', error.hint);
    }
  }
}

debugAuth();