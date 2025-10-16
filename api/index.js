// 完全独立的Vercel函数处理器
module.exports = (req, res) => {
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Content-Type', 'application/json');

  // 处理预检请求
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // 记录请求信息用于调试
  console.log('收到请求:', {
    method: req.method,
    url: req.url,
    headers: req.headers
  });

  // 健康检查端点
  if (req.url === '/health' || req.url === '/api/health' || req.url.endsWith('/health')) {
    res.status(200).json({
      success: true,
      message: '服务运行正常',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'production',
      url: req.url,
      method: req.method
    });
    return;
  }

  // 登录端点测试
  if (req.url === '/api/auth/login' && req.method === 'POST') {
    res.status(200).json({
      success: false,
      message: 'API函数正在工作，但完整功能尚未初始化',
      timestamp: new Date().toISOString()
    });
    return;
  }

  // 其他API端点
  if (req.url && req.url.startsWith('/api/')) {
    res.status(200).json({
      success: true,
      message: 'API端点可访问',
      endpoint: req.url,
      method: req.method,
      timestamp: new Date().toISOString()
    });
    return;
  }

  // 默认响应
  res.status(404).json({
    success: false,
    message: '端点未找到',
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });
};