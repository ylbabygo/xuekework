// 捕获所有 /api/* 请求并转发到 Express 应用

module.exports = async function handler(req, res) {
  try {
    // 设置CORS头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // 处理预检请求
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }
    
    // 导入Express应用
    const app = require('../server/src/app');
    
    // 确保数据库已初始化
    const { initializeApp } = require('../server/src/app');
    await initializeApp();
    
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