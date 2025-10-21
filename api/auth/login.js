const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

module.exports = async function handler(req, res) {
  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // 处理预检请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 只允许 POST 请求
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: '只允许 POST 请求'
    });
  }

  try {
    const { username, password } = req.body;

    // 验证输入
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: '用户名和密码不能为空'
      });
    }

    // 初始化 Supabase 客户端
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('Supabase 环境变量未配置');
      return res.status(500).json({
        success: false,
        message: '服务器配置错误'
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 查找用户
    const { data: users, error: queryError } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .limit(1);

    if (queryError) {
      console.error('数据库查询错误:', queryError);
      return res.status(500).json({
        success: false,
        message: '数据库查询失败'
      });
    }

    if (!users || users.length === 0) {
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误'
      });
    }

    const user = users[0];

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误'
      });
    }

    // 生成 JWT token
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role
      },
      jwtSecret,
      { expiresIn: '24h' }
    );

    // 返回成功响应
    return res.status(200).json({
      success: true,
      message: '登录成功',
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          email: user.email,
          created_at: user.created_at
        }
      }
    });

  } catch (error) {
    console.error('登录处理错误:', error);
    return res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};