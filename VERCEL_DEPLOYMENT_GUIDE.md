# Vercel + Supabase 部署指南

## 🎯 **部署架构**

```
Vercel (全栈托管)
├── 前端 (React) - 静态文件
├── 后端 (Node.js) - Serverless 函数
└── 数据库 (Supabase) - 已配置完成
```

## ✅ **已完成的配置**

### 1. Vercel 配置文件 (`vercel.json`)
```json
{
  "version": 2,
  "builds": [
    {
      "src": "client/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    },
    {
      "src": "api/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/index.js"
    },
    {
      "src": "/health",
      "dest": "/api/index.js"
    },
    {
      "src": "/(.*)",
      "dest": "/client/build/index.html"
    }
  ]
}
```

### 2. API 入口文件 (`api/index.js`)
- 已创建 Vercel Serverless 函数入口
- 自动导入后端应用逻辑

### 3. Supabase 数据库
- ✅ 连接正常
- ✅ 表结构完整
- ✅ 环境变量配置正确

## 🚀 **部署步骤**

### 第一步：安装 Vercel CLI
```bash
npm install -g vercel
```

### 第二步：登录 Vercel
```bash
vercel login
```

### 第三步：部署项目
```bash
# 在项目根目录执行
vercel

# 或者直接部署到生产环境
vercel --prod
```

### 第四步：配置环境变量
在 Vercel 控制台添加以下环境变量：

```bash
# Supabase 配置
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

# 前端构建配置
GENERATE_SOURCEMAP=false
ESLINT_NO_DEV_ERRORS=true
TSC_COMPILE_ON_ERROR=true
DISABLE_ESLINT_PLUGIN=true
```

## 🔧 **Vercel 控制台配置**

### 1. 项目设置
- **Framework Preset**: Other
- **Root Directory**: `./`
- **Build Command**: `cd client && npm run build`
- **Output Directory**: `client/build`
- **Install Command**: `npm install && cd client && npm install && cd ../server && npm install`

### 2. 环境变量
在 Vercel 项目设置 → Environment Variables 中添加上述所有环境变量

### 3. 域名配置
- Vercel 会自动分配域名：`your-project.vercel.app`
- 可以配置自定义域名

## 📋 **部署后的 URL 结构**

```
https://your-project.vercel.app/          # 前端应用
https://your-project.vercel.app/health    # 健康检查
https://your-project.vercel.app/api/v1/*  # API 接口
```

## ✅ **优势对比**

| 特性 | Vercel | Railway |
|------|--------|---------|
| 免费额度 | ✅ 支持全栈 | ❌ 仅数据库 |
| 部署速度 | ✅ 极快 | ⚠️ 较慢 |
| 配置复杂度 | ✅ 简单 | ⚠️ 复杂 |
| Serverless | ✅ 原生支持 | ❌ 不支持 |
| 自动扩展 | ✅ 自动 | ⚠️ 手动 |

## 🧪 **本地测试**

部署前确保本地环境正常：
```bash
# 后端测试
cd server
npm start
# 访问: http://localhost:5000/health

# 前端测试  
cd client
npm start
# 访问: http://localhost:3000
```

## 🎉 **预期结果**

部署成功后，你将获得：
- ✅ 完全免费的全栈应用
- ✅ 自动 HTTPS 和 CDN
- ✅ 全球边缘节点加速
- ✅ 自动扩展和高可用
- ✅ 与 Supabase 完美集成

**这个方案比 Railway 更适合你的项目！**