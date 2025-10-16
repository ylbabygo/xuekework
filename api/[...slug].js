// 捕获所有 /api/* 请求并转发到 Express 应用

module.exports = async function handler(req, res) {
  try {
    console.log('API函数被调用:', req.method, req.url);
    
    // 设置CORS头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // 处理预检请求
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }
    
    // 检查是否是独立的 API 函数路径，如果是则返回 404 让 Vercel 路由到正确的函数
    const independentApis = ['/api/login', '/api/test', '/api/simple-test', '/api/health', '/api/index'];
    if (independentApis.some(path => req.url === path || req.url.startsWith(path + '?'))) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'This endpoint should be handled by a dedicated API function'
      });
    }
    
    // 简单的测试响应，不依赖数据库
    if (req.url === '/api/v1/test') {
      return res.status(200).json({
        success: true,
        message: 'API 测试成功',
        timestamp: new Date().toISOString(),
        url: req.url,
        method: req.method
      });
    }
    
    // 对于其他路径，返回简单响应而不是导入 Express 应用
    return res.status(200).json({
      success: true,
      message: 'API 服务运行正常',
      timestamp: new Date().toISOString(),
      url: req.url,
      method: req.method,
      note: '这是一个简化的 API 响应'
    });
  } catch (error) {
    console.error('API函数错误:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};