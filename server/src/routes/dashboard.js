const express = require('express');
const router = express.Router();
const DashboardController = require('../controllers/dashboardController');
const { authenticate } = require('../middleware/auth');

// 所有仪表盘路由都需要认证
router.use(authenticate);

// 获取仪表盘统计数据
router.get('/stats', DashboardController.getStats);

// 获取最近活动
router.get('/activities', DashboardController.getRecentActivities);

module.exports = router;