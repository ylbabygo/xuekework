# Vercel 部署指南

## 项目概述
学科运营AI工作台前端项目，基于React + TypeScript构建，适配Vercel平台部署。

## 部署步骤

### 1. 准备工作
- 确保项目已推送到GitHub
- 注册/登录 [Vercel](https://vercel.com) 账号
- 连接GitHub账号到Vercel

### 2. 导入项目
1. 在Vercel控制台点击 "New Project"
2. 选择GitHub仓库：`xueke-ai-workspace`
3. 选择 `client` 目录作为根目录
4. 框架预设选择 "Create React App"

### 3. 环境变量配置
在Vercel项目设置中添加以下环境变量：

```
REACT_APP_API_URL=https://your-backend-api.vercel.app/api/v1
REACT_APP_NAME=学科运营AI工作台
REACT_APP_VERSION=1.0.0
GENERATE_SOURCEMAP=false
```

### 4. 构建设置
- **Framework Preset**: Create React App
- **Root Directory**: client
- **Build Command**: npm run build
- **Output Directory**: build
- **Install Command**: npm install

### 5. 域名配置
- Vercel会自动分配一个域名：`your-project.vercel.app`
- 可以在项目设置中配置自定义域名

## 后端API部署建议

### 选项1: Vercel Serverless Functions
- 将后端代码改造为Serverless Functions
- 适合轻量级API服务

### 选项2: Railway
- 支持Node.js应用直接部署
- 提供数据库服务
- 部署命令：`railway login && railway deploy`

### 选项3: Heroku
- 经典的Node.js部署平台
- 需要添加 `Procfile` 文件

### 选项4: Render
- 免费的Node.js托管服务
- 自动从GitHub部署

## 配置文件说明

### vercel.json
```json
{
  "version": 2,
  "name": "xueke-ai-workspace",
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    }
  ],
  "routes": [
    {
      "src": "/static/(.*)",
      "headers": {
        "cache-control": "s-maxage=31536000,immutable"
      }
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

### .env.production
```
REACT_APP_API_URL=https://your-backend-api.vercel.app/api/v1
REACT_APP_NAME=学科运营AI工作台
REACT_APP_VERSION=1.0.0
GENERATE_SOURCEMAP=false
```

## 部署后验证

1. **访问应用**: 打开Vercel分配的域名
2. **检查API连接**: 确认前端能正常调用后端API
3. **功能测试**: 测试登录、内容生成等核心功能
4. **性能检查**: 使用Lighthouse检查性能指标

## 常见问题

### Q: 部署后页面空白
A: 检查构建日志，确认所有依赖正确安装

### Q: API请求失败
A: 检查环境变量配置，确认后端API地址正确

### Q: 路由404错误
A: 确认vercel.json中的路由配置正确

### Q: 构建失败
A: 检查package.json中的构建脚本和依赖版本

## 更新部署

1. 推送代码到GitHub主分支
2. Vercel会自动触发重新部署
3. 查看部署日志确认成功

## 监控和分析

- Vercel提供内置的性能监控
- 可以查看访问统计和错误日志
- 支持集成第三方监控服务

---

**注意**: 请根据实际的后端API地址更新环境变量配置。