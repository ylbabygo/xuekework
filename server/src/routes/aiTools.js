const express = require('express');
const router = express.Router();
const {
  getAITools,
  getAITool,
  getCategories,
  getPopularTags,
  addFavorite,
  removeFavorite,
  getUserFavorites,
  addBookmark,
  removeBookmark,
  getUserBookmarks,
  getStats,
  createAITool,
  updateAITool,
  deleteAITool,
  likeAITool,
  bookmarkAITool,
  getTrendingTools,
  getNewTools,
  getSubcategories,
  getSimilarTools
} = require('../controllers/aiToolsController');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { isAdmin } = require('../middleware/admin');

// 公开路由（可选认证）
router.get('/', optionalAuth, getAITools);
router.get('/categories', getCategories);
router.get('/subcategories', getSubcategories);
router.get('/tags', getPopularTags);
router.get('/trending', getTrendingTools);
router.get('/new', getNewTools);
router.get('/stats', optionalAuth, getStats);
router.get('/:id', optionalAuth, getAITool);
router.get('/:id/similar', getSimilarTools);

// 公开的交互路由
router.post('/:id/like', likeAITool);

// 需要认证的路由
router.post('/:toolId/favorite', authenticate, addFavorite);
router.delete('/:toolId/favorite', authenticate, removeFavorite);
router.get('/user/favorites', authenticate, getUserFavorites);
router.post('/:toolId/bookmark', authenticate, addBookmark);
router.delete('/:toolId/bookmark', authenticate, removeBookmark);
router.get('/user/bookmarks', authenticate, getUserBookmarks);

// 管理员路由
router.post('/', authenticate, isAdmin, createAITool);
router.put('/:id', authenticate, isAdmin, updateAITool);
router.delete('/:id', authenticate, isAdmin, deleteAITool);

module.exports = router;