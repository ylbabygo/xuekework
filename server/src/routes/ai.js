const express = require('express');
const router = express.Router();
const AIController = require('../controllers/aiController');
const { authenticate, optionalAuth } = require('../middleware/auth');

// 模型管理（可选认证）
router.get('/models', optionalAuth, AIController.getModels);

// API密钥验证（不需要认证）
router.post('/test-api-key', AIController.testApiKey);

// 其他AI路由都需要认证
router.use(authenticate);

// 对话管理
router.post('/conversations', AIController.createConversation);
router.get('/conversations', AIController.getConversations);
router.get('/conversations/:id', AIController.getConversation);
router.put('/conversations/:id', AIController.updateConversation);
router.post('/conversations/:id/archive', AIController.archiveConversation);
router.delete('/conversations/:id', AIController.deleteConversation);

// 消息发送
router.post('/conversations/:id/messages', AIController.sendMessage);

module.exports = router;