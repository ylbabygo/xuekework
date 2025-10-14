const express = require('express');
const router = express.Router();
const { USE_SUPABASE } = require('../config/database');

// 根据配置选择认证控制器
const AuthController = USE_SUPABASE 
  ? require('../controllers/authControllerSupabase')
  : require('../controllers/authController');

const { 
  authenticate, 
  optionalAuth,
  loginRateLimit,
  generalRateLimit,
  requireStrongPassword
} = require('../middleware/auth');

// 公开路由（不需要认证）
router.post('/register', 
  generalRateLimit,
  requireStrongPassword,
  AuthController.register
);

router.post('/login', 
  AuthController.login
);

// 验证令牌（可选认证）
router.get('/verify', 
  optionalAuth,
  AuthController.verifyToken
);

// 需要认证的路由
router.use(authenticate);

// 获取当前用户信息
router.get('/me', AuthController.getCurrentUser);

// 更新用户信息
router.put('/profile', 
  generalRateLimit,
  AuthController.updateProfile
);

// 修改密码
router.put('/password', 
  generalRateLimit,
  requireStrongPassword,
  AuthController.changePassword
);

// 获取用户设置
router.get('/settings', AuthController.getSettings);

// 更新用户设置
router.put('/settings', 
  generalRateLimit,
  AuthController.updateSettings
);

// 用户登出
router.post('/logout', AuthController.logout);

// 删除账户
router.delete('/account', 
  generalRateLimit,
  AuthController.deleteAccount
);

module.exports = router;