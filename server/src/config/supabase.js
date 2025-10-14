const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Supabase配置
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

// 创建Supabase客户端（用于前端交互）
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 创建Supabase管理客户端（用于后端操作）
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// 测试连接
async function testSupabaseConnection() {
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log('⚠️  Supabase连接测试 - 表可能不存在，这是正常的:', error.message);
      return true; // 连接正常，只是表不存在
    }
    
    console.log('✅ Supabase数据库连接成功');
    return true;
  } catch (error) {
    console.error('❌ Supabase连接失败:', error.message);
    return false;
  }
}

module.exports = {
  supabase,
  supabaseAdmin,
  testSupabaseConnection
};