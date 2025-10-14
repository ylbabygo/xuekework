-- 创建用户AI工具书签表
CREATE TABLE IF NOT EXISTS user_ai_tool_bookmarks (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  tool_id VARCHAR(36) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (tool_id) REFERENCES ai_tools(id) ON DELETE CASCADE,
  UNIQUE(user_id, tool_id)
);

-- 创建索引
CREATE INDEX idx_user_bookmarks_user_id ON user_ai_tool_bookmarks(user_id);
CREATE INDEX idx_user_bookmarks_tool_id ON user_ai_tool_bookmarks(tool_id);
CREATE INDEX idx_user_bookmarks_created_at ON user_ai_tool_bookmarks(created_at);