const database = require('./src/config/database');
const User = require('./src/models/User');

async function debugDatabaseUser() {
  try {
    // 初始化数据库连接
    await database.testConnection();
    await database.initDatabase();
    console.log('🔍 调试数据库用户查询...\n');

    // 1. 直接查询数据库
    console.log('1. 直接查询数据库...');
    const sql = 'SELECT * FROM users WHERE username = ? AND is_active = TRUE';
    const rows = await database.query(sql, ['admin']);
    console.log('数据库查询结果:', rows);

    // 2. 使用User.findByUsername
    console.log('\n2. 使用User.findByUsername...');
    const user = await User.findByUsername('admin');
    console.log('User.findByUsername结果:', user);
    
    if (user) {
      console.log('用户对象属性:');
      console.log('- id:', user.id);
      console.log('- username:', user.username);
      console.log('- role:', user.role);
      console.log('- is_active:', user.is_active);
      
      console.log('\ntoJSON()结果:', user.toJSON());
    }

  } catch (error) {
    console.error('❌ 调试过程中出现错误:', error.message);
  }
}

debugDatabaseUser();