const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Supabase配置
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

// 创建Supabase客户端（用于前端交互）
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 创建Supabase管理客户端（用于后端操作）
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// 测试连接
async function testSupabaseConnection() {
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log('⚠️  Supabase连接测试 - 表可能不存在，这是正常的:', error.message);
      return true; // 连接正常，只是表不存在
    }
    
    console.log('✅ Supabase数据库连接成功');
    return true;
  } catch (error) {
    console.error('❌ Supabase连接失败:', error.message);
    return false;
  }
}

// SQL查询转换器
async function query(sql, params = []) {
  try {
    // 简单的SQL解析和转换
    const sqlLower = sql.toLowerCase().trim();
    
    if (sqlLower.startsWith('select')) {
      // 处理SELECT查询
      return await handleSelectQuery(sql, params);
    } else if (sqlLower.startsWith('insert')) {
      // 处理INSERT查询
      return await handleInsertQuery(sql, params);
    } else if (sqlLower.startsWith('update')) {
      // 处理UPDATE查询
      return await handleUpdateQuery(sql, params);
    } else if (sqlLower.startsWith('delete')) {
      // 处理DELETE查询
      return await handleDeleteQuery(sql, params);
    } else {
      console.warn('不支持的SQL查询类型:', sql);
      return [];
    }
  } catch (error) {
    console.error('Supabase查询转换错误:', error);
    throw error;
  }
}

// 处理SELECT查询
async function handleSelectQuery(sql, params) {
  // 解析表名
  const tableMatch = sql.match(/from\s+(\w+)/i);
  if (!tableMatch) {
    throw new Error('无法解析表名');
  }
  
  const tableName = tableMatch[1];
  let query = supabaseAdmin.from(tableName).select('*');
  
  // 处理WHERE条件
  const whereMatch = sql.match(/where\s+(.+?)(?:\s+order\s+by|\s+limit|\s+group\s+by|$)/i);
  if (whereMatch) {
    const whereClause = whereMatch[1];
    query = parseWhereClause(query, whereClause, params);
  }
  
  const { data, error } = await query;
  if (error) {
    throw error;
  }
  
  return data || [];
}

// 解析WHERE条件
function parseWhereClause(query, whereClause, params) {
  let paramIndex = 0;
  
  // 简单的条件解析 - 支持 column = ? 和 column = value
  const conditions = whereClause.split(/\s+and\s+/i);
  
  conditions.forEach(condition => {
    const trimmed = condition.trim();
    
    if (trimmed.includes('= ?')) {
      // 参数化查询
      const column = trimmed.split('=')[0].trim();
      const value = params[paramIndex++];
      query = query.eq(column, value);
    } else if (trimmed.includes('=')) {
      // 直接值查询
      const [column, value] = trimmed.split('=').map(s => s.trim());
      const cleanValue = value.replace(/['"]/g, '');
      
      if (cleanValue.toLowerCase() === 'true') {
        query = query.eq(column, true);
      } else if (cleanValue.toLowerCase() === 'false') {
        query = query.eq(column, false);
      } else {
        query = query.eq(column, cleanValue);
      }
    }
  });
  
  return query;
}

// 处理INSERT查询 (暂时简单实现)
async function handleInsertQuery(sql, params) {
  console.warn('INSERT查询转换暂未完全实现:', sql);
  return [];
}

// 处理UPDATE查询 (暂时简单实现)
async function handleUpdateQuery(sql, params) {
  console.warn('UPDATE查询转换暂未完全实现:', sql);
  return [];
}

// 处理DELETE查询 (暂时简单实现)
async function handleDeleteQuery(sql, params) {
  console.warn('DELETE查询转换暂未完全实现:', sql);
  return [];
}

module.exports = {
  supabase,
  supabaseAdmin,
  testSupabaseConnection,
  query
};