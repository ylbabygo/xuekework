# 🔧 Vercel环境变量设置指南

## 🎉 部署状态
✅ **项目已成功部署到Vercel！**
- 🌐 **生产环境URL**: https://xuekework-2hgrcjvvr-yulis-projects-ad9ada99.vercel.app
- 📊 **部署详情**: https://vercel.com/yulis-projects-ad9ada99/xuekework/2L3C7qRJwaf4xqeED8HsPzg8dP85

## 📋 需要设置的关键环境变量

### 方法1：通过Vercel CLI设置（推荐）

```bash
# 设置Supabase配置
vercel env add SUPABASE_URL production
# 输入你的Supabase项目URL

vercel env add SUPABASE_ANON_KEY production  
# 输入你的Supabase匿名密钥

vercel env add SUPABASE_SERVICE_ROLE_KEY production
# 输入你的Supabase服务角色密钥

vercel env add JWT_SECRET production
# 输入: xueke_ai_jwt_secret_2024_production_key_minimum_32_chars

# 设置其他配置
vercel env add DATABASE_TYPE production
# 输入: supabase

vercel env add REACT_APP_API_URL production
# 输入: /api/v1
```

### 方法2：通过Vercel控制台设置

1. 访问：https://vercel.com/yulis-projects-ad9ada99/xuekework/settings/environment-variables
2. 添加以下环境变量：

| 变量名 | 值 | 环境 |
|--------|-----|------|
| `SUPABASE_URL` | 你的Supabase项目URL | Production |
| `SUPABASE_ANON_KEY` | 你的Supabase匿名密钥 | Production |
| `SUPABASE_SERVICE_ROLE_KEY` | 你的Supabase服务角色密钥 | Production |
| `JWT_SECRET` | `xueke_ai_jwt_secret_2024_production_key_minimum_32_chars` | Production |
| `DATABASE_TYPE` | `supabase` | Production |
| `REACT_APP_API_URL` | `/api/v1` | Production |
| `REACT_APP_NAME` | `学科AI工作台` | Production |
| `REACT_APP_VERSION` | `1.0.0` | Production |

## 🔍 获取Supabase配置信息

1. 登录你的Supabase控制台：https://supabase.com/dashboard
2. 选择你的项目
3. 进入 Settings → API
4. 复制以下信息：
   - **Project URL** → `SUPABASE_URL`
   - **anon public** → `SUPABASE_ANON_KEY`
   - **service_role secret** → `SUPABASE_SERVICE_ROLE_KEY`

## 🚀 设置完成后

1. **重新部署**：
   ```bash
   vercel --prod
   ```

2. **验证部署**：
   - 访问：https://xuekework-2hgrcjvvr-yulis-projects-ad9ada99.vercel.app
   - 尝试登录（用户名：admin，密码：admin123）

3. **查看日志**：
   ```bash
   vercel logs
   ```

## ✅ 已设置的环境变量
- ✅ `NODE_ENV` = `production`
- ✅ `USE_SUPABASE` = `true`

## 🔄 下一步
设置完Supabase环境变量后，项目就可以正常使用了！你的22个用户数据都会正常工作。