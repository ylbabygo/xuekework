# Vercel 环境变量配置说明

## 问题诊断
通过测试发现，Vercel部署的应用中缺少关键的环境变量配置，导致应用使用SQLite而不是Supabase数据库。

## 需要在Vercel中设置的环境变量

请在Vercel项目设置中添加以下环境变量：

### 1. 数据库配置
```
USE_SUPABASE=true
DATABASE_TYPE=supabase
```

### 2. Supabase连接配置
```
SUPABASE_URL=https://lswsibrtmiugjdadujvu.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxzd3NpYnJ0bWl1Z2pkYWR1anZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzOTE5NTIsImV4cCI6MjA3NTk2Nzk1Mn0.gly4nRZDULivMWK-bXNcn2tOiJwmIzoig5aokysWQDs
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxzd3NpYnJ0bWl1Z2pkYWR1anZ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDM5MTk1MiwiZXhwIjoyMDc1OTY3OTUyfQ.KudVxPoQK6kMIHJtPb6ETxmfJPKokUDrVVN49ZQNUoc
```

### 3. 应用配置
```
NODE_ENV=production
JWT_SECRET=xueke-ai-workspace-secret-key-2024
JWT_EXPIRES_IN=7d
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 如何在Vercel中设置环境变量

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 找到你的项目 `xuekework`
3. 点击项目进入项目详情页
4. 点击 "Settings" 标签
5. 在左侧菜单中点击 "Environment Variables"
6. 逐一添加上述环境变量：
   - Name: 变量名（如 `USE_SUPABASE`）
   - Value: 变量值（如 `true`）
   - Environment: 选择 `Production`, `Preview`, `Development`（建议全选）
7. 点击 "Save" 保存每个变量
8. 设置完成后，重新部署项目

## 验证配置

设置完环境变量并重新部署后，访问以下URL验证配置：
```
https://xuekework.vercel.app/api/v1/test
```

应该看到：
- `database_type: "supabase"`
- `env_debug.USE_SUPABASE: "true"`
- 所有Supabase相关的环境变量都显示为 "SET"

## 测试登录功能

配置正确后，可以测试登录功能：
```
POST https://xuekework.vercel.app/api/v1/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

应该返回成功的登录响应和JWT token。