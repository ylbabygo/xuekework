const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase配置缺失');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testCreateConversation() {
  try {
    console.log('🧪 直接测试Supabase创建对话...\n');
    
    // 1. 先查询一个用户ID
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id, username')
      .limit(1);
    
    if (userError || !users || users.length === 0) {
      console.error('❌ 无法获取用户:', userError);
      return;
    }
    
    const userId = users[0].id;
    console.log('✅ 使用用户:', users[0].username, '(ID:', userId, ')');
    
    // 2. 创建对话数据
    const conversationData = {
      id: uuidv4(),
      user_id: userId,
      title: '直接测试对话',
      model: 'gpt-3.5-turbo'
    };
    
    console.log('\n📝 准备创建对话数据:');
    console.log(JSON.stringify(conversationData, null, 2));
    
    // 3. 插入对话
    const { data: conversation, error: createError } = await supabase
      .from('ai_conversations')
      .insert(conversationData)
      .select()
      .single();
    
    if (createError) {
      console.error('❌ 创建对话失败:', createError);
      return;
    }
    
    console.log('\n✅ 对话创建成功:');
    console.log(JSON.stringify(conversation, null, 2));
    
    // 4. 验证对话是否真的存在
    const { data: foundConv, error: findError } = await supabase
      .from('ai_conversations')
      .select('*')
      .eq('id', conversation.id)
      .single();
    
    if (findError) {
      console.error('❌ 查找刚创建的对话失败:', findError);
    } else {
      console.log('\n✅ 验证成功，对话确实存在:');
      console.log('标题:', foundConv.title);
      console.log('用户ID:', foundConv.user_id);
      console.log('模型:', foundConv.model);
    }
    
    // 5. 查询所有对话
    const { data: allConversations, error: allError } = await supabase
      .from('ai_conversations')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (allError) {
      console.error('❌ 查询所有对话失败:', allError);
    } else {
      console.log(`\n📊 数据库中总共有 ${allConversations.length} 个对话`);
    }
    
  } catch (error) {
    console.error('❌ 测试过程中出错:', error);
  }
}

testCreateConversation();