const express = require('express');
const cors = require('cors');
const path = require('path');

// 导入应用配置
const { initializeApp } = require('../server/src/app');

// 创建Express应用
const app = express();

// CORS配置
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://xuekework.vercel.app',
    /\.vercel\.app$/
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// 解析JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 健康检查
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: '服务运行正常',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// 初始化应用并设置路由
let appInitialized = false;

async function setupRoutes() {
  if (!appInitialized) {
    try {
      // 初始化数据库和其他服务
      await initializeApp();
      
      // 导入路由
      const routes = require('../server/src/routes');
      app.use('/', routes);
      
      appInitialized = true;
      console.log('Vercel API函数初始化成功');
    } catch (error) {
      console.error('Vercel API函数初始化失败:', error);
      throw error;
    }
  }
}

// Vercel函数处理器
module.exports = async (req, res) => {
  try {
    // 设置CORS头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    // 处理预检请求
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    // 简单的健康检查，不依赖复杂的初始化
    if (req.url === '/health' || req.url === '/api/health') {
      res.status(200).json({
        success: true,
        message: '服务运行正常',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'production'
      });
      return;
    }

    // 确保应用已初始化
    await setupRoutes();
    
    // 处理请求
    app(req, res);
  } catch (error) {
    console.error('API请求处理错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};