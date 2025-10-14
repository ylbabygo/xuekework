const { query } = require('../config/sqlite');
const { v4: uuidv4 } = require('uuid');

class UserAIToolBookmark {
  constructor(data) {
    this.id = data.id;
    this.user_id = data.user_id;
    this.tool_id = data.tool_id;
    this.created_at = data.created_at;
  }

  // 添加书签
  static async addBookmark(userId, toolId) {
    const id = uuidv4();
    const sql = `
      INSERT INTO user_ai_tool_bookmarks (id, user_id, tool_id, created_at)
      VALUES (?, ?, ?, datetime('now'))
    `;
    
    try {
      await query(sql, [id, userId, toolId]);
      return new UserAIToolBookmark({
        id,
        user_id: userId,
        tool_id: toolId,
        created_at: new Date().toISOString()
      });
    } catch (error) {
      if (error.message.includes('UNIQUE constraint failed')) {
        throw new Error('工具已在书签中');
      }
      throw error;
    }
  }

  // 移除书签
  static async removeBookmark(userId, toolId) {
    const sql = 'DELETE FROM user_ai_tool_bookmarks WHERE user_id = ? AND tool_id = ?';
    const result = await query(sql, [userId, toolId]);
    return result.changes > 0;
  }

  // 检查是否已书签
  static async isBookmarked(userId, toolId) {
    const sql = 'SELECT 1 FROM user_ai_tool_bookmarks WHERE user_id = ? AND tool_id = ?';
    const rows = await query(sql, [userId, toolId]);
    return rows.length > 0;
  }

  // 获取用户的所有书签工具ID
  static async getUserBookmarkToolIds(userId) {
    const sql = 'SELECT tool_id FROM user_ai_tool_bookmarks WHERE user_id = ?';
    const rows = await query(sql, [userId]);
    return rows.map(row => row.tool_id);
  }

  // 获取用户的书签工具详情
  static async getUserBookmarks(userId, options = {}) {
    const { limit = 50, offset = 0 } = options;
    
    const sql = `
      SELECT at.*, uab.created_at as bookmarked_at
      FROM user_ai_tool_bookmarks uab
      JOIN ai_tools at ON uab.tool_id = at.id
      WHERE uab.user_id = ?
      ORDER BY uab.created_at DESC
      LIMIT ? OFFSET ?
    `;
    
    const rows = await query(sql, [userId, limit, offset]);
    return rows;
  }

  // 获取工具的书签数量
  static async getBookmarkCount(toolId) {
    const sql = 'SELECT COUNT(*) as count FROM user_ai_tool_bookmarks WHERE tool_id = ?';
    const rows = await query(sql, [toolId]);
    return rows[0]?.count || 0;
  }

  // 删除用户的所有书签
  static async deleteUserBookmarks(userId) {
    const sql = 'DELETE FROM user_ai_tool_bookmarks WHERE user_id = ?';
    await query(sql, [userId]);
  }

  // 删除工具的所有书签
  static async deleteToolBookmarks(toolId) {
    const sql = 'DELETE FROM user_ai_tool_bookmarks WHERE tool_id = ?';
    await query(sql, [toolId]);
  }

  toJSON() {
    return {
      id: this.id,
      user_id: this.user_id,
      tool_id: this.tool_id,
      created_at: this.created_at
    };
  }
}

module.exports = UserAIToolBookmark;