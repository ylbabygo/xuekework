const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  getResources,
  addResource,
  updateResource,
  deleteResource,
  updateProgress,
  getStatistics,
  generateStudyPlan,
  getStudyPlans,
  getRecommendations
} = require('../controllers/learningController');

// 应用认证中间件
router.use(authenticate);

// 学习资源管理
router.get('/resources', getResources);
router.post('/resources', addResource);
router.put('/resources/:id', updateResource);
router.delete('/resources/:id', deleteResource);

// 学习进度管理
router.put('/progress/:resourceId', updateProgress);

// 学习统计
router.get('/statistics', getStatistics);

// 学习计划
router.post('/study-plan/generate', generateStudyPlan);
router.get('/study-plans', getStudyPlans);

// 推荐系统
router.get('/recommendations', getRecommendations);

module.exports = router;