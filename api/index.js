// 设置环境变量
process.env.NODE_ENV = process.env.NODE_ENV || 'production';
// 在Vercel环境中使用SQLite，除非明确配置了Supabase
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  process.env.DATABASE_TYPE = 'sqlite';
} else {
  process.env.DATABASE_TYPE = 'supabase';
}

console.log('🚀 Vercel函数启动');
console.log('📊 环境变量检查:');
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- DATABASE_TYPE:', process.env.DATABASE_TYPE);
console.log('- SUPABASE_URL:', process.env.SUPABASE_URL ? '✅ 已设置' : '❌ 未设置');
console.log('- SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? '✅ 已设置' : '❌ 未设置');
console.log('- SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ 已设置' : '❌ 未设置');
console.log('- DB_PASSWORD:', process.env.DB_PASSWORD ? '✅ 已设置' : '❌ 未设置');

// 测试数据库连接（异步）
(async () => {
  try {
    const { testSupabaseConnection } = require('../server/src/config/supabase');
    const isConnected = await testSupabaseConnection();
    console.log('📊 数据库连接测试结果:', isConnected);
  } catch (dbError) {
    console.error('❌ 数据库连接测试失败:', dbError.message);
  }
})();

try {
  // 导入服务器应用
  const app = require('../server/src/app');
  
  // 包装处理函数以捕获错误
  module.exports = (req, res) => {
    try {
      console.log(`📥 收到请求: ${req.method} ${req.url}`);
      console.log(`📋 请求头:`, JSON.stringify(req.headers, null, 2));
      
      // 设置CORS头 - 修复安全冲突
      const origin = req.headers.origin;
      const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3001',
        'https://xueke-ai-frontend.vercel.app',
        'https://xueke-ai.vercel.app'
      ];
      
      // 检查是否是允许的域名或Vercel域名
      if (allowedOrigins.includes(origin) || (origin && origin.includes('.vercel.app'))) {
        res.setHeader('Access-Control-Allow-Origin', origin);
      }
      
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      
      // 处理预检请求
      if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
      }
      
      return app(req, res);
    } catch (error) {
      console.error('❌ 请求处理错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器内部错误',
        error: error.message
      });
    }
  };
} catch (error) {
  console.error('❌ 应用初始化错误:', error);
  module.exports = (req, res) => {
    res.status(500).json({
      success: false,
      message: '应用初始化失败',
      error: error.message
    });
  };
}