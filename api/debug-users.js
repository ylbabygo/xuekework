const { createClient } = require('@supabase/supabase-js');

module.exports = async function handler(req, res) {
  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // 处理预检请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 只允许 GET 请求
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: '只允许 GET 请求'
    });
  }

  try {
    // 检查 Supabase 配置
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({
        success: false,
        message: 'Supabase 配置缺失'
      });
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // 查询所有用户（不包含密码）
    const { data: users, error } = await supabase
      .from('users')
      .select('id, username, email, role, created_at')
      .limit(10);
    
    if (error) {
      console.error('数据库查询错误:', error);
      return res.status(500).json({
        success: false,
        message: '数据库查询失败',
        error: error.message
      });
    }

    // 查询用户数量
    const { count, error: countError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('用户计数错误:', countError);
    }

    res.status(200).json({
      success: true,
      message: '用户数据查询成功',
      data: {
        users: users || [],
        totalCount: count || 0,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('调试用户数据错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: error.message
    });
  }
};