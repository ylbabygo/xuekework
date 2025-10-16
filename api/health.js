// 健康检查端点

module.exports = async function handler(req, res) {
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // 处理预检请求
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  try {
    // 检查数据库连接
    const { testConnection } = require('../server/src/config/database');
    const dbStatus = await testConnection();
    
    // 返回健康状态
    res.status(200).json({
      status: 'healthy',
      message: 'API服务运行正常',
      database: dbStatus ? 'connected' : 'disconnected',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('健康检查错误:', error);
    res.status(500).json({
      status: 'unhealthy',
      message: '服务异常',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};