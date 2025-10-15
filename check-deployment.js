const fs = require('fs');
const path = require('path');

console.log('🔍 检查Vercel部署准备状态...\n');

const checks = [
  {
    name: 'Vercel配置文件',
    check: () => fs.existsSync('vercel.json'),
    fix: '请确保根目录存在 vercel.json 文件'
  },
  {
    name: '客户端package.json',
    check: () => fs.existsSync('client/package.json'),
    fix: '请确保 client/package.json 文件存在'
  },
  {
    name: '服务端package.json',
    check: () => fs.existsSync('server/package.json'),
    fix: '请确保 server/package.json 文件存在'
  },
  {
    name: '环境变量示例文件',
    check: () => fs.existsSync('.env.vercel'),
    fix: '请确保 .env.vercel 文件存在'
  },
  {
    name: '部署文档',
    check: () => fs.existsSync('VERCEL_DEPLOYMENT.md'),
    fix: '请确保 VERCEL_DEPLOYMENT.md 文件存在'
  },
  {
    name: '客户端构建脚本',
    check: () => fs.existsSync('client/build.js'),
    fix: '请确保 client/build.js 文件存在'
  },
  {
    name: 'Vercel构建命令',
    check: () => {
      try {
        const pkg = JSON.parse(fs.readFileSync('client/package.json', 'utf8'));
        return pkg.scripts && pkg.scripts['vercel-build'];
      } catch {
        return false;
      }
    },
    fix: '请在 client/package.json 中添加 vercel-build 脚本'
  }
];

let allPassed = true;

checks.forEach((check, index) => {
  const passed = check.check();
  const status = passed ? '✅' : '❌';
  console.log(`${status} ${check.name}`);
  
  if (!passed) {
    console.log(`   💡 ${check.fix}`);
    allPassed = false;
  }
});

console.log('\n' + '='.repeat(50));

if (allPassed) {
  console.log('🎉 所有检查通过！项目已准备好部署到Vercel');
  console.log('\n📋 下一步操作：');
  console.log('1. 在Vercel控制台设置环境变量（参考 .env.vercel）');
  console.log('2. 确保Supabase数据库已配置');
  console.log('3. 运行 vercel --prod 进行部署');
} else {
  console.log('⚠️  发现问题，请修复后重新检查');
  process.exit(1);
}

console.log('\n📖 详细部署指南请查看：VERCEL_DEPLOYMENT.md');