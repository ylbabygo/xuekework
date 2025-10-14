const express = require('express');
const router = express.Router();
const ContentController = require('../controllers/contentController');
const { authenticate } = require('../middleware/auth');

// 所有内容生成路由都需要认证
router.use(authenticate);

// 生成内容
router.post('/generate', ContentController.generateContent);

// 获取内容模板
router.get('/templates', ContentController.getTemplates);

// 优化内容
router.post('/optimize', ContentController.optimizeContent);

module.exports = router;