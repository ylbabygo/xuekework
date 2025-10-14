# 部署平台选择脚本
Write-Host "=== Supabase后端部署平台选择 ===" -ForegroundColor Green

Write-Host "`n可选的部署平台：" -ForegroundColor Yellow
Write-Host "1. Vercel全栈 (推荐) - 前后端统一管理" -ForegroundColor Cyan
Write-Host "2. Railway - 独立后端服务" -ForegroundColor Cyan  
Write-Host "3. Render - 免费层友好" -ForegroundColor Cyan
Write-Host "4. Supabase Edge Functions - 原生集成" -ForegroundColor Cyan

$choice = Read-Host "`n请选择部署平台 (1-4)"

switch ($choice) {
    "1" {
        Write-Host "`n✅ 选择了 Vercel全栈部署" -ForegroundColor Green
        Write-Host "优势：统一管理、配置简单、免费额度充足" -ForegroundColor White
        Write-Host "适合：中小型项目、快速原型" -ForegroundColor White
        Write-Host "`n📚 详细指南：VERCEL_FULLSTACK_DEPLOYMENT.md" -ForegroundColor Yellow
        
        $confirm = Read-Host "`n是否开始Vercel全栈部署？(y/n)"
        if ($confirm -eq "y") {
            Write-Host "`n🚀 开始Vercel全栈部署..." -ForegroundColor Green
            Write-Host "1. 访问 https://vercel.com" -ForegroundColor Cyan
            Write-Host "2. 使用GitHub登录" -ForegroundColor Cyan
            Write-Host "3. 导入你的仓库" -ForegroundColor Cyan
            Write-Host "4. 设置根目录为 'client'" -ForegroundColor Cyan
            Write-Host "5. 配置环境变量：" -ForegroundColor Cyan
            Write-Host @"
SUPABASE_URL=https://jnvdwevywpsgunnvcxys.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpudmR3ZXZ5d3BzZ3VubnZjeHlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzNzE1MTQsImV4cCI6MjA3NTk0NzUxNH0.HQUxA5cRhc-GrC_G12OFreR7yyWHgAVPK7Hiv46nShY
JWT_SECRET=your-super-secret-jwt-key
REACT_APP_API_URL=/api/v1
"@ -ForegroundColor Gray
        }
    }
    "2" {
        Write-Host "`n✅ 选择了 Railway部署" -ForegroundColor Green
        Write-Host "优势：支持持久化、无冷启动、适合长时间运行" -ForegroundColor White
        Write-Host "适合：需要后台任务、WebSocket、文件处理" -ForegroundColor White
        Write-Host "`n📚 详细指南：SUPABASE_VERCEL_DEPLOYMENT.md" -ForegroundColor Yellow
        
        $confirm = Read-Host "`n是否开始Railway部署？(y/n)"
        if ($confirm -eq "y") {
            Write-Host "`n🚂 开始Railway部署..." -ForegroundColor Green
            Write-Host "1. 访问 https://railway.app" -ForegroundColor Cyan
            Write-Host "2. 使用GitHub登录" -ForegroundColor Cyan
            Write-Host "3. 创建新项目 -> Deploy from GitHub repo" -ForegroundColor Cyan
            Write-Host "4. 选择你的仓库" -ForegroundColor Cyan
            Write-Host "5. 配置环境变量：" -ForegroundColor Cyan
            Write-Host @"
NODE_ENV=production
PORT=3001
SUPABASE_URL=https://jnvdwevywpsgunnvcxys.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpudmR3ZXZ5d3BzZ3VubnZjeHlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzNzE1MTQsImV4cCI6MjA3NTk0NzUxNH0.HQUxA5cRhc-GrC_G12OFreR7yyWHgAVPK7Hiv46nShY
JWT_SECRET=your-super-secret-jwt-key
USE_SUPABASE=true
"@ -ForegroundColor Gray
        }
    }
    "3" {
        Write-Host "`n✅ 选择了 Render部署" -ForegroundColor Green
        Write-Host "优势：免费层慷慨、自动部署、支持Docker" -ForegroundColor White
        Write-Host "注意：免费层有休眠机制" -ForegroundColor Yellow
        
        $confirm = Read-Host "`n是否开始Render部署？(y/n)"
        if ($confirm -eq "y") {
            Write-Host "`n🌐 开始Render部署..." -ForegroundColor Green
            Write-Host "1. 访问 https://render.com" -ForegroundColor Cyan
            Write-Host "2. 使用GitHub登录" -ForegroundColor Cyan
            Write-Host "3. 创建新的Web Service" -ForegroundColor Cyan
            Write-Host "4. 连接你的仓库" -ForegroundColor Cyan
            Write-Host "5. 设置构建命令：cd server && npm install" -ForegroundColor Cyan
            Write-Host "6. 设置启动命令：cd server && npm start" -ForegroundColor Cyan
        }
    }
    "4" {
        Write-Host "`n✅ 选择了 Supabase Edge Functions" -ForegroundColor Green
        Write-Host "优势：与Supabase深度集成、全球边缘计算" -ForegroundColor White
        Write-Host "适合：API密集型应用" -ForegroundColor White
        
        $confirm = Read-Host "`n是否开始Edge Functions部署？(y/n)"
        if ($confirm -eq "y") {
            Write-Host "`n⚡ 开始Edge Functions部署..." -ForegroundColor Green
            Write-Host "1. 安装 Supabase CLI" -ForegroundColor Cyan
            Write-Host "2. 初始化项目：supabase init" -ForegroundColor Cyan
            Write-Host "3. 创建函数：supabase functions new auth" -ForegroundColor Cyan
            Write-Host "4. 部署函数：supabase functions deploy" -ForegroundColor Cyan
        }
    }
    default {
        Write-Host "`n❌ 无效选择，请重新运行脚本" -ForegroundColor Red
    }
}

Write-Host "`n📋 需要帮助？查看对应的部署文档：" -ForegroundColor Yellow
Write-Host "- Vercel全栈：VERCEL_FULLSTACK_DEPLOYMENT.md" -ForegroundColor Cyan
Write-Host "- Railway：SUPABASE_VERCEL_DEPLOYMENT.md" -ForegroundColor Cyan
Write-Host "- 部署检查清单：DEPLOYMENT_CHECKLIST.md" -ForegroundColor Cyan