require('dotenv').config();
const { supabaseAdmin } = require('./src/config/supabase');

async function debugSupabaseDirect() {
  try {
    console.log('🔍 直接查询Supabase数据库中的用户...\n');
    
    // 检查环境变量
    console.log('Supabase环境变量:');
    console.log('- SUPABASE_URL:', process.env.SUPABASE_URL ? '已设置' : '未设置');
    console.log('- SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? '已设置' : '未设置');
    console.log('- SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '已设置' : '未设置');
    
    // 1. 查询所有用户
    console.log('\n1. 查询所有用户...');
    const { data: allUsers, error: allUsersError } = await supabaseAdmin
      .from('users')
      .select('*');
    
    if (allUsersError) {
      console.error('❌ 查询所有用户失败:', allUsersError.message);
    } else {
      console.log(`找到 ${allUsers.length} 个用户:`);
      allUsers.forEach(user => {
        console.log(`- ${user.username} (${user.id}) - ${user.role}`);
      });
    }

    // 2. 查找admin用户
    console.log('\n2. 查找admin用户...');
    const { data: adminUsers, error: adminError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('username', 'admin')
      .eq('is_active', true);
    
    if (adminError) {
      console.error('❌ 查询admin用户失败:', adminError.message);
    } else if (adminUsers.length > 0) {
      const admin = adminUsers[0];
      console.log('找到admin用户:', {
        id: admin.id,
        username: admin.username,
        role: admin.role,
        email: admin.email,
        is_active: admin.is_active
      });
    } else {
      console.log('❌ 未找到admin用户');
    }

  } catch (error) {
    console.error('❌ 调试过程中出现错误:', error.message);
    console.error(error.stack);
  }
}

debugSupabaseDirect();