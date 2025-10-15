# Vercel 重新部署指南

## 🚨 问题诊断

当前Vercel部署存在以下问题：
1. API函数无法正常工作（连接超时）
2. CORS跨域请求被拒绝
3. 前端无法访问后端API

## 🔧 已修复的问题

### 1. Vercel配置修复
- ✅ 修复了 `vercel.json` 中的路由配置
- ✅ 添加了API函数的最大执行时间配置
- ✅ 修复了静态资源路径映射

### 2. API函数修复
- ✅ 修复了 `api/index.js` 中的应用导入
- ✅ 添加了CORS头设置
- ✅ 添加了OPTIONS预检请求处理
- ✅ 修复了 `server/src/app.js` 的导出方式

## 🚀 重新部署步骤

### 方法1：通过Vercel CLI（推荐）

1. **安装Vercel CLI**（如果还没有安装）：
   ```bash
   npm install -g vercel
   ```

2. **登录Vercel**：
   ```bash
   vercel login
   ```

3. **在项目根目录执行部署**：
   ```bash
   vercel --prod
   ```

### 方法2：通过Git推送

1. **提交所有更改**：
   ```bash
   git add .
   git commit -m "修复Vercel API函数和CORS配置"
   git push origin main
   ```

2. **Vercel会自动重新部署**

### 方法3：通过Vercel Dashboard

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 找到你的项目
3. 点击 "Redeploy" 按钮

## 🔍 必需的环境变量

确保在Vercel Dashboard中设置以下环境变量：

### 必需变量：
```
NODE_ENV=production
JWT_SECRET=your_jwt_secret_here
DB_PASSWORD=your_db_password_here
```

### Supabase变量（如果使用Supabase）：
```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
DATABASE_TYPE=supabase
USE_SUPABASE=true
```

### SQLite变量（如果使用SQLite）：
```
DATABASE_TYPE=sqlite
USE_SUPABASE=false
```

## 🧪 部署后测试

部署完成后，测试以下端点：

1. **健康检查**：
   ```
   GET https://your-app.vercel.app/health
   ```

2. **API测试**：
   ```
   GET https://your-app.vercel.app/api/v1/test
   ```

3. **登录测试**：
   ```
   POST https://your-app.vercel.app/api/v1/auth/login
   Content-Type: application/json
   
   {
     "username": "admin",
     "password": "admin123"
   }
   ```

## 🔧 故障排除

### 如果API仍然无法工作：

1. **检查Vercel函数日志**：
   - 在Vercel Dashboard中查看函数执行日志
   - 查找错误信息

2. **检查环境变量**：
   - 确保所有必需的环境变量都已设置
   - 检查变量值是否正确

3. **检查构建日志**：
   - 查看部署时的构建日志
   - 确保没有构建错误

### 如果CORS问题仍然存在：

1. **检查浏览器控制台**：
   - 查看具体的CORS错误信息
   - 检查请求头和响应头

2. **测试API端点**：
   - 使用Postman或curl直接测试API
   - 确认API函数本身工作正常

## 📞 联系支持

如果问题仍然存在，请提供：
1. Vercel部署URL
2. 浏览器控制台错误截图
3. Vercel函数日志截图
4. 环境变量配置截图（隐藏敏感信息）

## 🎯 预期结果

部署成功后，你应该能够：
- ✅ 访问前端应用
- ✅ 成功登录
- ✅ API请求正常工作
- ✅ 没有CORS错误