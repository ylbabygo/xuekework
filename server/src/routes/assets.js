const express = require('express');
const router = express.Router();
const {
  getAssets,
  getAssetById,
  addAsset,
  updateAsset,
  deleteAsset,
  getCategories,
  downloadAsset,
  rateAsset,
  generateDescription,
  getRecommendedTags,
  getAssetStats,
  uploadAsset,
  reanalyzeAsset,
  batchAnalyzeAssets,
  getAISummary,
  getSmartTagSuggestions
} = require('../controllers/assetController');
const { authenticate } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

// 所有路由都需要认证
router.use(authenticate);

// 获取物料列表
router.get('/', getAssets);

// 获取分类列表
router.get('/categories', getCategories);

// 获取推荐标签
router.get('/tags/recommended', getRecommendedTags);

// 获取物料统计
router.get('/stats', getAssetStats);

// 获取单个物料详情
router.get('/:id', getAssetById);

// 添加新物料
router.post('/', addAsset);

// 上传物料文件
router.post('/upload', upload.array('files', 10), uploadAsset);

// 更新物料
router.put('/:id', updateAsset);

// 删除物料
router.delete('/:id', deleteAsset);

// 下载物料
router.post('/:id/download', downloadAsset);

// 物料评分
router.post('/:id/rate', rateAsset);

// AI生成物料描述
router.post('/generate/description', generateDescription);

// AI分析相关路由
router.post('/:id/reanalyze', authenticate, reanalyzeAsset);
router.post('/batch-analyze', authenticate, batchAnalyzeAssets);
router.get('/ai-summary', authenticate, getAISummary);
router.post('/smart-tags', authenticate, getSmartTagSuggestions);

module.exports = router;