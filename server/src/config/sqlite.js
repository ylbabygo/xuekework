const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs').promises;

// SQLite数据库配置
const dbPath = path.join(__dirname, '../database/xueke_ai.db');

// 创建数据库连接
let db = null;

// 初始化数据库连接
async function initSQLite() {
  try {
    // 确保数据库目录存在
    const dbDir = path.dirname(dbPath);
    await fs.mkdir(dbDir, { recursive: true });

    // 创建数据库连接
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('❌ SQLite连接失败:', err.message);
      } else {
        console.log('✅ SQLite数据库连接成功');
      }
    });

    // 启用外键约束
    await query('PRAGMA foreign_keys = ON');
    
    // 初始化数据库表
    await initTables();
    
    // 创建测试用户
    await createTestUser();
    
    console.log('✅ SQLite数据库初始化完成');
    return true;
  } catch (error) {
    console.error('❌ SQLite初始化失败:', error.message);
    return false;
  }
}

// 执行查询
function query(sql, params = []) {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('数据库未连接'));
      return;
    }

    if (sql.trim().toUpperCase().startsWith('SELECT')) {
      db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    } else {
      db.run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ 
            lastID: this.lastID, 
            changes: this.changes 
          });
        }
      });
    }
  });
}

// 初始化数据库表
async function initTables() {
  const tables = [
    // 用户表
    `CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'standard_user',
      avatar_url TEXT,
      is_active BOOLEAN DEFAULT 1,
      last_login_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    
    // 用户设置表
    `CREATE TABLE IF NOT EXISTS user_settings (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      theme TEXT DEFAULT 'dark',
      language TEXT DEFAULT 'zh-CN',
      api_keys TEXT,
      notification_settings TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id)
    )`,
    
    // AI对话会话表
    `CREATE TABLE IF NOT EXISTS ai_conversations (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      model TEXT,
      total_messages INTEGER DEFAULT 0,
      total_tokens INTEGER DEFAULT 0,
      is_archived BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,
    
    // AI对话消息表
    `CREATE TABLE IF NOT EXISTS ai_messages (
      id TEXT PRIMARY KEY,
      conversation_id TEXT NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      tokens INTEGER DEFAULT 0,
      metadata TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (conversation_id) REFERENCES ai_conversations(id) ON DELETE CASCADE
    )`,
    
    // AI工具表
    `CREATE TABLE IF NOT EXISTS ai_tools (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      short_description TEXT,
      category TEXT,
      subcategory TEXT,
      url TEXT NOT NULL,
      logo_url TEXT,
      screenshot_url TEXT,
      rating REAL,
      rating_count INTEGER DEFAULT 0,
      pricing TEXT,
      pricing_details TEXT,
      features TEXT,
      tags TEXT,
      is_featured BOOLEAN DEFAULT 0,
      is_trending BOOLEAN DEFAULT 0,
      is_new BOOLEAN DEFAULT 0,
      view_count INTEGER DEFAULT 0,
      like_count INTEGER DEFAULT 0,
      bookmark_count INTEGER DEFAULT 0,
      monthly_visits INTEGER DEFAULT 0,
      launch_date TEXT,
      company TEXT,
      country TEXT,
      languages TEXT,
      platforms TEXT,
      api_available BOOLEAN DEFAULT 0,
      open_source BOOLEAN DEFAULT 0,
      free_tier BOOLEAN DEFAULT 0,
      trial_available BOOLEAN DEFAULT 0,
      mobile_app BOOLEAN DEFAULT 0,
      chrome_extension BOOLEAN DEFAULT 0,
      integrations TEXT,
      use_cases TEXT,
      target_audience TEXT,
      difficulty_level TEXT,
      last_synced_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    
    // 用户AI工具收藏表
    `CREATE TABLE IF NOT EXISTS user_ai_tool_favorites (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      tool_id TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (tool_id) REFERENCES ai_tools(id) ON DELETE CASCADE,
      UNIQUE(user_id, tool_id)
    )`,

    // 系统日志表
    `CREATE TABLE IF NOT EXISTS system_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      action TEXT NOT NULL,
      resource_type TEXT,
      resource_id TEXT,
      details TEXT,
      ip_address TEXT,
      user_agent TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    )`
  ];

  for (const table of tables) {
    await query(table);
  }
}

// 创建初始用户
async function createTestUser() {
  const bcrypt = require('bcryptjs');
  const { v4: uuidv4 } = require('uuid');
  
  try {
    // 需求文档中指定的初始用户
    const initialUsers = [
      // 超级管理员
      { username: 'zhangshuang', email: 'zhangshuang@xueke.ai', password: 'xueke666', role: 'super_admin' },
      { username: 'yuli', email: 'yuli@xueke.ai', password: 'xueke666', role: 'super_admin' },
      // 普通用户
      { username: 'lichengcheng', email: 'lichengcheng@xueke.ai', password: 'xueke666', role: 'standard_user' },
      { username: 'liuli', email: 'liuli@xueke.ai', password: 'xueke666', role: 'standard_user' },
      { username: 'wangxin', email: 'wangxin@xueke.ai', password: 'xueke666', role: 'standard_user' },
      // 原有测试账号
      { username: 'admin', email: 'admin@test.com', password: 'admin123', role: 'super_admin' }
    ];

    for (const userData of initialUsers) {
      // 检查用户是否已存在
      const existingUser = await query('SELECT * FROM users WHERE username = ?', [userData.username]);
      if (existingUser.length > 0) {
        console.log(`用户 ${userData.username} 已存在，跳过创建`);
        continue;
      }

      // 创建用户
      const id = uuidv4();
      const password_hash = await bcrypt.hash(userData.password, 12);
      
      await query(
        'INSERT INTO users (id, username, email, password_hash, role) VALUES (?, ?, ?, ?, ?)',
        [id, userData.username, userData.email, password_hash, userData.role]
      );
      
      // 创建用户设置
      await query(
        'INSERT INTO user_settings (id, user_id) VALUES (?, ?)',
        [uuidv4(), id]
      );
      
      console.log(`✅ 用户创建成功 - 用户名: ${userData.username}, 角色: ${userData.role}`);
    }
    
    console.log('✅ 所有初始用户创建完成');
  } catch (error) {
    console.error('❌ 创建用户失败:', error.message);
  }
}

// 关闭数据库连接
function closeDatabase() {
  if (db) {
    db.close((err) => {
      if (err) {
        console.error('关闭数据库连接失败:', err.message);
      } else {
        console.log('数据库连接已关闭');
      }
    });
  }
}

module.exports = {
  initSQLite,
  query,
  createTestUser,
  closeDatabase
};