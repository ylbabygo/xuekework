const database = require('./src/config/database');
const User = require('./src/models/User');
const { generateToken } = require('./src/middleware/auth');

async function debugLoginProcess() {
  try {
    // 初始化数据库连接
    await database.testConnection();
    await database.initDatabase();
    console.log('🔍 调试登录过程中的用户对象变化...\n');

    // 1. 查找用户
    console.log('1. 查找用户...');
    const user = await User.findByUsername('admin');
    console.log('查找到的用户ID:', user.id);
    console.log('查找到的用户对象:', {
      id: user.id,
      username: user.username,
      role: user.role
    });

    // 2. 验证密码（模拟）
    console.log('\n2. 验证密码...');
    const isValidPassword = await user.validatePassword('admin123');
    console.log('密码验证结果:', isValidPassword);
    console.log('验证后用户ID:', user.id);

    // 3. 更新最后登录时间
    console.log('\n3. 更新最后登录时间...');
    console.log('更新前用户ID:', user.id);
    await user.updateLastLogin();
    console.log('更新后用户ID:', user.id);

    // 4. 生成JWT令牌
    console.log('\n4. 生成JWT令牌...');
    console.log('生成token前用户ID:', user.id);
    const token = generateToken(user);
    console.log('生成token后用户ID:', user.id);
    console.log('Token:', token.substring(0, 50) + '...');

    // 5. 调用toJSON
    console.log('\n5. 调用toJSON...');
    console.log('toJSON前用户ID:', user.id);
    const userJson = user.toJSON();
    console.log('toJSON后用户ID:', user.id);
    console.log('toJSON结果中的ID:', userJson.id);

    // 6. 检查是否有其他地方修改了用户对象
    console.log('\n6. 最终检查...');
    console.log('最终用户对象ID:', user.id);
    console.log('最终JSON对象ID:', userJson.id);

  } catch (error) {
    console.error('❌ 调试过程中出现错误:', error.message);
    console.error(error.stack);
  }
}

debugLoginProcess();