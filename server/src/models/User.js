const { query } = require('../config/database');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

class User {
  constructor(data) {
    this.id = data.id;
    this.username = data.username;
    this.email = data.email;
    this.password_hash = data.password_hash;
    this.role = data.role;
    this.avatar_url = data.avatar_url;
    this.is_active = data.is_active;
    this.last_login_at = data.last_login_at;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // 通用查询方法
  static async executeQuery(sql, params = []) {
    return await query(sql, params);
  }



  // 创建新用户
  static async create(userData) {
    const { username, email, password, role = 'standard_user' } = userData;
    
    // 检查用户名是否已存在
    const existingUser = await this.findByUsername(username);
    if (existingUser) {
      throw new Error('用户名已存在');
    }

    // 检查邮箱是否已存在（如果提供了邮箱）
    if (email) {
      const existingEmail = await this.findByEmail(email);
      if (existingEmail) {
        throw new Error('邮箱已存在');
      }
    }

    // 加密密码
    const saltRounds = 12;
    const password_hash = await bcrypt.hash(password, saltRounds);

    const id = uuidv4();
    const sql = `
      INSERT INTO users (id, username, email, password_hash, role)
      VALUES (?, ?, ?, ?, ?)
    `;

    await this.executeQuery(sql, [id, username, email, password_hash, role]);

    // 创建用户设置
    await this.executeQuery(
      'INSERT INTO user_settings (user_id) VALUES (?)',
      [id]
    );

    return await this.findById(id);
  }

  // 根据ID查找用户
  static async findById(id) {
    const sql = 'SELECT * FROM users WHERE id = ? AND is_active = TRUE';
    const rows = await this.executeQuery(sql, [id]);
    return rows.length > 0 ? new User(rows[0]) : null;
  }

  // 根据用户名查找用户
  static async findByUsername(username) {
    const sql = 'SELECT * FROM users WHERE username = ? AND is_active = TRUE';
    const rows = await this.executeQuery(sql, [username]);
    return rows.length > 0 ? new User(rows[0]) : null;
  }

  // 根据邮箱查找用户
  static async findByEmail(email) {
    const sql = 'SELECT * FROM users WHERE email = ? AND is_active = TRUE';
    const rows = await this.executeQuery(sql, [email]);
    return rows.length > 0 ? new User(rows[0]) : null;
  }

  // 验证密码
  async validatePassword(password) {
    return await bcrypt.compare(password, this.password_hash);
  }

  // 更新最后登录时间
  async updateLastLogin() {
    const sql = 'UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?';
    await query(sql, [this.id]);
    this.last_login_at = new Date();
  }

  // 更新用户信息
  async update(updateData) {
    const allowedFields = ['email', 'avatar_url'];
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

    values.push(this.id);
    const sql = `UPDATE users SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    
    await query(sql, values);
    
    // 重新获取更新后的用户信息
    const updatedUser = await User.findById(this.id);
    Object.assign(this, updatedUser);
    
    return this;
  }

  // 修改密码
  async changePassword(oldPassword, newPassword) {
    // 验证旧密码
    const isValidOldPassword = await this.validatePassword(oldPassword);
    if (!isValidOldPassword) {
      throw new Error('原密码错误');
    }

    // 加密新密码
    const saltRounds = 12;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    const sql = 'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    await query(sql, [newPasswordHash, this.id]);
    
    this.password_hash = newPasswordHash;
    return true;
  }

  // 获取用户列表（管理员功能）
  static async getList(page = 1, limit = 10, search = '') {
    let sql = 'SELECT id, username, email, role, is_active, last_login_at, created_at FROM users';
    let countSql = 'SELECT COUNT(*) as total FROM users';
    const params = [];

    if (search) {
      const searchCondition = ' WHERE (username LIKE ? OR email LIKE ?)';
      sql += searchCondition;
      countSql += searchCondition;
      params.push(`%${search}%`, `%${search}%`);
    }

    // 获取总数
    const [countResult] = await query(countSql, params);
    const total = countResult.total;

    // 获取分页数据
    const offset = (page - 1) * limit;
    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const rows = await query(sql, params);
    const users = rows.map(row => new User(row));

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // 软删除用户
  async softDelete() {
    const sql = 'UPDATE users SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    await query(sql, [this.id]);
    this.is_active = false;
  }

  // 恢复用户
  async restore() {
    const sql = 'UPDATE users SET is_active = TRUE, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    await query(sql, [this.id]);
    this.is_active = true;
  }

  // 获取用户设置
  async getSettings() {
    const sql = 'SELECT * FROM user_settings WHERE user_id = ?';
    const rows = await query(sql, [this.id]);
    
    if (rows.length === 0) {
      return null;
    }
    
    const settings = rows[0];
    
    // 处理JSON字段，确保不为null并包含所有API密钥字段
    let apiKeys = {
      openai: '',
      claude: '',
      gemini: '',
      deepseek: '',
      kimi: '',
      baidu: '',
      baidu_secret: '',
      zhipu: ''
    };
    if (settings.api_keys) {
      try {
        const parsedKeys = typeof settings.api_keys === 'string'
          ? JSON.parse(settings.api_keys)
          : settings.api_keys;
        // 合并默认值和已存在的值，确保向后兼容
        apiKeys = { ...apiKeys, ...parsedKeys };

        // 向后兼容：如果存在旧的字段名，映射到新的字段名
        if (parsedKeys.openai_api_key && !parsedKeys.openai) {
          apiKeys.openai = parsedKeys.openai_api_key;
        }
        if (parsedKeys.claude_api_key && !parsedKeys.claude) {
          apiKeys.claude = parsedKeys.claude_api_key;
        }
        if (parsedKeys.gemini_api_key && !parsedKeys.gemini) {
          apiKeys.gemini = parsedKeys.gemini_api_key;
        }
        if (parsedKeys.baidu_api_key && !parsedKeys.baidu) {
          apiKeys.baidu = parsedKeys.baidu_api_key;
        }
        if (parsedKeys.baidu_secret_key && !parsedKeys.baidu_secret) {
          apiKeys.baidu_secret = parsedKeys.baidu_secret_key;
        }
        if (parsedKeys.zhipu_api_key && !parsedKeys.zhipu) {
          apiKeys.zhipu = parsedKeys.zhipu_api_key;
        }
      } catch (error) {
        console.error('解析api_keys失败:', error);
      }
    }
    
    let notificationSettings = {
      email_notifications: true,
      push_notifications: true,
      task_reminders: true
    };
    if (settings.notification_settings) {
      try {
        notificationSettings = typeof settings.notification_settings === 'string'
          ? JSON.parse(settings.notification_settings)
          : settings.notification_settings;
      } catch (error) {
        console.error('解析notification_settings失败:', error);
      }
    }
    
    return {
      ...settings,
      api_keys: apiKeys,
      notification_settings: notificationSettings
    };
  }

  // 更新用户设置
  async updateSettings(settings) {
    const { theme, language, api_keys, notification_settings } = settings;
    
    const sql = `
      UPDATE user_settings 
      SET theme = ?, language = ?, api_keys = ?, notification_settings = ?, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `;
    
    await query(sql, [
      theme,
      language,
      JSON.stringify(api_keys || {}),
      JSON.stringify(notification_settings || {}),
      this.id
    ]);
    
    return await this.getSettings();
  }

  // 转换为安全的JSON格式（不包含密码）
  toJSON() {
    const { password_hash, ...safeUser } = this;
    return safeUser;
  }

  // 检查用户权限
  hasPermission(requiredRole) {
    const roleHierarchy = {
      'standard_user': 1,
      'super_admin': 2
    };
    
    const userLevel = roleHierarchy[this.role] || 0;
    const requiredLevel = roleHierarchy[requiredRole] || 0;
    
    return userLevel >= requiredLevel;
  }

  // 获取用户统计信息
  async getStats() {
    const stats = {};
    
    // 获取AI对话数量
    const [conversationCount] = await query(
      'SELECT COUNT(*) as count FROM ai_conversations WHERE user_id = ?',
      [this.id]
    );
    stats.conversations = conversationCount.count;

    // 获取内容生成数量
    const [contentCount] = await query(
      'SELECT COUNT(*) as count FROM content_generations WHERE user_id = ?',
      [this.id]
    );
    stats.content_generations = contentCount.count;

    // 获取物料数量
    const [assetCount] = await query(
      'SELECT COUNT(*) as count FROM assets WHERE user_id = ?',
      [this.id]
    );
    stats.assets = assetCount.count;

    // 获取笔记数量
    const [noteCount] = await query(
      'SELECT COUNT(*) as count FROM notes WHERE user_id = ? AND is_archived = FALSE',
      [this.id]
    );
    stats.notes = noteCount.count;

    // 获取待办事项数量
    const [todoCount] = await query(
      `SELECT COUNT(*) as count FROM todo_items ti 
       JOIN todo_lists tl ON ti.list_id = tl.id 
       WHERE tl.user_id = ? AND ti.is_completed = FALSE`,
      [this.id]
    );
    stats.pending_todos = todoCount.count;

    return stats;
  }
}

module.exports = User;