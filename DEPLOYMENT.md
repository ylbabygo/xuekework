# 部署指南

## ⚠️ 重要说明

这是一个全栈应用，需要分别部署前端和后端：
- **前端**：部署到 Vercel
- **后端**：部署到 Vercel Serverless Functions 或 Render/Heroku 等支持 Node.js 的平台

## 默认账号信息

### 超级管理员账号：
- 用户名: `zhangshuang` 密码: `xueke666`
- 用户名: `yuli` 密码: `xueke666`
- 用户名: `admin` 密码: `123456`

### 普通用户账号：
- 用户名: `lichengcheng` 密码: `xueke666`
- 用户名: `liuli` 密码: `xueke666`
- 用户名: `wangxin` 密码: `xueke666`

## Vercel 全栈部署 (推荐)

### 一键部署到Vercel

1. 登录 [Vercel](https://vercel.com)
2. 点击 "New Project" → "Import Git Repository"
3. 选择你的仓库 `ylbabygo/xuekework`
4. 配置项目设置：
   - **Framework Preset**: Other
   - **Root Directory**: `./`
   - **Build Command**: `cd client && npm install && npm run build`
   - **Output Directory**: `client/build`
5. 设置环境变量：
   ```
   NODE_ENV=production
   USE_SUPABASE=true
   SUPABASE_URL=your-supabase-url
   SUPABASE_ANON_KEY=your-supabase-anon-key
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRES_IN=7d
   REACT_APP_API_URL=/api/v1
   ```
6. 部署完成后，你将获得一个完整的全栈应用URL

### 替代方案：Render 部署

1. 登录 [Render](https://render.com)
2. 点击 "New" → "Web Service"
3. 连接GitHub仓库
4. 配置：
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. 设置环境变量（同上）

## Vercel 前端部署 (仅在使用分离部署时)

### 1. 准备工作

确保你的项目已经推送到GitHub仓库，并且后端已经部署完成。

### 2. Vercel配置

项目已包含以下配置文件：
- `vercel.json` - Vercel部署配置
- `.vercelignore` - 排除不必要的文件
- `client/.env.example` - 环境变量示例

### 3. 部署步骤

1. 登录 [Vercel](https://vercel.com)
2. 点击 "New Project"
3. 导入你的GitHub仓库 `ylbabygo/xuekework`
4. 配置项目设置：
   - **Framework Preset**: Create React App
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
   - **Install Command**: `npm install`

5. 设置环境变量：
   ```
   REACT_APP_API_URL=https://your-backend-url.vercel.app/api/v1
   GENERATE_SOURCEMAP=false
   ```
   
   ⚠️ **重要**：将 `your-backend-url.vercel.app` 替换为你实际的后端部署URL

6. 点击 "Deploy"

### 4. 后端部署建议

后端可以部署到以下平台：
- **Vercel Serverless Functions**: 与前端集成，推荐使用
- **Render**: 免费层支持，易于配置
- **Heroku**: 经典选择，但需要付费
- **DigitalOcean App Platform**: 性能稳定

### 5. 环境变量配置

确保后端部署时配置以下环境变量：
```
NODE_ENV=production
PORT=5000
JWT_SECRET=your-jwt-secret
DATABASE_URL=your-database-url
REDIS_URL=your-redis-url
```

### 6. CORS配置

确保后端CORS配置允许你的Vercel域名：
```javascript
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://your-vercel-app.vercel.app'
  ],
  credentials: true
}));
```

### 7. 安全注意事项

- ✅ 所有API端点都有适当的认证保护
- ✅ 敏感信息已从代码中移除
- ✅ 环境变量正确配置
- ✅ CORS策略已设置
- ✅ 安全头已配置

### 8. 故障排除

如果遇到部署问题：

1. **构建失败**: 检查依赖版本兼容性
2. **API连接失败**: 确认后端URL和CORS配置
3. **认证问题**: 检查JWT密钥配置
4. **静态资源404**: 确认构建输出目录配置

### 9. 性能优化

- 启用Gzip压缩
- 配置CDN缓存
- 优化图片资源
- 启用代码分割