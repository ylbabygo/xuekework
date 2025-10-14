const { query, testConnection, initDatabase } = require('./src/config/database');
const bcrypt = require('bcryptjs');

async function resetAdminPassword() {
  try {
    console.log('初始化数据库连接...');
    await testConnection();
    await initDatabase();
    
    console.log('查找admin用户...');
    const users = await query('SELECT * FROM users WHERE username = ?', ['admin']);
    
    if (users.length === 0) {
      console.log('未找到admin用户');
      return;
    }
    
    const user = users[0];
    console.log('找到admin用户:', user.username, user.email);
    
    // 生成新的密码哈希
    console.log('生成新的密码哈希...');
    const newPassword = 'admin123';
    const saltRounds = 12;
    const newHash = await bcrypt.hash(newPassword, saltRounds);
    
    // 更新密码
    console.log('更新密码...');
    await query('UPDATE users SET password_hash = ? WHERE username = ?', [newHash, 'admin']);
    
    console.log('✅ admin用户密码已重置为: admin123');
    
    // 验证密码
    console.log('验证新密码...');
    const isValid = await bcrypt.compare(newPassword, newHash);
    console.log('密码验证结果:', isValid ? '✓ 正确' : '✗ 错误');
    
  } catch (error) {
    console.error('重置密码失败:', error);
  }
}

resetAdminPassword();