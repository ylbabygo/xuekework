const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase配置缺失');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugConversations() {
  try {
    console.log('🔍 检查Supabase对话数据...\n');
    
    // 1. 检查所有对话
    console.log('1. 查询所有对话:');
    const { data: conversations, error: convError } = await supabase
      .from('ai_conversations')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (convError) {
      console.error('❌ 查询对话失败:', convError);
    } else {
      console.log(`✅ 找到 ${conversations.length} 个对话:`);
      conversations.forEach((conv, index) => {
        console.log(`  ${index + 1}. ID: ${conv.id}`);
        console.log(`     用户ID: ${conv.user_id}`);
        console.log(`     标题: ${conv.title}`);
        console.log(`     模型: ${conv.model}`);
        console.log(`     创建时间: ${conv.created_at}`);
        console.log('');
      });
    }
    
    // 2. 检查最新对话的详细信息
    if (conversations && conversations.length > 0) {
      const latestConv = conversations[0];
      console.log(`\n2. 检查最新对话 (${latestConv.id}) 的详细信息:`);
      
      // 测试通过ID查找
      const { data: foundConv, error: findError } = await supabase
        .from('ai_conversations')
        .select('*')
        .eq('id', latestConv.id)
        .single();
      
      if (findError) {
        console.error('❌ 通过ID查找对话失败:', findError);
      } else {
        console.log('✅ 通过ID成功找到对话:', foundConv.title);
      }
      
      // 检查该对话的消息
      const { data: messages, error: msgError } = await supabase
        .from('ai_messages')
        .select('*')
        .eq('conversation_id', latestConv.id)
        .order('created_at', { ascending: true });
      
      if (msgError) {
        console.error('❌ 查询消息失败:', msgError);
      } else {
        console.log(`✅ 该对话有 ${messages.length} 条消息`);
        messages.forEach((msg, index) => {
          console.log(`  ${index + 1}. ${msg.role}: ${msg.content.substring(0, 50)}...`);
        });
      }
    }
    
    // 3. 检查用户表
    console.log('\n3. 检查用户数据:');
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id, username, email')
      .limit(5);
    
    if (userError) {
      console.error('❌ 查询用户失败:', userError);
    } else {
      console.log(`✅ 找到 ${users.length} 个用户:`);
      users.forEach(user => {
        console.log(`  - ID: ${user.id}, 用户名: ${user.username}`);
      });
    }
    
  } catch (error) {
    console.error('❌ 调试过程中出错:', error);
  }
}

debugConversations();