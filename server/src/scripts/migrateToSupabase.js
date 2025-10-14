const { supabaseAdmin } = require('../config/supabase');
const fs = require('fs');
const path = require('path');

async function migrateToSupabase() {
  try {
    console.log('🚀 开始迁移数据库到Supabase...');
    
    // 测试连接
    console.log('🔍 测试Supabase连接...');
    
    // 简单测试连接是否可用
    if (!supabaseAdmin) {
      console.error('❌ Supabase客户端未初始化');
      return;
    }
    
    console.log('✅ Supabase客户端已初始化！');
    
    // 读取SQL文件
    const sqlPath = path.join(__dirname, '../database/supabase_init.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('📄 SQL文件读取成功');
    
    // 由于Supabase客户端不支持直接执行DDL语句，我们需要手动在Supabase控制台执行
    console.log('⚠️  注意：由于Supabase客户端限制，需要手动在Supabase控制台执行SQL语句');
    console.log('📋 请在Supabase控制台的SQL编辑器中执行以下文件的内容：');
    console.log('📁 文件路径:', sqlPath);
    
    // 创建一个简化的SQL文件，只包含必要的表创建语句
    const simplifiedSQL = `
-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  avatar_url VARCHAR(500),
  bio TEXT,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 用户设置表
CREATE TABLE IF NOT EXISTS user_settings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  theme VARCHAR(20) DEFAULT 'light',
  language VARCHAR(10) DEFAULT 'zh-CN',
  notifications_enabled BOOLEAN DEFAULT true,
  email_notifications BOOLEAN DEFAULT true,
  auto_save BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- AI对话表
CREATE TABLE IF NOT EXISTS ai_conversations (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  model VARCHAR(50) DEFAULT 'gpt-3.5-turbo',
  system_prompt TEXT,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- AI消息表
CREATE TABLE IF NOT EXISTS ai_messages (
  id SERIAL PRIMARY KEY,
  conversation_id INTEGER REFERENCES ai_conversations(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL,
  content TEXT NOT NULL,
  tokens_used INTEGER DEFAULT 0,
  model VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 内容生成表
CREATE TABLE IF NOT EXISTS content_generations (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL,
  prompt TEXT NOT NULL,
  result TEXT,
  model VARCHAR(50) DEFAULT 'gpt-3.5-turbo',
  tokens_used INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 笔记表
CREATE TABLE IF NOT EXISTS notes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  content TEXT,
  folder VARCHAR(100),
  tags TEXT[],
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 待办清单表
CREATE TABLE IF NOT EXISTS todo_lists (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  color VARCHAR(7) DEFAULT '#007bff',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 待办事项表
CREATE TABLE IF NOT EXISTS todo_items (
  id SERIAL PRIMARY KEY,
  list_id INTEGER REFERENCES todo_lists(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT false,
  priority VARCHAR(10) DEFAULT 'medium',
  due_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- AI工具表
CREATE TABLE IF NOT EXISTS ai_tools (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(50),
  url VARCHAR(500),
  icon_url VARCHAR(500),
  rating DECIMAL(3,2) DEFAULT 0.00,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 用户AI工具收藏表
CREATE TABLE IF NOT EXISTS user_ai_tool_favorites (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  tool_id INTEGER REFERENCES ai_tools(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, tool_id)
);

-- 系统日志表
CREATE TABLE IF NOT EXISTS system_logs (
  id SERIAL PRIMARY KEY,
  level VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 插入默认用户
INSERT INTO users (username, email, password_hash, bio) 
VALUES ('admin', 'admin@example.com', '$2b$10$example.hash.here', '系统管理员')
ON CONFLICT (username) DO NOTHING;

-- 插入默认用户设置
INSERT INTO user_settings (user_id, theme, language) 
SELECT id, 'light', 'zh-CN' FROM users WHERE username = 'admin'
ON CONFLICT DO NOTHING;

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_id ON ai_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_messages_conversation_id ON ai_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_content_generations_user_id ON content_generations(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_todo_lists_user_id ON todo_lists(user_id);
CREATE INDEX IF NOT EXISTS idx_todo_items_list_id ON todo_items(list_id);
CREATE INDEX IF NOT EXISTS idx_system_logs_created_at ON system_logs(created_at);
`;

    // 保存简化的SQL到文件
    const simplifiedSQLPath = path.join(__dirname, '../database/supabase_simple.sql');
    fs.writeFileSync(simplifiedSQLPath, simplifiedSQL);
    
    console.log('📝 已创建简化的SQL文件:', simplifiedSQLPath);
    console.log('');
    console.log('🔧 请按以下步骤操作：');
    console.log('1. 打开Supabase控制台: https://lswsibrtmiugjdadujvu.supabase.co');
    console.log('2. 进入SQL编辑器');
    console.log('3. 复制并执行上述SQL语句');
    console.log('4. 或者执行文件:', simplifiedSQLPath);
    
    console.log('🎉 迁移脚本准备完成！');
    
  } catch (error) {
    console.error('❌ 迁移失败:', error);
  }
}

// 运行迁移
migrateToSupabase();