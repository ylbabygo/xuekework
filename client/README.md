# 学科运营AI工作台 - 前端

基于React + TypeScript + Ant Design构建的现代化AI工作台前端应用。

## 🚀 快速开始

### 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm start

# 访问应用
# http://localhost:3000
```

### 环境配置

创建 `.env` 文件：

```env
# API配置
REACT_APP_API_URL=http://localhost:5000/api/v1

# 应用配置
REACT_APP_NAME=学科运营AI工作台
REACT_APP_VERSION=1.0.0

# 开发配置
GENERATE_SOURCEMAP=false
```

## 📦 构建部署

### 本地构建

```bash
# 构建生产版本
npm run build

# 预览构建结果
npm run analyze
```

### Vercel部署

1. **推送代码到GitHub**
2. **连接Vercel**
   - 访问 [Vercel](https://vercel.com)
   - 导入GitHub仓库
   - 选择 `client` 目录作为根目录

3. **配置环境变量**
   ```
   REACT_APP_API_URL=https://your-backend-api.vercel.app/api/v1
   REACT_APP_NAME=学科运营AI工作台
   REACT_APP_VERSION=1.0.0
   GENERATE_SOURCEMAP=false
   ```

4. **构建设置**
   - Framework Preset: Create React App
   - Root Directory: client
   - Build Command: npm run build:vercel
   - Output Directory: build

## 🔧 API配置

### 自动环境检测

应用会根据当前域名自动选择API地址：

- `localhost` → `http://localhost:5000/api/v1`
- `vercel.app` → 使用环境变量配置
- 其他域名 → 使用相对路径 `/api/v1`

### 手动配置

在应用设置页面可以手动配置API地址。

## 🏗️ 项目结构

```
client/
├── public/                 # 静态资源
├── src/
│   ├── components/         # 通用组件
│   ├── pages/              # 页面组件
│   ├── services/           # API服务
│   ├── types/              # TypeScript类型定义
│   └── utils/              # 工具函数
├── .env.example            # 环境变量示例
├── vercel.json             # Vercel配置
└── package.json            # 项目配置
```

## 🎨 功能特性

- 🔐 用户认证与权限管理
- 🤖 AI内容生成与对话
- 📚 物料库管理
- 📝 记事本功能
- ✅ 待办清单
- 🛠️ AI工具聚合

## 📄 许可证

MIT License
