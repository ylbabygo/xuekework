# 🚀 Supabase + Vercel 部署检查清单

## 📋 部署前准备

- [ ] 确保代码已提交到GitHub
- [ ] 确保本地测试通过（前端 + 后端）
- [ ] 确保Supabase项目已创建并配置

## 🚂 Railway后端部署

### 1. 创建Railway项目
- [ ] 访问 [Railway.app](https://railway.app)
- [ ] 使用GitHub账号登录
- [ ] 点击 "New Project" → "Deploy from GitHub repo"
- [ ] 选择你的仓库

### 2. 配置环境变量
在Railway项目设置中添加以下环境变量：

```
NODE_ENV=production
PORT=3001
SUPABASE_URL=https://jnvdwevywpsgunnvcxys.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpudmR3ZXZ5d3BzZ3VubnZjeHlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzNzE1MTQsImV4cCI6MjA3NTk0NzUxNH0.HQUxA5cRhc-GrC_G12OFreR7yyWHgAVPK7Hiv46nShY
JWT_SECRET=your-super-secret-jwt-key-here-change-this
JWT_EXPIRES_IN=7d
USE_SUPABASE=true
```

### 3. 验证部署
- [ ] 等待部署完成
- [ ] 访问 `https://your-app.railway.app/api/v1/health`
- [ ] 确认返回健康状态

**Railway URL:** `_____________________`

## ▲ Vercel前端部署

### 1. 创建Vercel项目
- [ ] 访问 [Vercel.com](https://vercel.com)
- [ ] 使用GitHub账号登录
- [ ] 点击 "New Project"
- [ ] 选择你的仓库

### 2. 配置项目设置
- [ ] 设置根目录为 `client`
- [ ] 构建命令：`npm run build`
- [ ] 输出目录：`build`

### 3. 配置环境变量
在Vercel项目设置中添加以下环境变量：

```
REACT_APP_API_URL=https://your-app.railway.app/api/v1
REACT_APP_SUPABASE_URL=https://jnvdwevywpsgunnvcxys.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpudmR3ZXZ5d3BzZ3VubnZjeHlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzNzE1MTQsImV4cCI6MjA3NTk0NzUxNH0.HQUxA5cRhc-GrC_G12OFreR7yyWHgAVPK7Hiv46nShY
REACT_APP_NAME=学科运营AI工作台
REACT_APP_VERSION=1.0.0
GENERATE_SOURCEMAP=false
```

**Vercel URL:** `_____________________`

## 🔧 CORS配置

### 更新Railway环境变量
- [ ] 在Railway中添加：`CORS_ORIGIN=https://your-app.vercel.app`
- [ ] 重新部署Railway应用

## 🧪 部署测试

### 功能测试清单
- [ ] 前端页面正常加载
- [ ] 用户注册功能正常
- [ ] 用户登录功能正常
- [ ] API配置功能正常
- [ ] 后端健康检查正常
- [ ] 前后端通信正常

### 测试URL
- 前端：`https://your-app.vercel.app`
- 后端健康检查：`https://your-app.railway.app/api/v1/health`
- 后端API：`https://your-app.railway.app/api/v1`

## 🔒 安全检查

- [ ] JWT_SECRET 已更改为强密码
- [ ] Supabase RLS 策略已配置
- [ ] CORS 配置正确
- [ ] 环境变量不包含敏感信息

## 📝 部署后配置

### Supabase配置
- [ ] 在Supabase项目设置中添加Vercel域名到允许的源
- [ ] 配置RLS策略
- [ ] 检查数据库连接

### 域名配置（可选）
- [ ] 在Vercel中配置自定义域名
- [ ] 更新CORS配置包含新域名

## 🚨 故障排除

### 常见问题
1. **CORS错误**：检查Railway中的CORS_ORIGIN环境变量
2. **API连接失败**：检查Vercel中的REACT_APP_API_URL
3. **认证失败**：检查Supabase配置和密钥
4. **构建失败**：检查package.json和依赖项

### 调试工具
- Railway日志：项目 → Deployments → 查看日志
- Vercel日志：项目 → Functions → 查看日志
- 浏览器开发者工具：Network和Console标签

## ✅ 部署完成

恭喜！你的学科AI工作台已成功部署到生产环境。

- 🌐 前端地址：`_____________________`
- 🚂 后端地址：`_____________________`
- 📊 Supabase控制台：https://supabase.com/dashboard

记得定期备份数据库和监控应用性能！