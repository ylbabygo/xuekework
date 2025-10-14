const { supabaseAdmin } = require('../config/supabase');

async function testSupabaseConnection() {
  try {
    console.log('🔍 测试Supabase连接和表结构...');
    
    // 测试各个表是否存在
    const tables = [
      'users', 'user_settings', 'ai_conversations', 'ai_messages',
      'content_generations', 'notes', 'todo_lists', 'todo_items',
      'ai_tools', 'user_ai_tool_favorites', 'system_logs'
    ];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabaseAdmin
          .from(table)
          .select('*')
          .limit(1);
        
        if (error) {
          console.log(`❌ 表 ${table} 不存在或无法访问: ${error.message}`);
        } else {
          console.log(`✅ 表 ${table} 存在且可访问`);
        }
      } catch (err) {
        console.log(`❌ 表 ${table} 测试失败: ${err.message}`);
      }
    }
    
    // 测试插入一个测试用户
    console.log('\n🧪 测试用户操作...');
    
    // 先检查是否已有测试用户
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('username', 'test_user')
      .single();
    
    if (existingUser) {
      console.log('✅ 测试用户已存在');
    } else {
      // 创建测试用户
      const { data: newUser, error: createError } = await supabaseAdmin
        .from('users')
        .insert({
          username: 'test_user',
          email: 'test@example.com',
          password_hash: '$2b$10$test.hash.here'
        })
        .select()
        .single();
      
      if (createError) {
        console.log('❌ 创建测试用户失败:', createError.message);
      } else {
        console.log('✅ 测试用户创建成功:', newUser.username);
      }
    }
    
    // 测试查询用户
    const { data: users, error: queryError } = await supabaseAdmin
      .from('users')
      .select('username, email, created_at')
      .limit(5);
    
    if (queryError) {
      console.log('❌ 查询用户失败:', queryError.message);
    } else {
      console.log(`✅ 查询用户成功，共 ${users.length} 个用户:`);
      users.forEach(user => {
        console.log(`  - ${user.username} (${user.email})`);
      });
    }
    
    console.log('\n🎉 Supabase连接测试完成！');
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

// 运行测试
testSupabaseConnection();