const { query } = require('./server/src/config/database');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// 需要创建的用户列表
const usersToCreate = [
  // 超级管理员
  { username: 'zhangshuang', email: 'zhangshuang@xueke.ai', password: 'xueke666', role: 'super_admin' },
  { username: 'yuli', email: 'yuli@xueke.ai', password: 'xueke666', role: 'super_admin' },
  // 普通用户
  { username: 'lichengcheng', email: 'lichengcheng@xueke.ai', password: 'xueke666', role: 'standard_user' },
  { username: 'liuli', email: 'liuli@xueke.ai', password: 'xueke666', role: 'standard_user' },
  { username: 'wangxin', email: 'wangxin@xueke.ai', password: 'xueke666', role: 'standard_user' }
];

async function createUsers() {
  console.log('🚀 开始检查和创建用户账号...\n');

  try {
    for (const userData of usersToCreate) {
      console.log(`📝 检查用户: ${userData.username}`);
      
      // 检查用户是否已存在
      const existingUser = await query('SELECT * FROM users WHERE username = ?', [userData.username]);
      
      if (existingUser.length > 0) {
        console.log(`✅ 用户 ${userData.username} 已存在，跳过创建`);
        console.log(`   - 角色: ${existingUser[0].role}`);
        console.log(`   - 邮箱: ${existingUser[0].email}`);
        console.log(`   - 创建时间: ${existingUser[0].created_at}\n`);
        continue;
      }

      // 创建新用户
      console.log(`🔨 创建用户: ${userData.username}`);
      const id = uuidv4();
      const password_hash = await bcrypt.hash(userData.password, 12);
      
      // 插入用户记录
      await query(
        'INSERT INTO users (id, username, email, password_hash, role) VALUES (?, ?, ?, ?, ?)',
        [id, userData.username, userData.email, password_hash, userData.role]
      );
      
      // 创建用户设置
      await query(
        'INSERT INTO user_settings (id, user_id) VALUES (?, ?)',
        [uuidv4(), id]
      );
      
      console.log(`✅ 用户创建成功!`);
      console.log(`   - 用户名: ${userData.username}`);
      console.log(`   - 邮箱: ${userData.email}`);
      console.log(`   - 角色: ${userData.role}`);
      console.log(`   - 密码: ${userData.password}\n`);
    }
    
    console.log('🎉 所有用户检查和创建完成!');
    
    // 显示所有用户列表
    console.log('\n📋 当前系统中的所有用户:');
    const allUsers = await query('SELECT username, email, role, created_at FROM users ORDER BY role DESC, username');
    
    console.log('\n超级管理员:');
    allUsers.filter(user => user.role === 'super_admin').forEach(user => {
      console.log(`  - ${user.username} (${user.email}) - 创建于: ${user.created_at}`);
    });
    
    console.log('\n普通用户:');
    allUsers.filter(user => user.role === 'standard_user').forEach(user => {
      console.log(`  - ${user.username} (${user.email}) - 创建于: ${user.created_at}`);
    });
    
  } catch (error) {
    console.error('❌ 创建用户失败:', error.message);
    console.error('错误详情:', error);
  } finally {
    process.exit(0);
  }
}

// 运行脚本
createUsers();