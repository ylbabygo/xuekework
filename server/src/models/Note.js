const { query, transaction } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class Note {
  constructor(data) {
    this.id = data.id;
    this.user_id = data.user_id;
    this.title = data.title;
    this.content = data.content;
    this.content_type = data.content_type;
    this.tags = data.tags;
    this.is_pinned = data.is_pinned;
    this.is_archived = data.is_archived;
    this.folder = data.folder;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // 创建新笔记
  static async create(noteData) {
    const {
      user_id,
      title,
      content,
      content_type = 'markdown',
      tags = [],
      folder = null
    } = noteData;

    const id = uuidv4();
    const sql = `
      INSERT INTO notes (id, user_id, title, content, content_type, tags, folder)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    await query(sql, [
      id, user_id, title, content, content_type, JSON.stringify(tags), folder
    ]);

    return await this.findById(id);
  }

  // 根据ID查找笔记
  static async findById(id) {
    const sql = 'SELECT * FROM notes WHERE id = ?';
    const rows = await query(sql, [id]);
    if (rows.length === 0) return null;

    const note = new Note(rows[0]);
    note.tags = JSON.parse(note.tags || '[]');
    return note;
  }

  // 获取用户的笔记列表
  static async getByUser(userId, options = {}) {
    const {
      page = 1,
      limit = 20,
      search = '',
      tags = [],
      folder = '',
      is_pinned = null,
      is_archived = false,
      sort_by = 'updated_at',
      sort_order = 'DESC'
    } = options;

    let sql = 'SELECT * FROM notes WHERE user_id = ? AND is_archived = ?';
    let countSql = 'SELECT COUNT(*) as total FROM notes WHERE user_id = ? AND is_archived = ?';
    const params = [userId, is_archived];

    // 搜索条件
    if (search) {
      sql += ' AND (title LIKE ? OR content LIKE ?)';
      countSql += ' AND (title LIKE ? OR content LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }

    // 标签筛选
    if (tags.length > 0) {
      const tagConditions = tags.map(() => 'JSON_CONTAINS(tags, ?)').join(' AND ');
      sql += ` AND ${tagConditions}`;
      countSql += ` AND ${tagConditions}`;
      tags.forEach(tag => {
        params.push(JSON.stringify(tag));
      });
    }

    // 文件夹筛选
    if (folder) {
      sql += ' AND folder = ?';
      countSql += ' AND folder = ?';
      params.push(folder);
    } else if (folder === null) {
      sql += ' AND folder IS NULL';
      countSql += ' AND folder IS NULL';
    }

    // 置顶筛选
    if (is_pinned !== null) {
      sql += ' AND is_pinned = ?';
      countSql += ' AND is_pinned = ?';
      params.push(is_pinned);
    }

    // 获取总数
    const [countResult] = await query(countSql, params);
    const total = countResult.total;

    // 排序和分页
    const validSortFields = ['created_at', 'updated_at', 'title'];
    const sortField = validSortFields.includes(sort_by) ? sort_by : 'updated_at';
    const sortDirection = sort_order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    
    // 置顶笔记优先显示
    sql += ` ORDER BY is_pinned DESC, ${sortField} ${sortDirection}`;
    
    const offset = (page - 1) * limit;
    sql += ' LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const rows = await query(sql, params);
    const notes = rows.map(row => {
      const note = new Note(row);
      note.tags = JSON.parse(note.tags || '[]');
      return note;
    });

    return {
      notes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // 更新笔记
  async update(updateData) {
    const allowedFields = ['title', 'content', 'content_type', 'tags', 'folder'];
    const updates = [];
    const values = [];

    for (const [key, value] of Object.entries(updateData)) {
      if (allowedFields.includes(key) && value !== undefined) {
        if (key === 'tags') {
          updates.push(`${key} = ?`);
          values.push(JSON.stringify(value));
        } else {
          updates.push(`${key} = ?`);
          values.push(value);
        }
      }
    }

    if (updates.length === 0) {
      throw new Error('没有可更新的字段');
    }

    values.push(this.id);
    const sql = `UPDATE notes SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    
    await query(sql, values);
    
    // 重新获取更新后的笔记信息
    const updatedNote = await Note.findById(this.id);
    Object.assign(this, updatedNote);
    
    return this;
  }

  // 切换置顶状态
  async togglePin() {
    const sql = 'UPDATE notes SET is_pinned = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    const newPinnedState = !this.is_pinned;
    await query(sql, [newPinnedState, this.id]);
    this.is_pinned = newPinnedState;
    return this;
  }

  // 归档笔记
  async archive() {
    const sql = 'UPDATE notes SET is_archived = TRUE, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    await query(sql, [this.id]);
    this.is_archived = true;
    return this;
  }

  // 取消归档
  async unarchive() {
    const sql = 'UPDATE notes SET is_archived = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    await query(sql, [this.id]);
    this.is_archived = false;
    return this;
  }

  // 删除笔记
  async delete() {
    const sql = 'DELETE FROM notes WHERE id = ?';
    await query(sql, [this.id]);
    return true;
  }

  // 获取用户的文件夹列表
  static async getFolders(userId) {
    const sql = `
      SELECT folder, COUNT(*) as note_count
      FROM notes 
      WHERE user_id = ? AND folder IS NOT NULL AND is_archived = FALSE
      GROUP BY folder
      ORDER BY folder ASC
    `;
    
    const rows = await query(sql, [userId]);
    return rows;
  }

  // 获取用户的标签列表
  static async getTags(userId) {
    const sql = 'SELECT tags FROM notes WHERE user_id = ? AND is_archived = FALSE';
    const rows = await query(sql, [userId]);
    
    const tagCounts = {};
    rows.forEach(row => {
      const tags = JSON.parse(row.tags || '[]');
      tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    return Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count);
  }

  // 批量操作
  static async batchUpdate(noteIds, userId, updateData) {
    const allowedFields = ['is_pinned', 'is_archived', 'folder'];
    const updates = [];
    const values = [];

    for (const [key, value] of Object.entries(updateData)) {
      if (allowedFields.includes(key) && value !== undefined) {
        updates.push(`${key} = ?`);
        values.push(value);
      }
    }

    if (updates.length === 0) {
      throw new Error('没有可更新的字段');
    }

    values.push(...noteIds, userId);
    const placeholders = noteIds.map(() => '?').join(',');
    const sql = `
      UPDATE notes 
      SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP 
      WHERE id IN (${placeholders}) AND user_id = ?
    `;
    
    const result = await query(sql, values);
    return result.affectedRows;
  }

  // 批量删除
  static async batchDelete(noteIds, userId) {
    const placeholders = noteIds.map(() => '?').join(',');
    const sql = `DELETE FROM notes WHERE id IN (${placeholders}) AND user_id = ?`;
    
    const result = await query(sql, [...noteIds, userId]);
    return result.affectedRows;
  }

  // 搜索笔记（全文搜索）
  static async search(userId, searchTerm, options = {}) {
    const { page = 1, limit = 20 } = options;
    
    const sql = `
      SELECT *, MATCH(title, content) AGAINST(? IN NATURAL LANGUAGE MODE) as relevance
      FROM notes 
      WHERE user_id = ? AND is_archived = FALSE
      AND MATCH(title, content) AGAINST(? IN NATURAL LANGUAGE MODE)
      ORDER BY relevance DESC, updated_at DESC
      LIMIT ? OFFSET ?
    `;
    
    const offset = (page - 1) * limit;
    const rows = await query(sql, [searchTerm, userId, searchTerm, limit, offset]);
    
    const notes = rows.map(row => {
      const note = new Note(row);
      note.tags = JSON.parse(note.tags || '[]');
      note.relevance = row.relevance;
      return note;
    });

    return {
      notes,
      pagination: {
        page,
        limit,
        total: notes.length,
        pages: Math.ceil(notes.length / limit)
      }
    };
  }

  // 获取最近更新的笔记
  static async getRecentlyUpdated(userId, limit = 10) {
    const sql = `
      SELECT * FROM notes 
      WHERE user_id = ? AND is_archived = FALSE
      ORDER BY updated_at DESC
      LIMIT ?
    `;
    
    const rows = await query(sql, [userId, limit]);
    return rows.map(row => {
      const note = new Note(row);
      note.tags = JSON.parse(note.tags || '[]');
      return note;
    });
  }

  // 检查用户是否有访问权限
  canAccess(userId) {
    return this.user_id === userId;
  }

  // 转换为JSON格式
  toJSON() {
    return {
      ...this,
      tags: this.tags || []
    };
  }
}

module.exports = Note;