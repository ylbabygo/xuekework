# 数据库迁移指南

## 📊 Supabase数据库配置

### 1. 创建Supabase项目
1. 访问 [supabase.com](https://supabase.com)
2. 创建新项目
3. 记录项目URL和API密钥

### 2. 数据库表结构

#### 用户表 (users)
```sql
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);
```

#### 对话记录表 (conversations)
```sql
CREATE TABLE conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_conversations_created_at ON conversations(created_at);
```

#### 消息表 (messages)
```sql
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
```

#### 笔记表 (notes)
```sql
CREATE TABLE notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_notes_user_id ON notes(user_id);
CREATE INDEX idx_notes_tags ON notes USING GIN(tags);
```

#### 待办事项表 (todos)
```sql
CREATE TABLE todos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT FALSE,
  priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  due_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_todos_user_id ON todos(user_id);
CREATE INDEX idx_todos_completed ON todos(completed);
CREATE INDEX idx_todos_due_date ON todos(due_date);
```

### 3. 行级安全策略 (RLS)

#### 启用RLS
```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;
```

#### 用户策略
```sql
-- 用户只能查看自己的记录
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid()::text = id::text);
```

#### 对话策略
```sql
CREATE POLICY "Users can view own conversations" ON conversations
  FOR ALL USING (user_id = auth.uid());
```

#### 消息策略
```sql
CREATE POLICY "Users can view own messages" ON messages
  FOR ALL USING (
    conversation_id IN (
      SELECT id FROM conversations WHERE user_id = auth.uid()
    )
  );
```

#### 笔记策略
```sql
CREATE POLICY "Users can manage own notes" ON notes
  FOR ALL USING (user_id = auth.uid());
```

#### 待办事项策略
```sql
CREATE POLICY "Users can manage own todos" ON todos
  FOR ALL USING (user_id = auth.uid());
```

### 4. 初始数据

#### 创建管理员用户
```sql
INSERT INTO users (id, username, password_hash, role) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'zhangshuang', '$2b$10$hashed_password_here', 'admin'),
  ('550e8400-e29b-41d4-a716-446655440002', 'yuli', '$2b$10$hashed_password_here', 'admin');
```

#### 创建普通用户
```sql
INSERT INTO users (id, username, password_hash, role) VALUES
  ('550e8400-e29b-41d4-a716-446655440003', 'lichengcheng', '$2b$10$hashed_password_here', 'user'),
  ('550e8400-e29b-41d4-a716-446655440004', 'liuli', '$2b$10$hashed_password_here', 'user'),
  ('550e8400-e29b-41d4-a716-446655440005', 'wangxin', '$2b$10$hashed_password_here', 'user');
```

## 🔧 迁移脚本

### 自动化迁移脚本
```javascript
// migrate.js
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function runMigration() {
  try {
    console.log('开始数据库迁移...');
    
    // 执行SQL文件
    const fs = require('fs');
    const sql = fs.readFileSync('./migrations/init.sql', 'utf8');
    
    const { error } = await supabase.rpc('exec_sql', { sql });
    
    if (error) {
      console.error('迁移失败:', error);
    } else {
      console.log('迁移成功完成！');
    }
  } catch (error) {
    console.error('迁移过程中出错:', error);
  }
}

runMigration();
```

## 📋 部署检查清单

- [ ] Supabase项目已创建
- [ ] 数据库表结构已创建
- [ ] 行级安全策略已配置
- [ ] 初始用户数据已插入
- [ ] API密钥已配置到Vercel环境变量
- [ ] 数据库连接测试通过

## 🔒 安全注意事项

1. **密码哈希**: 确保所有密码都经过bcrypt哈希处理
2. **API密钥**: 使用Service Role Key进行服务端操作
3. **RLS策略**: 确保所有表都启用了适当的行级安全策略
4. **环境变量**: 敏感信息通过环境变量管理，不要硬编码

## 🚀 生产环境优化

1. **连接池**: 配置适当的数据库连接池
2. **索引优化**: 根据查询模式优化索引
3. **备份策略**: 配置自动备份
4. **监控**: 设置数据库性能监控