const fs = require('fs');
const path = require('path');
const { query, initSQLite } = require('../config/sqlite');

async function runMigration() {
  try {
    console.log('开始执行数据库迁移...');
    
    // 初始化数据库连接
    await initSQLite();
    console.log('数据库连接已建立');
    
    // 读取迁移文件
    const migrationPath = path.join(__dirname, '../database/migrations/001_add_ai_tools_fields.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // 分割SQL语句并分组
    const allStatements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    // 分组：ALTER TABLE语句先执行，然后是CREATE INDEX语句，最后是UPDATE语句
    const alterStatements = allStatements.filter(stmt => stmt.toUpperCase().startsWith('ALTER TABLE'));
    const indexStatements = allStatements.filter(stmt => stmt.toUpperCase().startsWith('CREATE INDEX'));
    const updateStatements = allStatements.filter(stmt => stmt.toUpperCase().startsWith('UPDATE'));
    
    console.log(`找到 ${alterStatements.length} 条ALTER语句, ${indexStatements.length} 条INDEX语句, ${updateStatements.length} 条UPDATE语句`);
    
    // 执行ALTER TABLE语句
    console.log('执行ALTER TABLE语句...');
    for (let i = 0; i < alterStatements.length; i++) {
      const statement = alterStatements[i];
      console.log(`执行ALTER语句 ${i + 1}...`);
      
      try {
        await query(statement);
        console.log(`✓ ALTER语句 ${i + 1} 执行成功`);
      } catch (error) {
        if (error.message.includes('duplicate column name')) {
          console.log(`⚠ ALTER语句 ${i + 1} 跳过（字段已存在）`);
          continue;
        }
        throw error;
      }
    }
    
    // 执行CREATE INDEX语句
    console.log('执行CREATE INDEX语句...');
    for (let i = 0; i < indexStatements.length; i++) {
      const statement = indexStatements[i];
      console.log(`执行INDEX语句 ${i + 1}...`);
      
      try {
        await query(statement);
        console.log(`✓ INDEX语句 ${i + 1} 执行成功`);
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log(`⚠ INDEX语句 ${i + 1} 跳过（索引已存在）`);
          continue;
        }
        throw error;
      }
    }
    
    // 执行UPDATE语句
    console.log('执行UPDATE语句...');
    for (let i = 0; i < updateStatements.length; i++) {
      const statement = updateStatements[i];
      console.log(`执行UPDATE语句 ${i + 1}...`);
      
      try {
        await query(statement);
        console.log(`✓ UPDATE语句 ${i + 1} 执行成功`);
      } catch (error) {
        console.log(`⚠ UPDATE语句 ${i + 1} 执行失败: ${error.message}`);
        // UPDATE语句失败不中断迁移
      }
    }
    
    console.log('✅ 数据库迁移完成！');
    
  } catch (error) {
    console.error('❌ 数据库迁移失败:', error);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  runMigration().then(() => {
    console.log('迁移脚本执行完毕');
    process.exit(0);
  }).catch(error => {
    console.error('迁移脚本执行失败:', error);
    process.exit(1);
  });
}

module.exports = { runMigration };