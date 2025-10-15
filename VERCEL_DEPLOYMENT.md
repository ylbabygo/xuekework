# Vercel 部署指南

## 📋 部署前准备清单

### 1. 环境变量配置
在Vercel控制台中设置以下环境变量：

#### 必需变量：
```
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
JWT_SECRET=your_secure_jwt_secret_here_minimum_32_characters
```

#### 可选变量：
```
NODE_ENV=production
JWT_EXPIRES_IN=7d
USE_SUPABASE=true
DATABASE_TYPE=supabase
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
REACT_APP_API_URL=/api/v1
REACT_APP_NAME=学科运营AI工作台
REACT_APP_VERSION=1.0.0
GENERATE_SOURCEMAP=false
```

### 2. 数据库准备
- ✅ 确保Supabase项目已创建
- ✅ 数据库表结构已初始化
- ✅ 用户数据已迁移（如需要）

### 3. 项目文件检查
- ✅ `vercel.json` 配置文件已创建
- ✅ 环境变量示例文件已更新
- ✅ 构建脚本已优化

## 🚀 部署步骤

### 方法一：通过Vercel CLI
```bash
# 安装Vercel CLI
npm i -g vercel

# 登录Vercel
vercel login

# 部署项目
vercel --prod
```

### 方法二：通过GitHub集成
1. 将代码推送到GitHub仓库
2. 在Vercel控制台连接GitHub仓库
3. 配置环境变量
4. 触发自动部署

### 方法三：通过Vercel控制台
1. 访问 [vercel.com](https://vercel.com)
2. 点击 "New Project"
3. 导入GitHub仓库或上传项目文件
4. 配置环境变量
5. 点击 "Deploy"

## ⚙️ 部署配置说明

### 项目结构
```
xueke-ai/
├── client/          # React前端应用
├── server/          # Node.js后端API
├── vercel.json      # Vercel配置文件
└── .env.vercel      # 环境变量示例
```

### 路由配置
- `/api/*` → 后端API服务
- `/*` → 前端React应用

### 构建配置
- 前端：使用 `@vercel/static-build`
- 后端：使用 `@vercel/node`
- 输出目录：`client/build`

## 🔧 常见问题解决

### 1. API路径问题
确保前端API调用使用相对路径 `/api/v1`

### 2. 环境变量未生效
检查Vercel控制台中的环境变量设置

### 3. 数据库连接失败
验证Supabase配置信息是否正确

### 4. 构建失败
检查依赖版本兼容性和构建日志

## 📊 性能优化建议

1. **启用压缩**：已在服务端配置gzip压缩
2. **缓存策略**：静态资源自动缓存
3. **代码分割**：React应用已启用代码分割
4. **图片优化**：建议使用Vercel Image Optimization

## 🔒 安全配置

1. **HTTPS**：Vercel自动提供SSL证书
2. **CORS**：已配置跨域访问控制
3. **速率限制**：已配置API速率限制
4. **环境变量**：敏感信息通过环境变量管理

## 📈 监控和日志

- 使用Vercel Analytics监控性能
- 通过Vercel Functions查看服务端日志
- 配置错误报告和监控

## 🔄 持续部署

推荐设置GitHub Actions或Vercel Git集成实现：
- 自动构建和部署
- 环境分离（开发/生产）
- 回滚机制