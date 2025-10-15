const jwt = require('jsonwebtoken');
const User = require('./src/models/User');
const database = require('./src/config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'xueke-ai-workspace-secret-key-2024';

async function debugToken() {
  // 初始化数据库连接
  await database.testConnection();
  await database.initDatabase();
  console.log('🔍 调试JWT Token...\n');

  try {
    // 1. 创建一个测试token
    console.log('1. 创建测试token...');
    const testPayload = {
      id: '553e4567-e89b-12d3-a456-426614174000', // admin用户的ID
      username: 'admin',
      role: 'super_admin'
    };
    
    const testToken = jwt.sign(testPayload, JWT_SECRET, { expiresIn: '7d' });
    console.log('测试Token:', testToken.substring(0, 50) + '...');

    // 2. 解码token
    console.log('\n2. 解码token...');
    const decoded = jwt.verify(testToken, JWT_SECRET);
    console.log('解码结果:', decoded);

    // 3. 查找用户
    console.log('\n3. 查找用户...');
    console.log('查找用户ID:', decoded.id);
    
    const user = await User.findById(decoded.id);
    if (user) {
      console.log('✅ 用户找到:', {
        id: user.id,
        username: user.username,
        role: user.role,
        is_active: user.is_active
      });
    } else {
      console.log('❌ 用户未找到');
      
      // 查看数据库中的所有用户
      console.log('\n4. 查看数据库中的所有用户...');
      const result = await User.getList(1, 10, '');
      console.log('所有用户:', result.users.map(u => ({
        id: u.id,
        username: u.username,
        role: u.role,
        is_active: u.is_active
      })));
    }

  } catch (error) {
    console.error('❌ 调试过程中出现错误:', error);
  }
}

// 运行调试
debugToken();