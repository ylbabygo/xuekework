const { query } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class UserAIToolFavorite {
  constructor(data) {
    this.id = data.id;
    this.user_id = data.user_id;
    this.tool_id = data.tool_id;
    this.created_at = data.created_at;
  }

  // 添加收藏
  static async create(userId, toolId) {
    // 检查是否已经收藏
    const existing = await UserAIToolFavorite.findByUserAndTool(userId, toolId);
    if (existing) {
      throw new Error('已经收藏过此工具');
    }

    const id = uuidv4();
    const sql = `
      INSERT INTO user_ai_tool_favorites (id, user_id, tool_id)
      VALUES (?, ?, ?)
    `;

    await query(sql, [id, userId, toolId]);
    return await UserAIToolFavorite.findById(id);
  }

  // 根据ID查找收藏记录
  static async findById(id) {
    const sql = 'SELECT * FROM user_ai_tool_favorites WHERE id = ?';
    const rows = await query(sql, [id]);
    return rows.length > 0 ? new UserAIToolFavorite(rows[0]) : null;
  }

  // 根据用户ID和工具ID查找收藏记录
  static async findByUserAndTool(userId, toolId) {
    const sql = 'SELECT * FROM user_ai_tool_favorites WHERE user_id = ? AND tool_id = ?';
    const rows = await query(sql, [userId, toolId]);
    return rows.length > 0 ? new UserAIToolFavorite(rows[0]) : null;
  }

  // 获取用户收藏的AI工具列表
  static async getUserFavorites(userId, options = {}) {
    const { limit = 50, offset = 0 } = options;

    const sql = `
      SELECT 
        f.*,
        t.name,
        t.description,
        t.category,
        t.url,
        t.logo_url,
        t.rating,
        t.pricing,
        t.features,
        t.tags,
        t.is_featured,
        t.view_count
      FROM user_ai_tool_favorites f
      JOIN ai_tools t ON f.tool_id = t.id
      WHERE f.user_id = ?
      ORDER BY f.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const rows = await query(sql, [userId, limit, offset]);
    return rows.map(row => ({
      favorite_id: row.id,
      favorited_at: row.created_at,
      tool: {
        id: row.tool_id,
        name: row.name,
        description: row.description,
        category: row.category,
        url: row.url,
        logo_url: row.logo_url,
        rating: row.rating,
        pricing: row.pricing,
        features: typeof row.features === 'string' ? JSON.parse(row.features) : row.features,
        tags: typeof row.tags === 'string' ? JSON.parse(row.tags) : row.tags,
        is_featured: row.is_featured,
        view_count: row.view_count
      }
    }));
  }

  // 获取用户收藏的工具ID列表
  static async getUserFavoriteToolIds(userId) {
    const sql = 'SELECT tool_id FROM user_ai_tool_favorites WHERE user_id = ?';
    const rows = await query(sql, [userId]);
    return rows.map(row => row.tool_id);
  }

  // 检查用户是否收藏了某个工具
  static async isFavorited(userId, toolId) {
    const favorite = await UserAIToolFavorite.findByUserAndTool(userId, toolId);
    return !!favorite;
  }

  // 取消收藏
  static async removeFavorite(userId, toolId) {
    const sql = 'DELETE FROM user_ai_tool_favorites WHERE user_id = ? AND tool_id = ?';
    const result = await query(sql, [userId, toolId]);
    return result.affectedRows > 0;
  }

  // 获取工具的收藏统计
  static async getToolFavoriteStats(toolId) {
    const sql = `
      SELECT 
        COUNT(*) as favorite_count,
        DATE(created_at) as date,
        COUNT(*) as daily_favorites
      FROM user_ai_tool_favorites 
      WHERE tool_id = ?
      GROUP BY DATE(created_at)
      ORDER BY date DESC
      LIMIT 30
    `;
    const rows = await query(sql, [toolId]);
    
    const totalSql = 'SELECT COUNT(*) as total FROM user_ai_tool_favorites WHERE tool_id = ?';
    const totalRows = await query(totalSql, [toolId]);
    
    return {
      total_favorites: totalRows[0].total,
      daily_stats: rows
    };
  }

  // 获取用户收藏统计
  static async getUserFavoriteStats(userId) {
    const sql = `
      SELECT 
        COUNT(*) as total_favorites,
        COUNT(DISTINCT t.category) as categories_count,
        AVG(t.rating) as avg_rating
      FROM user_ai_tool_favorites f
      JOIN ai_tools t ON f.tool_id = t.id
      WHERE f.user_id = ?
    `;
    const rows = await query(sql, [userId]);
    return rows[0];
  }

  // 删除收藏记录
  async delete() {
    const sql = 'DELETE FROM user_ai_tool_favorites WHERE id = ?';
    const result = await query(sql, [this.id]);
    return result.affectedRows > 0;
  }

  // 转换为JSON格式
  toJSON() {
    return {
      id: this.id,
      user_id: this.user_id,
      tool_id: this.tool_id,
      created_at: this.created_at
    };
  }
}

module.exports = UserAIToolFavorite;