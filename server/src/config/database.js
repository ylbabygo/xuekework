const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');

// 检查数据库类型
const DATABASE_TYPE = process.env.DATABASE_TYPE || 'supabase';
const USE_SUPABASE = DATABASE_TYPE === 'supabase';

let supabaseModule = null;

if (USE_SUPABASE) {
  supabaseModule = require('./supabase');
}

// 数据库配置
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'xueke_ai_workspace',
  charset: 'utf8mb4',
  timezone: '+08:00',
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: true,
  waitForConnections: true
};

// 创建连接池（仅MySQL）
let pool = null;
if (!USE_SUPABASE) {
  pool = mysql.createPool(dbConfig);
}

// 数据库连接测试
async function testConnection() {
  try {
    if (USE_SUPABASE) {
      return await supabaseModule.testSupabaseConnection();
    } else {
      const connection = await pool.getConnection();
      console.log('✅ MySQL数据库连接成功');
      connection.release();
      return true;
    }
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message);
    return false;
  }
}

// 初始化数据库
async function initDatabase() {
  try {
    console.log('🔄 开始初始化数据库...');
    
    if (USE_SUPABASE) {
      console.log('✅ Supabase数据库无需初始化');
    } else {
      // 读取初始化SQL文件
      const sqlPath = path.join(__dirname, '../database/init.sql');
      const sqlContent = await fs.readFile(sqlPath, 'utf8');
      
      // 执行SQL语句
      const connection = await pool.getConnection();
      await connection.query(sqlContent);
      connection.release();
      
      console.log('✅ MySQL数据库初始化完成');
    }
    return true;
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error.message);
    return false;
  }
}

// 执行查询
async function query(sql, params = []) {
  try {
    if (USE_SUPABASE) {
      // 对于Supabase，我们需要将SQL查询转换为Supabase查询
      return await supabaseModule.query(sql, params);
    } else {
      const [rows] = await pool.execute(sql, params);
      return rows;
    }
  } catch (error) {
    console.error('数据库查询错误:', error);
    throw error;
  }
}

// 执行事务
async function transaction(callback) {
  const connection = await pool.getConnection();
  await connection.beginTransaction();
  
  try {
    const result = await callback(connection);
    await connection.commit();
    connection.release();
    return result;
  } catch (error) {
    await connection.rollback();
    connection.release();
    throw error;
  }
}

// 分页查询辅助函数
function buildPaginationQuery(baseQuery, page = 1, limit = 10, orderBy = 'created_at DESC') {
  const offset = (page - 1) * limit;
  return `${baseQuery} ORDER BY ${orderBy} LIMIT ${limit} OFFSET ${offset}`;
}

// 构建搜索条件
function buildSearchConditions(searchFields, searchTerm) {
  if (!searchTerm || !searchFields.length) return '';
  
  const conditions = searchFields.map(field => `${field} LIKE ?`).join(' OR ');
  return `(${conditions})`;
}

// 关闭连接池
async function closePool() {
  try {
    await pool.end();
    console.log('✅ 数据库连接池已关闭');
  } catch (error) {
    console.error('❌ 关闭数据库连接池失败:', error.message);
  }
}

// 数据库健康检查
async function healthCheck() {
  try {
    const [rows] = await pool.execute('SELECT 1 as health');
    return { status: 'healthy', timestamp: new Date().toISOString() };
  } catch (error) {
    return { 
      status: 'unhealthy', 
      error: error.message, 
      timestamp: new Date().toISOString() 
    };
  }
}

// 获取数据库统计信息
async function getStats() {
  try {
    const stats = {};
    
    // 获取各表的记录数
    const tables = [
      'users', 'ai_conversations', 'ai_messages', 'content_generations',
      'data_analyses', 'assets', 'notes', 'todo_lists', 'todo_items',
      'ai_tools', 'user_ai_tool_favorites', 'system_logs'
    ];
    
    for (const table of tables) {
      const [rows] = await pool.execute(`SELECT COUNT(*) as count FROM ${table}`);
      stats[table] = rows[0].count;
    }
    
    // 获取数据库大小
    const [sizeRows] = await pool.execute(`
      SELECT 
        ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS size_mb
      FROM information_schema.tables 
      WHERE table_schema = ?
    `, [dbConfig.database]);
    
    stats.database_size_mb = sizeRows[0].size_mb;
    stats.timestamp = new Date().toISOString();
    
    return stats;
  } catch (error) {
    console.error('获取数据库统计信息失败:', error.message);
    return null;
  }
}

module.exports = {
  pool,
  query,
  transaction,
  testConnection,
  initDatabase,
  buildPaginationQuery,
  buildSearchConditions,
  closePool,
  healthCheck,
  getStats,
  dbConfig,
  USE_SUPABASE,
  DATABASE_TYPE,
  supabaseModule
};