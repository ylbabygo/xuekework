const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const supabaseService = require('../services/supabaseService');
const User = require('../models/User');

// JWT密钥
const JWT_SECRET = process.env.JWT_SECRET || 'xueke-ai-workspace-secret-key-2024';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// 生成JWT令牌
function generateToken(user) {
  const payload = {
    id: user.id,
    username: user.username,
    role: user.role
  };
  
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// 验证JWT令牌
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// 认证中间件
async function authenticate(req, res, next) {
  try {
    // 从请求头获取token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: '未提供认证令牌'
      });
    }

    const token = authHeader.substring(7); // 移除 "Bearer " 前缀
    
    // 验证token
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: '无效的认证令牌'
      });
    }

    // 获取用户信息
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '用户不存在'
      });
    }

    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        message: '用户账户已被禁用'
      });
    }

    // 将用户信息添加到请求对象
    req.user = user;
    next();
  } catch (error) {
    console.error('认证中间件错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
}

// 可选认证中间件（不强制要求登录）
async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = verifyToken(token);
      
      if (decoded) {
        const user = await User.findById(decoded.id);
        if (user && user.is_active) {
          req.user = user;
        }
      }
    }
    
    next();
  } catch (error) {
    // 可选认证失败时不阻止请求继续
    next();
  }
}

// 权限检查中间件
function requireRole(requiredRole) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: '需要登录'
      });
    }

    if (!req.user.hasPermission(requiredRole)) {
      return res.status(403).json({
        success: false,
        message: '权限不足'
      });
    }

    next();
  };
}

// 管理员权限中间件
const requireAdmin = requireRole('super_admin');

// 检查资源所有权中间件
function requireOwnership(getResourceUserId) {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: '需要登录'
        });
      }

      // 管理员可以访问所有资源
      if (req.user.role === 'super_admin') {
        return next();
      }

      // 获取资源的用户ID
      let resourceUserId;
      if (typeof getResourceUserId === 'function') {
        resourceUserId = await getResourceUserId(req);
      } else if (typeof getResourceUserId === 'string') {
        resourceUserId = req.params[getResourceUserId] || req.body[getResourceUserId];
      } else {
        resourceUserId = req.params.userId || req.body.user_id;
      }

      // 检查是否为资源所有者
      if (req.user.id !== resourceUserId) {
        return res.status(403).json({
          success: false,
          message: '无权访问此资源'
        });
      }

      next();
    } catch (error) {
      console.error('所有权检查错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器内部错误'
      });
    }
  };
}

// 速率限制中间件
const rateLimitStore = new Map();

function rateLimit(options = {}) {
  const {
    windowMs = 15 * 60 * 1000, // 15分钟
    max = 100, // 最大请求次数
    message = '请求过于频繁，请稍后再试'
  } = options;

  return (req, res, next) => {
    const key = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    
    // 清理过期记录
    for (const [ip, data] of rateLimitStore.entries()) {
      if (now - data.resetTime > windowMs) {
        rateLimitStore.delete(ip);
      }
    }

    // 获取或创建限制记录
    let limitData = rateLimitStore.get(key);
    if (!limitData) {
      limitData = {
        count: 0,
        resetTime: now
      };
      rateLimitStore.set(key, limitData);
    }

    // 检查是否需要重置计数
    if (now - limitData.resetTime > windowMs) {
      limitData.count = 0;
      limitData.resetTime = now;
    }

    // 增加请求计数
    limitData.count++;

    // 检查是否超过限制
    if (limitData.count > max) {
      return res.status(429).json({
        success: false,
        message,
        retryAfter: Math.ceil((windowMs - (now - limitData.resetTime)) / 1000)
      });
    }

    // 设置响应头
    res.set({
      'X-RateLimit-Limit': max,
      'X-RateLimit-Remaining': Math.max(0, max - limitData.count),
      'X-RateLimit-Reset': new Date(limitData.resetTime + windowMs).toISOString()
    });

    next();
  };
}

// 登录速率限制（已取消限制）
const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 999999, // 实际上取消登录次数限制
  message: '登录尝试过于频繁，请15分钟后再试'
});

// API速率限制（一般）
const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 1000, // 最多1000次API请求
  message: 'API请求过于频繁，请稍后再试'
});

// 文件上传速率限制（较严格）
const uploadRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1小时
  max: 50, // 最多50次上传
  message: '文件上传过于频繁，请1小时后再试'
});

// 刷新令牌
async function refreshToken(req, res, next) {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: '未提供刷新令牌'
      });
    }

    const decoded = verifyToken(refreshToken);
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: '无效的刷新令牌'
      });
    }

    const user = await User.findById(decoded.id);
    if (!user || !user.is_active) {
      return res.status(401).json({
        success: false,
        message: '用户不存在或已被禁用'
      });
    }

    // 生成新的访问令牌
    const newToken = generateToken(user);
    
    res.json({
      success: true,
      data: {
        token: newToken,
        user: user.toJSON()
      }
    });
  } catch (error) {
    console.error('刷新令牌错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
}

// 验证密码强度
function validatePassword(password) {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const errors = [];
  
  if (password.length < minLength) {
    errors.push(`密码长度至少${minLength}位`);
  }
  
  if (!hasUpperCase) {
    errors.push('密码必须包含大写字母');
  }
  
  if (!hasLowerCase) {
    errors.push('密码必须包含小写字母');
  }
  
  if (!hasNumbers) {
    errors.push('密码必须包含数字');
  }
  
  if (!hasSpecialChar) {
    errors.push('密码必须包含特殊字符');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// 密码强度验证中间件
function requireStrongPassword(req, res, next) {
  const { password } = req.body;
  
  if (!password) {
    return res.status(400).json({
      success: false,
      message: '密码不能为空'
    });
  }

  const validation = validatePassword(password);
  if (!validation.isValid) {
    return res.status(400).json({
      success: false,
      message: '密码强度不足',
      errors: validation.errors
    });
  }

  next();
}

module.exports = {
  generateToken,
  verifyToken,
  authenticate,
  optionalAuth,
  requireRole,
  requireAdmin,
  requireOwnership,
  rateLimit,
  loginRateLimit,
  generalRateLimit: apiRateLimit, // 使用apiRateLimit作为generalRateLimit
  uploadRateLimit,
  refreshToken,
  validatePassword,
  requireStrongPassword
};