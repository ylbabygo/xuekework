const { aiToolsData } = require('../seeds/aiToolsSeeds');
const { initSQLite, query } = require('../config/sqlite');
const { v4: uuidv4 } = require('uuid');

async function seedAITools() {
  try {
    console.log('开始插入AI工具数据...');
    
    // 检查是否已有数据
    const existingTools = await query('SELECT COUNT(*) as count FROM ai_tools');
    if (existingTools[0].count > 0) {
      console.log('AI工具数据已存在，跳过插入');
      return;
    }

    // 插入数据
    for (const tool of aiToolsData) {
      const id = uuidv4();
      const sql = `
        INSERT INTO ai_tools (
          id, name, description, category, url, logo_url, 
          rating, pricing, features, tags, is_featured, 
          view_count, last_synced_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, datetime('now'))
      `;

      await query(sql, [
        id,
        tool.name,
        tool.description,
        tool.category,
        tool.url,
        tool.logo_url,
        tool.rating,
        tool.pricing,
        JSON.stringify(tool.features),
        JSON.stringify(tool.tags),
        tool.is_featured ? 1 : 0
      ]);

      console.log(`插入AI工具: ${tool.name}`);
    }

    console.log('AI工具数据插入完成！');
  } catch (error) {
    console.error('插入AI工具数据失败:', error);
    throw error;
  }
}

async function runSeed() {
  try {
    console.log('开始运行AI工具数据种子...');
    
    // 初始化数据库连接
    await initSQLite();
    console.log('数据库连接已初始化');
    
    await seedAITools();
    console.log('AI工具数据种子运行完成！');
    process.exit(0);
  } catch (error) {
    console.error('运行AI工具数据种子失败:', error);
    process.exit(1);
  }
}

runSeed();