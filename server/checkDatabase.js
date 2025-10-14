const { supabaseAdmin } = require('./src/config/supabase');

async function checkTables() {
  try {
    console.log('🔍 检查Supabase数据库表结构...');
    
    // 检查主要表是否存在
    const tables = ['users', 'user_settings', 'ai_conversations', 'ai_messages', 'content_generations'];
    
    for (const table of tables) {
      const { data, error } = await supabaseAdmin
        .from(table)
        .select('*')
        .limit(1);
      
      if (error && error.code === 'PGRST116') {
        console.log(`❌ 表 ${table} 不存在`);
      } else if (error) {
        console.log(`⚠️  表 ${table} 检查出错: ${error.message}`);
      } else {
        console.log(`✅ 表 ${table} 存在`);
      }
    }
    
    console.log('\n📊 数据库检查完成');
  } catch (error) {
    console.error('❌ 检查失败:', error.message);
  }
}

checkTables();