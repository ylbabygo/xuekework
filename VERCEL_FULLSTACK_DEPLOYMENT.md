# 🚀 Vercel全栈部署指南 (Supabase + Vercel)

## 📋 方案概述

使用Vercel同时部署前端和后端，实现全栈应用的统一管理。

### 🎯 架构图
```
用户 → Vercel前端 → Vercel API Routes → Supabase数据库
```

## 🔧 第一步：准备Vercel API Routes

### 1.1 创建API目录结构
```
client/
├── api/
│   ├── auth/
│   │   ├── register.js
│   │   ├── login.js
│   │   └── logout.js
│   ├── users/
│   │   └── [id].js
│   └── health.js
├── pages/
└── public/
```

### 1.2 迁移后端逻辑到API Routes
将现有的Express路由转换为Vercel API Routes格式。

## 🚀 第二步：Vercel部署配置

### 2.1 创建vercel.json配置
```json
{
  "version": 2,
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
      "src": "/api/(.*)",
      "dest": "/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "env": {
    "REACT_APP_API_URL": "/api/v1",
    "REACT_APP_SUPABASE_URL": "@supabase_url",
    "REACT_APP_SUPABASE_ANON_KEY": "@supabase_anon_key"
  }
}
```

### 2.2 环境变量配置
在Vercel项目设置中添加：
```
SUPABASE_URL=https://jnvdwevywpsgunnvcxys.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
JWT_SECRET=your-super-secret-jwt-key
NODE_ENV=production
```

## 🔄 第三步：代码迁移

### 3.1 API Routes示例
```javascript
// client/api/auth/register.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { email, password, username } = req.body;
    
    // 注册逻辑
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username }
      }
    });

    if (error) throw error;

    res.status(201).json({
      success: true,
      data: data.user
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
}
```

## 📦 第四步：部署步骤

### 4.1 准备代码
1. 将后端逻辑迁移到 `client/api/` 目录
2. 更新前端API调用路径为相对路径
3. 提交代码到GitHub

### 4.2 Vercel部署
1. 访问 [vercel.com](https://vercel.com)
2. 导入GitHub仓库
3. 设置根目录为 `client`
4. 配置环境变量
5. 部署

### 4.3 域名配置
- 自动获得 `https://your-app.vercel.app` 域名
- 可配置自定义域名

## ✅ 优势对比

| 特性 | Vercel全栈 | 传统分离部署 |
|------|------------|-------------|
| 管理复杂度 | 低 | 中 |
| 成本 | 低 | 中 |
| 扩展性 | 中 | 高 |
| 冷启动 | 有 | 无 |
| 部署速度 | 快 | 中 |

## 🚨 注意事项

1. **Serverless限制**：API函数有10秒执行时间限制
2. **冷启动**：首次请求可能较慢
3. **状态管理**：无法保持服务器状态
4. **文件上传**：需要使用外部存储服务

## 🔄 替代方案

如果Vercel API Routes不满足需求，推荐使用：
1. **Render**：免费层，支持持久化服务
2. **Supabase Edge Functions**：与Supabase深度集成，支持Deno运行时

---

选择哪种方案？我可以帮你实现任何一种！