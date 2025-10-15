# Supabase + Vercel全栈部署指南

## 📋 部署概览

本指南将帮助你将学科AI工作台部署到生产环境：
- **数据库**: Supabase
- **全栈应用**: Vercel (前端 + Serverless Functions后端)

## 🚀 第一步：准备Vercel全栈部署

### 1.1 项目结构确认

确保你的项目具有以下结构：
```
xueke-ai/
├── api/
│   └── index.js          # Vercel Serverless Functions入口
├── client/               # React前端
├── server/               # 后端代码（用于Serverless Functions）
├── vercel.json          # Vercel配置文件
└── package.json         # 根目录依赖
```

### 1.2 Vercel配置

确保 `vercel.json` 配置正确：
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
      "src": "/(.*)",
      "dest": "/client/build/$1"
    }
  ]
}
```

## 🌐 第二步：部署到Vercel

### 2.1 准备Vercel部署

1. **注册Vercel账号**
   - 访问 [Vercel.com](https://vercel.com)
   - 使用GitHub账号登录

2. **导入项目**
   - 点击 "New Project"
   - 选择你的GitHub仓库
   - 选择根目录（项目根目录，不是client）

### 2.2 配置Vercel项目设置

**Framework Preset**: Other
**Root Directory**: `./` (项目根目录)
**Build Command**: `cd client && npm install && npm run build`
**Output Directory**: `client/build`
**Install Command**: `npm install`

### 2.3 配置环境变量

在Vercel项目设置中添加以下环境变量：

```
# API配置 - Vercel全栈使用相对路径
REACT_APP_API_URL=/api/v1

# Supabase配置
SUPABASE_URL=https://jnvdwevywpsgunnvcxys.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpudmR3ZXZ5d3BzZ3VubnZjeHlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzNzE1MTQsImV4cCI6MjA3NTk0NzUxNH0.HQUxA5cRhc-GrC_G12OFreR7yyWHgAVPK7Hiv46nShY

# JWT配置
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# 应用配置
USE_SUPABASE=true
NODE_ENV=production

# 前端配置
REACT_APP_SUPABASE_URL=https://jnvdwevywpsgunnvcxys.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpudmR3ZXZ5d3BzZ3VubnZjeHlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzNzE1MTQsImV4cCI6MjA3NTk0NzUxNH0.HQUxA5cRhc-GrC_G12OFreR7yyWHgAVPK7Hiv46nShY
REACT_APP_NAME=学科运营AI工作台
REACT_APP_VERSION=1.0.0

# 构建优化
GENERATE_SOURCEMAP=false
ESLINT_NO_DEV_ERRORS=true
TSC_COMPILE_ON_ERROR=true
DISABLE_ESLINT_PLUGIN=true
```

## 🔧 第三步：验证部署

### 3.1 获取部署URL

部署完成后，Vercel会提供一个URL，格式如：
`https://your-app-name.vercel.app`

### 3.2 测试功能

确保以下功能正常工作：
- 前端页面加载
- API端点响应 (`/api/v1/health`)
- 用户认证功能
- 数据库连接

## ✅ 第四步：测试部署

### 4.1 测试API端点

访问你的Vercel URL + `/api/v1/health` 检查API状态

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

2. **Serverless Functions安全**
   - 确保API端点有适当的认证和授权
   - 实施速率限制防止滥用

3. **Supabase安全**
   - 确保RLS（行级安全）策略正确配置
   - 定期轮换API密钥

## 🚨 常见问题

### Q: 前端无法连接API
A: 检查Vercel Functions配置和API路由是否正确

### Q: Supabase连接失败
A: 验证Supabase URL和密钥是否正确配置

### Q: 构建失败
A: 检查环境变量是否都已正确设置

## 📞 支持

如果遇到问题，请检查：
1. Vercel的部署日志和Functions日志
2. 浏览器开发者工具的网络请求
3. 环境变量配置是否完整

---

**部署完成后，你将拥有一个完全云端化的学科AI工作台！** 🎉