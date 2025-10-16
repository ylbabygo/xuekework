// Vercel API函数 - 处理所有API请求
import { createServer } from 'http';

// 动态导入Express应用
let app;

async function getApp() {
  if (!app) {
    // 使用动态导入来加载CommonJS模块
    const appModule = await import('../server/src/app.js');
    app = appModule.default || appModule;
  }
  return app;
}

export default async function handler(req, res) {
  try {
    const expressApp = await getApp();
    
    // 设置CORS头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // 处理预检请求
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }
    
    // 调用Express应用
    return expressApp(req, res);
  } catch (error) {
    console.error('API函数错误:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
}