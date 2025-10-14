const fs = require('fs');
const path = require('path');
const { initSQLite, query } = require('../config/sqlite');

async function runBookmarkMigration() {
  try {
    console.log('开始执行用户书签表迁移...');
    
    // 初始化数据库连接
    await initSQLite();
    
    // 读取迁移文件
    const migrationPath = path.join(__dirname, '../database/migrations/002_create_user_bookmarks.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // 分割SQL语句
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    // 执行每个SQL语句
    for (const statement of statements) {
      try {
        console.log(`执行: ${statement.substring(0, 50)}...`);
        await query(statement);
        console.log('✓ 执行成功');
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log('⚠ 表或索引已存在，跳过');
        } else {
          console.error('✗ 执行失败:', error.message);
          throw error;
        }
      }
    }
    
    console.log('✅ 用户书签表迁移完成！');
    
  } catch (error) {
    console.error('❌ 迁移失败:', error.message);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  runBookmarkMigration();
}

module.exports = { runBookmarkMigration };