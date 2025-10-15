const { execSync } = require('child_process');
require('dotenv').config({ path: './server/.env' });

console.log('🔧 设置Vercel环境变量...\n');

// 需要设置的环境变量
const envVars = [
  { key: 'SUPABASE_URL', value: process.env.SUPABASE_URL },
  { key: 'SUPABASE_ANON_KEY', value: process.env.SUPABASE_ANON_KEY },
  { key: 'SUPABASE_SERVICE_ROLE_KEY', value: process.env.SUPABASE_SERVICE_ROLE_KEY },
  { key: 'JWT_SECRET', value: process.env.JWT_SECRET || 'xueke_ai_jwt_secret_2024_production_key_minimum_32_chars' },
  { key: 'JWT_EXPIRES_IN', value: '7d' },
  { key: 'NODE_ENV', value: 'production' },
  { key: 'USE_SUPABASE', value: 'true' },
  { key: 'DATABASE_TYPE', value: 'supabase' },
  { key: 'RATE_LIMIT_WINDOW_MS', value: '900000' },
  { key: 'RATE_LIMIT_MAX_REQUESTS', value: '100' },
  { key: 'REACT_APP_API_URL', value: '/api/v1' },
  { key: 'REACT_APP_NAME', value: '学科AI工作台' },
  { key: 'REACT_APP_VERSION', value: '1.0.0' },
  { key: 'GENERATE_SOURCEMAP', value: 'false' }
];

// 检查必需的环境变量
const requiredVars = ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY'];
const missingVars = requiredVars.filter(key => !process.env[key]);

if (missingVars.length > 0) {
  console.error('❌ 缺少必需的环境变量:');
  missingVars.forEach(key => console.error(`   - ${key}`));
  console.error('\n请确保在 server/.env 文件中设置了这些变量');
  process.exit(1);
}

// 设置环境变量
console.log('设置环境变量到Vercel...\n');

envVars.forEach(({ key, value }) => {
  if (value) {
    try {
      console.log(`✅ 设置 ${key}`);
      execSync(`vercel env add ${key} production`, {
        input: value + '\n',
        stdio: ['pipe', 'pipe', 'inherit']
      });
    } catch (error) {
      console.log(`⚠️  ${key} 可能已存在或设置失败`);
    }
  } else {
    console.log(`⚠️  跳过 ${key} (值为空)`);
  }
});

console.log('\n🎉 环境变量设置完成！');
console.log('\n📋 下一步：');
console.log('1. 访问你的Vercel项目: https://xuekework-2hgrcjvvr-yulis-projects-ad9ada99.vercel.app');
console.log('2. 如果需要重新部署: vercel --prod');
console.log('3. 查看部署日志: vercel logs');