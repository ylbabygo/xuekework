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
    
    // 导入Express应用
    const app = require('../server/src/app');
    
    // 尝试初始化数据库（如果失败，继续运行但记录错误）
    try {
      const { initializeApp } = require('../server/src/app');
      await initializeApp();
      console.log('数据库初始化成功');
    } catch (dbError) {
      console.error('数据库初始化失败，但继续运行:', dbError.message);
    }
    
    // 调用Express应用
    return app(req, res);
  } catch (error) {
    console.error('API函数错误:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};