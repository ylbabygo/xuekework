const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 开始构建客户端应用...');

try {
  // 设置生产环境变量
  process.env.NODE_ENV = 'production';
  process.env.GENERATE_SOURCEMAP = 'false';
  
  // 如果是Vercel环境，使用相对路径
  if (process.env.VERCEL) {
    process.env.REACT_APP_API_URL = '/api/v1';
  }
  
  // 执行构建
  execSync('npm run build', { stdio: 'inherit' });
  
  console.log('✅ 客户端构建完成！');
  
  // 检查构建产物
  const buildDir = path.join(__dirname, 'build');
  if (fs.existsSync(buildDir)) {
    const files = fs.readdirSync(buildDir);
    console.log(`📦 构建产物包含 ${files.length} 个文件/目录`);
  }
  
} catch (error) {
  console.error('❌ 构建失败:', error.message);
  process.exit(1);
}