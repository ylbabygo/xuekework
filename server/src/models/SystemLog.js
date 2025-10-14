const { query } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class SystemLog {
  constructor() {
    this.tableName = 'system_logs';
  }

  /**
   * 创建系统日志
   * @param {Object} logData - 日志数据
   * @param {string} logData.user_id - 用户ID
   * @param {string} logData.action - 操作类型
   * @param {string} logData.description - 描述
   * @param {Object} logData.metadata - 元数据
   * @param {string} logData.ip_address - IP地址
   * @param {string} logData.user_agent - 用户代理
   * @returns {Promise<Object>} 创建的日志记录
   */
  async create(logData) {
    try {
      const id = uuidv4();
      const sql = `
        INSERT INTO system_logs (
          id, user_id, action, resource_type, resource_id, 
          details, ip_address, user_agent, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `;
      
      const params = [
        id,
        logData.user_id,
        logData.action,
        logData.resource_type || null,
        logData.resource_id || null,
        JSON.stringify(logData.details || logData.metadata || {}),
        logData.ip_address || null,
        logData.user_agent || null
      ];

      await query(sql, params);

      // 返回创建的记录
      const selectSql = 'SELECT * FROM system_logs WHERE id = ?';
      const rows = await query(selectSql, [id]);
      return rows[0];
    } catch (error) {
      console.error('SystemLog create failed:', error);
      throw error;
    }
  }

  /**
   * 根据用户ID获取系统日志
   * @param {string} userId - 用户ID
   * @param {number} limit - 限制数量
   * @returns {Promise<Array>} 日志列表
   */
  async findByUserId(userId, limit = 50) {
    try {
      const sql = `
        SELECT * FROM system_logs 
        WHERE user_id = ? 
        ORDER BY created_at DESC 
        LIMIT ?
      `;
      const rows = await query(sql, [userId, limit]);
      return rows || [];
    } catch (error) {
      console.error('SystemLog findByUserId failed:', error);
      throw error;
    }
  }

  /**
   * 获取所有系统日志（管理员用）
   * @param {number} limit - 限制数量
   * @returns {Promise<Array>} 日志列表
   */
  async findAll(limit = 100) {
    try {
      const sql = `
        SELECT * FROM system_logs 
        ORDER BY created_at DESC 
        LIMIT ?
      `;
      const rows = await query(sql, [limit]);
      return rows || [];
    } catch (error) {
      console.error('SystemLog findAll failed:', error);
      throw error;
    }
  }

  /**
   * 记录用户登录日志
   * @param {string} userId - 用户ID
   * @param {string} ipAddress - IP地址
   * @param {string} userAgent - 用户代理
   * @returns {Promise<Object>} 创建的日志记录
   */
  async logLogin(userId, ipAddress, userAgent) {
    return this.create({
      user_id: userId,
      action: 'login',
      details: { description: '用户登录', login_time: new Date().toISOString() },
      ip_address: ipAddress,
      user_agent: userAgent
    });
  }

  /**
   * 记录用户注册日志
   * @param {string} userId - 用户ID
   * @param {string} ipAddress - IP地址
   * @param {string} userAgent - 用户代理
   * @returns {Promise<Object>} 创建的日志记录
   */
  async logRegister(userId, ipAddress, userAgent) {
    return this.create({
      user_id: userId,
      action: 'register',
      details: { description: '用户注册', register_time: new Date().toISOString() },
      ip_address: ipAddress,
      user_agent: userAgent
    });
  }

  /**
   * 记录用户登出日志
   * @param {string} userId - 用户ID
   * @param {string} ipAddress - IP地址
   * @param {string} userAgent - 用户代理
   * @returns {Promise<Object>} 创建的日志记录
   */
  async logLogout(userId, ipAddress, userAgent) {
    return this.create({
      user_id: userId,
      action: 'logout',
      details: { description: '用户登出', logout_time: new Date().toISOString() },
      ip_address: ipAddress,
      user_agent: userAgent
    });
  }
}

module.exports = SystemLog;