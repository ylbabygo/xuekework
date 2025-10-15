const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function checkMessagesSchema() {
  try {
    console.log('🔍 检查 ai_messages 表结构...');
    
    // 尝试查询表结构
    const { data, error } = await supabase
      .from('ai_messages')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ 查询错误:', error);
      return;
    }
    
    console.log('✅ ai_messages 表查询成功');
    console.log('表中的数据示例:', data);
    
    // 尝试插入一条测试数据来看看哪些字段是必需的
    const testMessage = {
      conversation_id: '00000000-0000-0000-0000-000000000000',
      role: 'user',
      content: 'test message',
      created_at: new Date().toISOString()
    };
    
    console.log('\n🧪 尝试插入测试消息...');
    const { data: insertData, error: insertError } = await supabase
      .from('ai_messages')
      .insert(testMessage)
      .select();
    
    if (insertError) {
      console.error('❌ 插入错误:', insertError);
    } else {
      console.log('✅ 插入成功:', insertData);
      
      // 删除测试数据
      await supabase
        .from('ai_messages')
        .delete()
        .eq('id', insertData[0].id);
      console.log('🗑️ 测试数据已删除');
    }
    
  } catch (error) {
    console.error('❌ 检查失败:', error);
  }
}

checkMessagesSchema();