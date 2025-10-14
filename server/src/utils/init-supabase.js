const { supabaseAdmin } = require('../config/supabase');
const bcrypt = require('bcryptjs');

// 初始化Supabase数据库
async function initSupabaseDatabase() {
  try {
    console.log('🚀 开始初始化Supabase数据库...');
    
    // 1. 创建用户表
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'standard_user' CHECK (role IN ('super_admin', 'standard_user')),
        avatar_url VARCHAR(255),
        is_active BOOLEAN DEFAULT TRUE,
        last_login_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    
    const { error: createTableError } = await supabaseAdmin.rpc('exec_sql', {
      sql: createUsersTable
    });
    
    if (createTableError) {
      console.log('⚠️  用户表可能已存在:', createTableError.message);
    } else {
      console.log('✅ 用户表创建成功');
    }
    
    // 2. 检查是否已有管理员用户
    const { data: existingAdmin, error: checkError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('username', 'admin')
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }
    
    if (existingAdmin) {
      console.log('✅ 管理员用户已存在');
      return { success: true, message: '数据库已初始化，管理员用户已存在' };
    }
    
    // 3. 创建默认管理员用户
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const { data: newAdmin, error: insertError } = await supabaseAdmin
      .from('users')
      .insert([
        {
          username: 'admin',
          email: 'admin@xuekework.com',
          password_hash: hashedPassword,
          role: 'super_admin',
          is_active: true
        }
      ])
      .select()
      .single();
    
    if (insertError) {
      throw insertError;
    }
    
    console.log('✅ 默认管理员用户创建成功:', newAdmin.id);
    
    return {
      success: true,
      message: '数据库初始化完成，默认管理员用户已创建',
      admin_id: newAdmin.id
    };
    
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error);
    return {
      success: false,
      message: '数据库初始化失败',
      error: error.message
    };
  }
}

// 检查用户表是否存在
async function checkUsersTable() {
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      return { exists: false, error: error.message };
    }
    
    return { exists: true };
  } catch (error) {
    return { exists: false, error: error.message };
  }
}

module.exports = {
  initSupabaseDatabase,
  checkUsersTable
};