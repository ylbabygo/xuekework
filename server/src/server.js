require('dotenv').config();
const { app, initializeApp } = require('./app');

// 服务器配置
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || 'localhost';

// 启动服务器
async function startServer() {
  try {
    // 初始化应用（数据库等）
    const initialized = await initializeApp();
    if (!initialized) {
      console.error('应用初始化失败，服务器启动中止');
      process.exit(1);
    }
    
    // 启动HTTP服务器
    const server = app.listen(PORT, HOST, () => {
      console.log(`
╔══════════════════════════════════════════════════════════════╗
║                    学科AI工作台 - 后端服务                      ║
╠══════════════════════════════════════════════════════════════╣
║  服务器地址: http://${HOST}:${PORT}                           ║
║  环境模式: ${process.env.NODE_ENV || 'development'}                                    ║
║  启动时间: ${new Date().toLocaleString('zh-CN')}                    ║
╚══════════════════════════════════════════════════════════════╝
      `);
      
      console.log('🚀 服务器启动成功！');
      console.log('📚 API文档: http://' + HOST + ':' + PORT + '/api-docs');
      console.log('💓 健康检查: http://' + HOST + ':' + PORT + '/health');
    });
    
    // 服务器错误处理
    server.on('error', (error) => {
      if (error.syscall !== 'listen') {
        throw error;
      }
      
      const bind = typeof PORT === 'string' ? 'Pipe ' + PORT : 'Port ' + PORT;
      
      switch (error.code) {
        case 'EACCES':
          console.error(`${bind} 需要提升权限`);
          process.exit(1);
          break;
        case 'EADDRINUSE':
          console.error(`${bind} 已被占用`);
          process.exit(1);
          break;
        default:
          throw error;
      }
    });
    
    // 优雅关闭
    const gracefulShutdown = () => {
      console.log('\n正在优雅关闭服务器...');
      server.close(() => {
        console.log('HTTP服务器已关闭');
        process.exit(0);
      });
      
      // 强制关闭超时
      setTimeout(() => {
        console.error('强制关闭服务器');
        process.exit(1);
      }, 10000);
    };
    
    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);
    
  } catch (error) {
    console.error('服务器启动失败:', error);
    process.exit(1);
  }
}

// 启动服务器
startServer();