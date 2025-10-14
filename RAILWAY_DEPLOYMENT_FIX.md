# Railway部署修复指南

## 🚨 当前问题分析

### 主要问题
1. **账户限制**: Railway免费账户只能部署数据库，不能部署Web应用
2. **配置错误**: 健康检查路径和启动命令配置错误
3. **环境变量**: 需要在Railway控制台配置环境变量

## ✅ 已修复的配置

### 1. Railway配置文件 (railway.json)
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "cd server && npm install"
  },
  "deploy": {
    "startCommand": "cd server && node src/server.js",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 300,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 3
  }
}
```

### 2. Procfile
```
web: cd server && node src/server.js
```

## 🔧 Railway控制台配置步骤

### 1. 升级账户计划
- Railway免费账户无法部署Web应用
- 需要升级到付费计划才能部署应用服务
- 或者考虑使用其他免费平台如Vercel、Netlify等

### 2. 环境变量配置
在Railway控制台的Variables标签页添加以下环境变量：

```bash
# Supabase配置
SUPABASE_URL=https://lswsibrtmiugjdadujvu.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxzd3NpYnJ0bWl1Z2pkYWR1anZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzOTE5NTIsImV4cCI6MjA3NTk2Nzk1Mn0.gly4nRZDULivMWK-bXNcn2tOiJwmIzoig5aokysWQDs
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxzd3NpYnJ0bWl1Z2pkYWR1anZ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDM5MTk1MiwiZXhwIjoyMDc1OTY3OTUyfQ.KudVxPoQK6kMIHJtPb6ETxmfJPKokUDrVVN49ZQNUoc

# 数据库配置
DATABASE_TYPE=supabase
DB_HOST=db.lswsibrtmiugjdadujvu.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres

# 应用配置
NODE_ENV=production
JWT_SECRET=xueke-ai-workspace-secret-key-2024
JWT_EXPIRES_IN=7d

# 限流配置
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 3. 部署设置
- **启动命令**: `cd server && node src/server.js`
- **健康检查路径**: `/health`
- **构建命令**: `cd server && npm install`

## 🔄 替代方案

由于Railway免费账户限制，建议考虑以下替代方案：

### 1. Vercel (推荐)
- 免费支持全栈应用
- 已有配置文件 `vercel.json`
- 支持Serverless函数

### 2. Netlify
- 免费支持静态网站和函数
- 适合前端部署

### 3. Heroku
- 免费层已停止，但付费计划相对便宜
- 配置简单

## 📝 下一步操作

1. **升级Railway账户** 或 **选择替代平台**
2. **配置环境变量**
3. **重新部署应用**
4. **测试部署结果**

## 🧪 本地测试

确保本地环境正常运行：
```bash
# 后端
cd server
npm start

# 前端
cd client
npm start
```

- 后端: http://localhost:5000
- 前端: http://localhost:3000
- 健康检查: http://localhost:5000/health