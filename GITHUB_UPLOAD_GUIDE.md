# 📚 学科运营AI工作台 - GitHub上传指南

## 🎯 项目概述

**学科运营AI工作台** 是一个专为学科运营团队设计的AI驱动协同工作平台，采用特斯拉官网简约设计风格。

### ✨ 核心功能
- 🤖 **AI智能助手** - 自然语言对话，智能调用平台功能
- 📝 **文案生成** - 多模板文案一键生成，支持多种营销场景
- 📊 **数据分析** - 智能数据处理和可视化分析
- 📚 **智能物料库** - AI驱动的素材管理和智能检索
- 📋 **个人效率工具** - 记事本和待办清单管理
- 🔧 **AI工具聚合** - 百大AI工具推荐和集成
- ⚙️ **个性化设置** - API配置、主题切换、安全管理

### 🏗️ 技术架构
- **前端**: React 18 + TypeScript + Tailwind CSS
- **后端**: Node.js + Express + TypeScript
- **存储**: 本地存储 + 文件系统
- **AI集成**: 支持多种AI服务API

## 🚀 GitHub上传步骤

### 第一步：创建GitHub仓库

1. 登录到 [GitHub](https://github.com)
2. 点击右上角的 "+" 按钮，选择 "New repository"
3. 填写仓库信息：
   - **Repository name**: `xueke-ai-workspace`
   - **Description**: `学科运营AI工作台 - 专为学科运营团队设计的AI驱动协同工作平台`
   - **Visibility**: Public (推荐) 或 Private
   - **不要勾选** "Initialize this repository with a README"
4. 点击 "Create repository"

### 第二步：连接本地仓库到GitHub

在项目根目录下运行以下命令（请将 `YOUR_USERNAME` 替换为你的GitHub用户名）：

```bash
# 添加远程仓库
git remote add origin https://github.com/YOUR_USERNAME/xueke-ai-workspace.git

# 设置主分支名称
git branch -M main

# 推送代码到GitHub
git push -u origin main
```

### 第三步：验证上传结果

1. 刷新GitHub仓库页面
2. 确认所有文件已成功上传
3. 检查README.md文件是否正确显示

## 📁 项目结构

```
xueke-ai-workspace/
├── client/                 # 前端应用
│   ├── public/            # 静态资源
│   ├── src/               # 源代码
│   │   ├── components/    # React组件
│   │   ├── contexts/      # React上下文
│   │   ├── pages/         # 页面组件
│   │   ├── services/      # API服务
│   │   └── styles/        # 样式文件
│   ├── package.json       # 前端依赖
│   └── tsconfig.json      # TypeScript配置
├── server/                # 后端应用
│   ├── src/               # 源代码
│   │   ├── controllers/   # 控制器
│   │   ├── middleware/    # 中间件
│   │   ├── models/        # 数据模型
│   │   ├── routes/        # 路由
│   │   ├── services/      # 业务服务
│   │   └── scripts/       # 脚本文件
│   ├── package.json       # 后端依赖
│   └── tsconfig.json      # TypeScript配置
├── README.md              # 项目说明
├── package.json           # 根目录依赖
├── .gitignore            # Git忽略文件
└── setup_git.ps1         # Git初始化脚本
```

## 👥 预设用户账号

### 超级管理员
- **用户名**: `zhangshuang` / `yuli`
- **密码**: `xueke666`

### 普通用户
- **用户名**: `lichengcheng` / `liuli` / `wangxin`
- **密码**: `xueke666`

## 🔧 本地开发

### 安装依赖
```bash
npm run install:all
```

### 启动开发环境
```bash
npm run dev
```

### 访问地址
- **前端应用**: http://localhost:3000
- **后端API**: http://localhost:5000

## 📝 提交信息规范

项目已使用规范的提交信息格式：

```
🎉 初始提交: 学科运营AI工作台

✨ 功能特性:
- 🤖 AI智能助手 - 自然语言对话，智能调用平台功能
- 📝 文案生成 - 多模板文案一键生成，支持多种营销场景
- 📊 数据分析 - 智能数据处理和可视化分析
- 📚 智能物料库 - AI驱动的素材管理和智能检索
- 📋 个人效率工具 - 记事本和待办清单管理
- 🔧 AI工具聚合 - 百大AI工具推荐和集成
- ⚙️ 个性化设置 - API配置、主题切换、安全管理

🏗️ 技术架构:
- 前端: React 18 + TypeScript + Tailwind CSS
- 后端: Node.js + Express + TypeScript
- 存储: 本地存储 + 文件系统
- AI集成: 支持多种AI服务API

👥 用户系统:
- 超级管理员: zhangshuang, yuli
- 普通用户: lichengcheng, liuli, wangxin
```

## 🎉 完成！

按照以上步骤，你的学科运营AI工作台项目就成功上传到GitHub了！

### 下一步建议：
1. 🌟 为仓库添加星标
2. 📝 完善项目文档
3. 🏷️ 添加适当的标签（tags）
4. 🔄 设置持续集成（CI/CD）
5. 👥 邀请团队成员协作

---

**祝你使用愉快！** 🚀