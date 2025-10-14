# 学科运营AI工作台 - Git初始化脚本

Write-Host "🚀 开始初始化Git仓库..." -ForegroundColor Green

# 检查是否已经是Git仓库
if (Test-Path ".git") {
    Write-Host "⚠️  检测到已存在的Git仓库，将重新初始化..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force ".git"
}

# 初始化Git仓库
Write-Host "📁 初始化Git仓库..." -ForegroundColor Cyan
git init

# 添加所有文件
Write-Host "📝 添加项目文件..." -ForegroundColor Cyan
git add .

# 创建初始提交
Write-Host "💾 创建初始提交..." -ForegroundColor Cyan
git commit -m "🎉 初始提交: 学科运营AI工作台

✨ 功能特性:
- 🤖 AI智能助手 - 自然语言对话，智能调用平台功能
- 📝 文案生成 - 多模板文案一键生成，支持多种营销场景
- 📊 数据分析 - 智能数据处理和可视化分析
- 📚 智能物料库 - AI驱动的素材管理和智能检索
- 📋 个人效率工具 - 记事本和待办清单管理
- 🔧 AI工具聚合 - 百大AI工具推荐和集成
- ⚙️ 个性化设置 - API配置、主题切换、安全管理

🏗️ 技术架构:
- 前端: React 18 + TypeScript + Tailwind CSS
- 后端: Node.js + Express + TypeScript
- 存储: 本地存储 + 文件系统
- AI集成: 支持多种AI服务API

👥 用户系统:
- 超级管理员: zhangshuang, yuli
- 普通用户: lichengcheng, liuli, wangxin"

Write-Host "✅ Git仓库初始化完成!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 下一步操作:" -ForegroundColor Yellow
Write-Host "1. 在GitHub上创建新仓库 'xueke-ai-workspace'" -ForegroundColor White
Write-Host "2. 运行以下命令连接到GitHub仓库:" -ForegroundColor White
Write-Host "   git remote add origin https://github.com/YOUR_USERNAME/xueke-ai-workspace.git" -ForegroundColor Gray
Write-Host "3. 推送代码到GitHub:" -ForegroundColor White
Write-Host "   git branch -M main" -ForegroundColor Gray
Write-Host "   git push -u origin main" -ForegroundColor Gray
Write-Host ""
Write-Host "🌟 项目已准备就绪，可以上传到GitHub!" -ForegroundColor Green