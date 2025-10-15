require('dotenv').config();
const database = require('./src/config/database');
const User = require('./src/models/User');

async function debugSupabaseUsers() {
  try {
    console.log('🔍 调试Supabase数据库中的用户...\n');
    
    // 检查环境变量
    console.log('环境变量:');
    console.log('- USE_SUPABASE:', process.env.USE_SUPABASE);
    console.log('- DATABASE_TYPE:', process.env.DATABASE_TYPE);
    console.log('- USE_SQLITE:', process.env.USE_SQLITE);
    
    // 初始化数据库连接
    console.log('\n初始化数据库连接...');
    await database.testConnection();
    await database.initDatabase();

    // 1. 查找admin用户
    console.log('\n1. 查找admin用户...');
    const user = await User.findByUsername('admin');
    if (user) {
      console.log('找到admin用户:', {
        id: user.id,
        username: user.username,
        role: user.role,
        email: user.email,
        is_active: user.is_active
      });
    } else {
      console.log('❌ 未找到admin用户');
    }

    // 2. 获取所有用户列表
    console.log('\n2. 获取所有用户列表...');
    const result = await User.getList(1, 10, '');
    console.log('用户总数:', result.total);
    console.log('用户列表:');
    result.users.forEach(u => {
      console.log(`- ${u.username} (${u.id}) - ${u.role}`);
    });

  } catch (error) {
    console.error('❌ 调试过程中出现错误:', error.message);
    console.error(error.stack);
  }
}

debugSupabaseUsers();