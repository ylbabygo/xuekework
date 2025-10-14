const { query } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class Conversation {
  constructor(data) {
    this.id = data.id;
    this.user_id = data.user_id;
    this.title = data.title;
    this.model = data.model;
    this.total_messages = data.total_messages || 0;
    this.total_tokens = data.total_tokens || 0;
    this.is_archived = data.is_archived || false;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // 创建新对话
  static async create(userId, title, model = 'gpt-3.5-turbo') {
    const id = uuidv4();
    const sql = `
      INSERT INTO ai_conversations (id, user_id, title, model, created_at, updated_at)
      VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))
    `;
    
    await query(sql, [id, userId, title, model]);
    
    return new Conversation({
      id,
      user_id: userId,
      title,
      model,
      total_messages: 0,
      total_tokens: 0,
      is_archived: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  }

  // 根据ID查找对话
  static async findById(id) {
    const sql = 'SELECT * FROM ai_conversations WHERE id = ?';
    const rows = await query(sql, [id]);
    
    if (rows.length === 0) {
      return null;
    }
    
    return new Conversation(rows[0]);
  }

  // 获取用户的对话列表
  static async findByUserId(userId, options = {}) {
    const { page = 1, limit = 20, archived = false } = options;
    const offset = (page - 1) * limit;
    
    const sql = `
      SELECT * FROM ai_conversations 
      WHERE user_id = ? AND is_archived = ?
      ORDER BY updated_at DESC
      LIMIT ? OFFSET ?
    `;
    
    const rows = await query(sql, [userId, archived ? 1 : 0, limit, offset]);
    return rows.map(row => new Conversation(row));
  }

  // 更新对话标题
  async updateTitle(title) {
    const sql = `
      UPDATE ai_conversations 
      SET title = ?, updated_at = datetime('now')
      WHERE id = ?
    `;
    
    await query(sql, [title, this.id]);
    this.title = title;
    this.updated_at = new Date().toISOString();
    
    return this;
  }

  // 更新统计信息
  async updateStats(messageCount, tokenCount) {
    const sql = `
      UPDATE ai_conversations 
      SET total_messages = total_messages + ?, total_tokens = total_tokens + ?, updated_at = datetime('now')
      WHERE id = ?
    `;
    
    await query(sql, [messageCount, tokenCount, this.id]);
    this.total_messages += messageCount;
    this.total_tokens += tokenCount;
    this.updated_at = new Date().toISOString();
    
    return this;
  }

  // 归档对话
  async archive() {
    const sql = `
      UPDATE ai_conversations 
      SET is_archived = 1, updated_at = datetime('now')
      WHERE id = ?
    `;
    
    await query(sql, [this.id]);
    this.is_archived = true;
    this.updated_at = new Date().toISOString();
    
    return this;
  }

  // 删除对话
  async delete() {
    // 先删除相关消息
    await query('DELETE FROM ai_messages WHERE conversation_id = ?', [this.id]);
    
    // 再删除对话
    await query('DELETE FROM ai_conversations WHERE id = ?', [this.id]);
    
    return true;
  }

  // 获取对话的消息列表
  async getMessages(options = {}) {
    const { page = 1, limit = 50 } = options;
    const offset = (page - 1) * limit;
    
    const sql = `
      SELECT * FROM ai_messages 
      WHERE conversation_id = ?
      ORDER BY created_at ASC
      LIMIT ? OFFSET ?
    `;
    
    const rows = await query(sql, [this.id, limit, offset]);
    return rows;
  }

  // 添加消息到对话
  async addMessage(role, content, tokens = 0, metadata = null) {
    const Message = require('./Message');
    const message = await Message.create(this.id, role, content, tokens, metadata);
    
    // 更新对话统计
    await this.updateStats(1, tokens);
    
    return message;
  }

  // 转换为JSON格式
  toJSON() {
    return {
      id: this.id,
      user_id: this.user_id,
      title: this.title,
      model: this.model,
      total_messages: this.total_messages,
      total_tokens: this.total_tokens,
      is_archived: this.is_archived,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

module.exports = Conversation;