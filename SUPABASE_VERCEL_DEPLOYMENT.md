# Supabase后端 + Vercel前端部署指南

## 📋 部署概览

本指南将帮助你将学科AI工作台部署到生产环境：
- **后端**: Supabase数据库 + Railway/Render托管
- **前端**: Vercel托管

## 🚀 第一步：部署Supabase后端到Railway

### 1.1 准备Railway部署

1. **注册Railway账号**
   - 访问 [Railway.app](https://railway.app)
   - 使用GitHub账号登录

2. **创建新项目**
   - 点击 "New Project"
   - 选择 "Deploy from GitHub repo"
   - 选择你的仓库

3. **配置环境变量**
   在Railway项目设置中添加以下环境变量：
   ```
   NODE_ENV=production
   PORT=3001
   
   # Supabase配置
   SUPABASE_URL=https://jnvdwevywpsgunnvcxys.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=你的服务密钥
   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpudmR3ZXZ5d3BzZ3VubnZjeHlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzNzE1MTQsImV4cCI6MjA3NTk0NzUxNH0.HQUxA5cRhc-GrC_G12OFreR7yyWHgAVPK7Hiv46nShY
   
   # JWT配置
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRES_IN=7d
   
   # 应用配置
   USE_SUPABASE=true
   CORS_ORIGIN=https://your-vercel-app.vercel.app
   ```

### 1.2 部署配置

Railway会自动检测到 `railway.json` 配置文件并按以下设置部署：
- 构建命令: `cd server && npm install`
- 启动命令: `cd server && npm start`
- 健康检查: `/api/v1/health`

## 🌐 第二步：部署前端到Vercel

### 2.1 准备Vercel部署

1. **注册Vercel账号**
   - 访问 [Vercel.com](https://vercel.com)
   - 使用GitHub账号登录

2. **导入项目**
   - 点击 "New Project"
   - 选择你的GitHub仓库
   - 设置根目录为 `client`

### 2.2 配置Vercel项目设置

**Framework Preset**: Create React App
**Root Directory**: `client`
**Build Command**: `npm run build`
**Output Directory**: `build`
**Install Command**: `npm install`

### 2.3 配置环境变量

在Vercel项目设置中添加以下环境变量：

```
# API配置 - 替换为你的Railway后端URL
REACT_APP_API_URL=https://your-railway-app.railway.app/api/v1

# Supabase配置
REACT_APP_SUPABASE_URL=https://jnvdwevywpsgunnvcxys.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpudmR3ZXZ5d3BzZ3VubnZjeHlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzNzE1MTQsImV4cCI6MjA3NTk0NzUxNH0.HQUxA5cRhc-GrC_G12OFreR7yyWHgAVPK7Hiv46nShY

# 应用配置
REACT_APP_NAME=学科运营AI工作台
REACT_APP_VERSION=1.0.0

# 构建优化
GENERATE_SOURCEMAP=false
ESLINT_NO_DEV_ERRORS=true
TSC_COMPILE_ON_ERROR=true
DISABLE_ESLINT_PLUGIN=true
```

## 🔧 第三步：配置CORS和域名

### 3.1 更新后端CORS配置

确保Railway后端的CORS配置允许Vercel域名访问。

### 3.2 获取部署URL

1. **Railway后端URL**: 部署完成后，Railway会提供一个URL，格式如：
   `https://your-app-name.railway.app`

2. **Vercel前端URL**: 部署完成后，Vercel会提供一个URL，格式如：
   `https://your-app-name.vercel.app`

### 3.3 更新环境变量

1. 在Vercel中更新 `REACT_APP_API_URL` 为实际的Railway URL
2. 在Railway中更新 `CORS_ORIGIN` 为实际的Vercel URL

## ✅ 第四步：测试部署

### 4.1 测试后端API

访问你的Railway URL + `/api/v1/health` 检查后端状态

### 4.2 测试前端应用

访问你的Vercel URL，测试以下功能：
- [ ] 用户注册
- [ ] 用户登录
- [ ] API配置
- [ ] AI对话功能

## 🔒 安全注意事项

1. **环境变量安全**
   - 确保所有敏感信息都通过环境变量配置
   - 不要在代码中硬编码API密钥

2. **CORS配置**
   - 只允许你的Vercel域名访问后端API
   - 不要使用通配符 `*` 在生产环境

3. **Supabase安全**
   - 确保RLS（行级安全）策略正确配置
   - 定期轮换API密钥

## 🚨 常见问题

### Q: 前端无法连接后端
A: 检查CORS配置和API URL是否正确

### Q: Supabase连接失败
A: 验证Supabase URL和密钥是否正确配置

### Q: 构建失败
A: 检查环境变量是否都已正确设置

## 📞 支持

如果遇到问题，请检查：
1. Railway和Vercel的部署日志
2. 浏览器开发者工具的网络请求
3. 环境变量配置是否完整

---

**部署完成后，你将拥有一个完全云端化的学科AI工作台！** 🎉