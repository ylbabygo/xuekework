const { query } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class Message {
  constructor(data) {
    this.id = data.id;
    this.conversation_id = data.conversation_id;
    this.role = data.role; // 'user', 'assistant', 'system'
    this.content = data.content;
    this.tokens = data.tokens || 0;
    this.metadata = data.metadata ? (typeof data.metadata === 'string' ? JSON.parse(data.metadata) : data.metadata) : null;
    this.created_at = data.created_at;
  }

  // 创建新消息
  static async create(conversationId, role, content, tokens = 0, metadata = null) {
    const id = uuidv4();
    const sql = `
      INSERT INTO ai_messages (id, conversation_id, role, content, tokens, metadata, created_at)
      VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
    `;
    
    const metadataStr = metadata ? JSON.stringify(metadata) : null;
    await query(sql, [id, conversationId, role, content, tokens, metadataStr]);
    
    return new Message({
      id,
      conversation_id: conversationId,
      role,
      content,
      tokens,
      metadata,
      created_at: new Date().toISOString()
    });
  }

  // 根据ID查找消息
  static async findById(id) {
    const sql = 'SELECT * FROM ai_messages WHERE id = ?';
    const rows = await query(sql, [id]);
    
    if (rows.length === 0) {
      return null;
    }
    
    return new Message(rows[0]);
  }

  // 获取对话的所有消息
  static async findByConversationId(conversationId, options = {}) {
    const { page = 1, limit = 50, order = 'ASC' } = options;
    const offset = (page - 1) * limit;
    
    const sql = `
      SELECT * FROM ai_messages 
      WHERE conversation_id = ?
      ORDER BY created_at ${order}
      LIMIT ? OFFSET ?
    `;
    
    const rows = await query(sql, [conversationId, limit, offset]);
    return rows.map(row => new Message(row));
  }

  // 获取对话的消息数量
  static async countByConversationId(conversationId) {
    const sql = 'SELECT COUNT(*) as count FROM ai_messages WHERE conversation_id = ?';
    const rows = await query(sql, [conversationId]);
    return rows[0].count;
  }

  // 删除消息
  async delete() {
    const sql = 'DELETE FROM ai_messages WHERE id = ?';
    await query(sql, [this.id]);
    return true;
  }

  // 更新消息内容
  async updateContent(content) {
    const sql = 'UPDATE ai_messages SET content = ? WHERE id = ?';
    await query(sql, [content, this.id]);
    this.content = content;
    return this;
  }

  // 更新消息元数据
  async updateMetadata(metadata) {
    const metadataStr = metadata ? JSON.stringify(metadata) : null;
    const sql = 'UPDATE ai_messages SET metadata = ? WHERE id = ?';
    await query(sql, [metadataStr, this.id]);
    this.metadata = metadata;
    return this;
  }

  // 转换为JSON格式
  toJSON() {
    return {
      id: this.id,
      conversation_id: this.conversation_id,
      role: this.role,
      content: this.content,
      tokens: this.tokens,
      metadata: this.metadata,
      created_at: this.created_at
    };
  }
}

module.exports = Message;