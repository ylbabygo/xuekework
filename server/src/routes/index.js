const express = require('express');
const router = express.Router();

// 导入各个模块的路由
const authRoutes = require('./auth');
const aiRoutes = require('./ai');
const aiToolsRoutes = require('./aiTools');
const apiConfigRoutes = require('./apiConfig');
const contentRoutes = require('./content');
const dataRoutes = require('./data');
const learningRoutes = require('./learning');
const assetRoutes = require('./assets');
const notesRoutes = require('./notes');
const todosRoutes = require('./todos');
const settingsRoutes = require('./settings');
const dashboardRoutes = require('./dashboard');
const usersRoutes = require('./users');

// API版本前缀
const API_VERSION = '/api/v1';

// 健康检查
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: '服务运行正常',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API测试端点
router.get(`${API_VERSION}/test`, (req, res) => {
  res.json({
    success: true,
    message: 'API正常工作',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database_type: process.env.DATABASE_TYPE || 'sqlite'
  });
});

// 注册路由
router.use(`${API_VERSION}/auth`, authRoutes);
router.use(`${API_VERSION}/ai`, aiRoutes);
router.use(`${API_VERSION}/ai-tools`, aiToolsRoutes);
router.use(`${API_VERSION}/api-config`, apiConfigRoutes);
router.use(`${API_VERSION}/settings`, settingsRoutes);
router.use(`${API_VERSION}/dashboard`, dashboardRoutes);

// 内容相关路由
router.use(`${API_VERSION}/content`, contentRoutes);

// 数据分析相关路由
router.use(`${API_VERSION}/data`, dataRoutes);

// 学习相关路由
router.use(`${API_VERSION}/learning`, learningRoutes);

// 资源相关路由
router.use(`${API_VERSION}/assets`, assetRoutes);

// 用户管理路由
router.use(`${API_VERSION}/users`, usersRoutes);

// 记事本路由
router.use(`${API_VERSION}/notes`, notesRoutes);

// 待办清单路由
router.use(`${API_VERSION}/todos`, todosRoutes);

// API文档路由（开发环境）
if (process.env.NODE_ENV === 'development') {
  router.get('/api-docs', (req, res) => {
    res.json({
      success: true,
      message: 'API文档',
      endpoints: {
        auth: {
          'POST /api/v1/auth/register': '用户注册',
          'POST /api/v1/auth/login': '用户登录',
          'GET /api/v1/auth/verify': '验证令牌',
          'GET /api/v1/auth/me': '获取当前用户信息',
          'PUT /api/v1/auth/profile': '更新用户信息',
          'PUT /api/v1/auth/password': '修改密码',
          'GET /api/v1/auth/settings': '获取用户设置',
          'PUT /api/v1/auth/settings': '更新用户设置',
          'POST /api/v1/auth/logout': '用户登出',
          'DELETE /api/v1/auth/account': '删除账户'
        }
      }
    });
  });
}

// 404处理
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: '接口不存在',
    path: req.originalUrl
  });
});

module.exports = router;