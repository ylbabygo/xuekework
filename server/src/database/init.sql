-- 学科运营AI工作台数据库初始化脚本
-- 创建数据库（如果不存在）
CREATE DATABASE IF NOT EXISTS xueke_ai_workspace;
USE xueke_ai_workspace;

-- 用户表
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('super_admin', 'standard_user') DEFAULT 'standard_user',
    avatar_url VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_created_at (created_at)
);

-- 用户设置表
CREATE TABLE user_settings (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    theme VARCHAR(20) DEFAULT 'dark',
    language VARCHAR(10) DEFAULT 'zh-CN',
    api_keys JSON,
    notification_settings JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_settings (user_id)
);

-- AI对话会话表
CREATE TABLE ai_conversations (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    model VARCHAR(50),
    total_messages INT DEFAULT 0,
    total_tokens INT DEFAULT 0,
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at),
    INDEX idx_is_archived (is_archived)
);

-- AI对话消息表
CREATE TABLE ai_messages (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    conversation_id VARCHAR(36) NOT NULL,
    role ENUM('user', 'assistant', 'system') NOT NULL,
    content TEXT NOT NULL,
    tokens INT DEFAULT 0,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (conversation_id) REFERENCES ai_conversations(id) ON DELETE CASCADE,
    INDEX idx_conversation_id (conversation_id),
    INDEX idx_created_at (created_at)
);

-- 内容生成记录表
CREATE TABLE content_generations (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'marketing', 'educational', 'social_media', etc.
    prompt TEXT NOT NULL,
    generated_content TEXT NOT NULL,
    model VARCHAR(50),
    tokens INT DEFAULT 0,
    rating INT, -- 用户评分 1-5
    is_favorite BOOLEAN DEFAULT FALSE,
    tags JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_type (type),
    INDEX idx_created_at (created_at),
    INDEX idx_is_favorite (is_favorite)
);

-- 数据分析记录表
CREATE TABLE data_analyses (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    data_source TEXT, -- 原始数据
    query TEXT NOT NULL, -- 分析查询
    result TEXT NOT NULL, -- 分析结果
    model VARCHAR(50),
    tokens INT DEFAULT 0,
    charts_config JSON, -- 图表配置
    is_shared BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at),
    INDEX idx_is_shared (is_shared)
);

-- 物料库表
CREATE TABLE assets (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_type VARCHAR(50) NOT NULL, -- 'image', 'document', 'video', 'audio', etc.
    description TEXT,
    tags JSON,
    ai_summary TEXT, -- AI生成的文件摘要
    ai_keywords JSON, -- AI提取的关键词
    download_count INT DEFAULT 0,
    is_public BOOLEAN DEFAULT FALSE,
    version INT DEFAULT 1,
    parent_id VARCHAR(36), -- 用于版本控制
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES assets(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_file_type (file_type),
    INDEX idx_created_at (created_at),
    INDEX idx_is_public (is_public),
    INDEX idx_parent_id (parent_id),
    FULLTEXT idx_search (original_name, description, ai_summary)
);

-- 记事本表
CREATE TABLE notes (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    content_type ENUM('text', 'markdown', 'html') DEFAULT 'markdown',
    tags JSON,
    is_pinned BOOLEAN DEFAULT FALSE,
    is_archived BOOLEAN DEFAULT FALSE,
    folder VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at),
    INDEX idx_is_pinned (is_pinned),
    INDEX idx_is_archived (is_archived),
    INDEX idx_folder (folder),
    FULLTEXT idx_search (title, content)
);

-- 待办清单表
CREATE TABLE todo_lists (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#3B82F6', -- 十六进制颜色
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at),
    INDEX idx_is_archived (is_archived)
);

-- 待办事项表
CREATE TABLE todo_items (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    list_id VARCHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    is_completed BOOLEAN DEFAULT FALSE,
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    due_date TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (list_id) REFERENCES todo_lists(id) ON DELETE CASCADE,
    INDEX idx_list_id (list_id),
    INDEX idx_is_completed (is_completed),
    INDEX idx_priority (priority),
    INDEX idx_due_date (due_date),
    INDEX idx_sort_order (sort_order)
);

-- AI工具表（缓存外部API数据）
CREATE TABLE ai_tools (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    url VARCHAR(500) NOT NULL,
    logo_url VARCHAR(500),
    rating DECIMAL(3,2),
    pricing VARCHAR(100),
    features JSON,
    tags JSON,
    is_featured BOOLEAN DEFAULT FALSE,
    view_count INT DEFAULT 0,
    last_synced_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_category (category),
    INDEX idx_is_featured (is_featured),
    INDEX idx_rating (rating),
    INDEX idx_last_synced_at (last_synced_at),
    FULLTEXT idx_search (name, description)
);

-- 用户AI工具收藏表
CREATE TABLE user_ai_tool_favorites (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    tool_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (tool_id) REFERENCES ai_tools(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_tool (user_id, tool_id),
    INDEX idx_user_id (user_id),
    INDEX idx_tool_id (tool_id)
);

-- 系统日志表
CREATE TABLE system_logs (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id VARCHAR(36),
    details JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_resource_type (resource_type),
    INDEX idx_created_at (created_at)
);

-- 插入默认用户数据
INSERT INTO users (id, username, email, password_hash, role) VALUES 
-- 超级管理员账号
('zhangshuang-uuid-001', 'zhangshuang', 'zhangshuang@xueke.ai', '$2a$12$G5kcPyGyxzPnkeat3H7Sy.p58Q.DWo9YygYz1kZ4ChA6YtZNrsl8a', 'super_admin'),
('yuli-uuid-002', 'yuli', 'yuli@xueke.ai', '$2a$12$G5kcPyGyxzPnkeat3H7Sy.p58Q.DWo9YygYz1kZ4ChA6YtZNrsl8a', 'super_admin'),
-- 普通用户账号
('lichengcheng-uuid-003', 'lichengcheng', 'lichengcheng@xueke.ai', '$2a$12$G5kcPyGyxzPnkeat3H7Sy.p58Q.DWo9YygYz1kZ4ChA6YtZNrsl8a', 'standard_user'),
('liuli-uuid-004', 'liuli', 'liuli@xueke.ai', '$2a$12$G5kcPyGyxzPnkeat3H7Sy.p58Q.DWo9YygYz1kZ4ChA6YtZNrsl8a', 'standard_user'),
('wangxin-uuid-005', 'wangxin', 'wangxin@xueke.ai', '$2a$12$G5kcPyGyxzPnkeat3H7Sy.p58Q.DWo9YygYz1kZ4ChA6YtZNrsl8a', 'standard_user'),
-- 原有测试账号保留
('admin-uuid-1234', 'admin', 'admin@xueke.ai', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.PmvlJO', 'super_admin'),
('user-uuid-5678', 'user', 'user@xueke.ai', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'standard_user');

-- 插入默认用户设置
INSERT INTO user_settings (user_id, theme, api_keys) VALUES 
('zhangshuang-uuid-001', 'dark', '{}'),
('yuli-uuid-002', 'dark', '{}'),
('lichengcheng-uuid-003', 'dark', '{}'),
('liuli-uuid-004', 'dark', '{}'),
('wangxin-uuid-005', 'dark', '{}'),
('admin-uuid-1234', 'dark', '{}'),
('user-uuid-5678', 'dark', '{}');

-- 创建全文搜索索引（如果支持）
-- ALTER TABLE assets ADD FULLTEXT(original_name, description, ai_summary);
-- ALTER TABLE notes ADD FULLTEXT(title, content);
-- ALTER TABLE ai_tools ADD FULLTEXT(name, description);