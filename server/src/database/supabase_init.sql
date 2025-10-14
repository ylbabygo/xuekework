-- 学科运营AI工作台 Supabase数据库初始化脚本
-- PostgreSQL版本

-- 启用UUID扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'standard_user' CHECK (role IN ('super_admin', 'standard_user')),
    avatar_url VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- 用户设置表
CREATE TABLE IF NOT EXISTS user_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    theme VARCHAR(20) DEFAULT 'dark',
    language VARCHAR(10) DEFAULT 'zh-CN',
    api_keys JSONB,
    notification_settings JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- AI对话会话表
CREATE TABLE IF NOT EXISTS ai_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    model VARCHAR(50),
    total_messages INTEGER DEFAULT 0,
    total_tokens INTEGER DEFAULT 0,
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_id ON ai_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_created_at ON ai_conversations(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_is_archived ON ai_conversations(is_archived);

-- AI对话消息表
CREATE TABLE IF NOT EXISTS ai_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    tokens INTEGER DEFAULT 0,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_messages_conversation_id ON ai_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_ai_messages_created_at ON ai_messages(created_at);

-- 内容生成记录表
CREATE TABLE IF NOT EXISTS content_generations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    prompt TEXT NOT NULL,
    generated_content TEXT NOT NULL,
    model VARCHAR(50),
    tokens INTEGER DEFAULT 0,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    is_favorite BOOLEAN DEFAULT FALSE,
    tags JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_content_generations_user_id ON content_generations(user_id);
CREATE INDEX IF NOT EXISTS idx_content_generations_type ON content_generations(type);
CREATE INDEX IF NOT EXISTS idx_content_generations_created_at ON content_generations(created_at);
CREATE INDEX IF NOT EXISTS idx_content_generations_is_favorite ON content_generations(is_favorite);

-- 数据分析记录表
CREATE TABLE IF NOT EXISTS data_analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    data_source TEXT,
    query TEXT NOT NULL,
    result TEXT NOT NULL,
    model VARCHAR(50),
    tokens INTEGER DEFAULT 0,
    charts_config JSONB,
    is_shared BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_data_analyses_user_id ON data_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_data_analyses_created_at ON data_analyses(created_at);
CREATE INDEX IF NOT EXISTS idx_data_analyses_is_shared ON data_analyses(is_shared);

-- 物料库表
CREATE TABLE IF NOT EXISTS assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    description TEXT,
    tags JSONB,
    ai_summary TEXT,
    ai_keywords JSONB,
    download_count INTEGER DEFAULT 0,
    is_public BOOLEAN DEFAULT FALSE,
    version INTEGER DEFAULT 1,
    parent_id UUID REFERENCES assets(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_assets_user_id ON assets(user_id);
CREATE INDEX IF NOT EXISTS idx_assets_file_type ON assets(file_type);
CREATE INDEX IF NOT EXISTS idx_assets_created_at ON assets(created_at);
CREATE INDEX IF NOT EXISTS idx_assets_is_public ON assets(is_public);
CREATE INDEX IF NOT EXISTS idx_assets_parent_id ON assets(parent_id);

-- 记事本表
CREATE TABLE IF NOT EXISTS notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    content_type VARCHAR(20) DEFAULT 'markdown' CHECK (content_type IN ('text', 'markdown', 'html')),
    tags JSONB,
    is_pinned BOOLEAN DEFAULT FALSE,
    is_archived BOOLEAN DEFAULT FALSE,
    folder VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes(created_at);
CREATE INDEX IF NOT EXISTS idx_notes_is_pinned ON notes(is_pinned);
CREATE INDEX IF NOT EXISTS idx_notes_is_archived ON notes(is_archived);
CREATE INDEX IF NOT EXISTS idx_notes_folder ON notes(folder);

-- 待办清单表
CREATE TABLE IF NOT EXISTS todo_lists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#3B82F6',
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_todo_lists_user_id ON todo_lists(user_id);
CREATE INDEX IF NOT EXISTS idx_todo_lists_created_at ON todo_lists(created_at);
CREATE INDEX IF NOT EXISTS idx_todo_lists_is_archived ON todo_lists(is_archived);

-- 待办事项表
CREATE TABLE IF NOT EXISTS todo_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    list_id UUID NOT NULL REFERENCES todo_lists(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    is_completed BOOLEAN DEFAULT FALSE,
    priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    due_date TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_todo_items_list_id ON todo_items(list_id);
CREATE INDEX IF NOT EXISTS idx_todo_items_is_completed ON todo_items(is_completed);
CREATE INDEX IF NOT EXISTS idx_todo_items_priority ON todo_items(priority);
CREATE INDEX IF NOT EXISTS idx_todo_items_due_date ON todo_items(due_date);
CREATE INDEX IF NOT EXISTS idx_todo_items_sort_order ON todo_items(sort_order);

-- AI工具表
CREATE TABLE IF NOT EXISTS ai_tools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    url VARCHAR(500) NOT NULL,
    logo_url VARCHAR(500),
    rating DECIMAL(3,2),
    pricing VARCHAR(100),
    features JSONB,
    tags JSONB,
    is_featured BOOLEAN DEFAULT FALSE,
    view_count INTEGER DEFAULT 0,
    last_synced_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_tools_category ON ai_tools(category);
CREATE INDEX IF NOT EXISTS idx_ai_tools_is_featured ON ai_tools(is_featured);
CREATE INDEX IF NOT EXISTS idx_ai_tools_rating ON ai_tools(rating);
CREATE INDEX IF NOT EXISTS idx_ai_tools_last_synced_at ON ai_tools(last_synced_at);

-- 用户AI工具收藏表
CREATE TABLE IF NOT EXISTS user_ai_tool_favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tool_id UUID NOT NULL REFERENCES ai_tools(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, tool_id)
);

CREATE INDEX IF NOT EXISTS idx_user_ai_tool_favorites_user_id ON user_ai_tool_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_ai_tool_favorites_tool_id ON user_ai_tool_favorites(tool_id);

-- 系统日志表
CREATE TABLE IF NOT EXISTS system_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id UUID,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_system_logs_user_id ON system_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_system_logs_action ON system_logs(action);
CREATE INDEX IF NOT EXISTS idx_system_logs_resource_type ON system_logs(resource_type);
CREATE INDEX IF NOT EXISTS idx_system_logs_created_at ON system_logs(created_at);

-- 插入默认用户数据（密码: xueke2024）
INSERT INTO users (id, username, email, password_hash, role) VALUES 
('550e8400-e29b-41d4-a716-446655440001', 'zhangshuang', 'zhangshuang@xueke.ai', '$2a$12$G5kcPyGyxzPnkeat3H7Sy.p58Q.DWo9YygYz1kZ4ChA6YtZNrsl8a', 'super_admin'),
('550e8400-e29b-41d4-a716-446655440002', 'yuli', 'yuli@xueke.ai', '$2a$12$G5kcPyGyxzPnkeat3H7Sy.p58Q.DWo9YygYz1kZ4ChA6YtZNrsl8a', 'super_admin'),
('550e8400-e29b-41d4-a716-446655440003', 'lichengcheng', 'lichengcheng@xueke.ai', '$2a$12$G5kcPyGyxzPnkeat3H7Sy.p58Q.DWo9YygYz1kZ4ChA6YtZNrsl8a', 'standard_user'),
('550e8400-e29b-41d4-a716-446655440004', 'liuli', 'liuli@xueke.ai', '$2a$12$G5kcPyGyxzPnkeat3H7Sy.p58Q.DWo9YygYz1kZ4ChA6YtZNrsl8a', 'standard_user'),
('550e8400-e29b-41d4-a716-446655440005', 'wangxin', 'wangxin@xueke.ai', '$2a$12$G5kcPyGyxzPnkeat3H7Sy.p58Q.DWo9YygYz1kZ4ChA6YtZNrsl8a', 'standard_user'),
('550e8400-e29b-41d4-a716-446655440006', 'admin', 'admin@xueke.ai', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.PmvlJO', 'super_admin'),
('550e8400-e29b-41d4-a716-446655440007', 'user', 'user@xueke.ai', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'standard_user')
ON CONFLICT (username) DO NOTHING;

-- 插入默认用户设置
INSERT INTO user_settings (user_id, theme, api_keys) VALUES 
('550e8400-e29b-41d4-a716-446655440001', 'dark', '{}'),
('550e8400-e29b-41d4-a716-446655440002', 'dark', '{}'),
('550e8400-e29b-41d4-a716-446655440003', 'dark', '{}'),
('550e8400-e29b-41d4-a716-446655440004', 'dark', '{}'),
('550e8400-e29b-41d4-a716-446655440005', 'dark', '{}'),
('550e8400-e29b-41d4-a716-446655440006', 'dark', '{}'),
('550e8400-e29b-41d4-a716-446655440007', 'dark', '{}')
ON CONFLICT (user_id) DO NOTHING;