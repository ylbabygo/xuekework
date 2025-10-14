const express = require('express');
const router = express.Router();
const APIConfigController = require('../controllers/apiConfigController');
const { authenticate } = require('../middleware/auth');

// 所有路由都需要认证
router.use(authenticate);
router.post('/save', APIConfigController.saveApiConfig);
router.post('/validate-realtime', APIConfigController.validateApiKeyRealtime);
router.get('/status', APIConfigController.getApiConfigStatus);
router.get('/config', APIConfigController.getApiConfig);
router.delete('/:provider', APIConfigController.removeApiKey);

module.exports = router;