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

  try {
    // 检查 Supabase 连接
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase 配置缺失');
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // 简单的连接测试
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .limit(1);
    
    if (error) {
      throw new Error(`Supabase 连接失败: ${error.message}`);
    }

    res.status(200).json({
      status: 'healthy',
      message: '所有服务正常',
      timestamp: new Date().toISOString(),
      services: {
        supabase: 'connected'
      },
      environment: {
        supabaseUrl: supabaseUrl ? 'configured' : 'missing',
        supabaseKey: supabaseKey ? 'configured' : 'missing'
      }
    });
  } catch (error) {
    console.error('健康检查失败:', error);
    res.status(500).json({
      status: 'unhealthy',
      message: '服务异常',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};