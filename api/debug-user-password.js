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
    const { username } = req.query;
    
    if (!username) {
      return res.status(400).json({
        success: false,
        message: '请提供用户名参数'
      });
    }

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
    
    // 查询特定用户（包含密码字段用于调试）
    const { data: users, error } = await supabase
      .from('users')
      .select('id, username, email, role, password, created_at')
      .eq('username', username)
      .limit(1);
    
    if (error) {
      console.error('数据库查询错误:', error);
      return res.status(500).json({
        success: false,
        message: '数据库查询失败',
        error: error.message
      });
    }

    if (!users || users.length === 0) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    const user = users[0];

    res.status(200).json({
      success: true,
      message: '用户数据查询成功',
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          created_at: user.created_at,
          passwordExists: !!user.password,
          passwordLength: user.password ? user.password.length : 0,
          passwordStartsWith: user.password ? user.password.substring(0, 10) + '...' : null,
          passwordType: user.password ? (user.password.startsWith('$2') ? 'bcrypt' : 'plain') : null
        },
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('调试用户密码错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: error.message
    });
  }
};