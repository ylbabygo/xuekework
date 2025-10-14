const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  getNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
  batchUpdateNotes,
  getCategories,
  createCategory,
  getTags,
  getNotesStats,
  generateSummary,
  recommendTags
} = require('../controllers/notesController');

// 所有路由都需要认证
router.use(authenticate);

// 笔记管理路由
router.get('/', getNotes);                    // 获取笔记列表
router.post('/', createNote);                 // 创建笔记
router.get('/stats', getNotesStats);          // 获取笔记统计
router.get('/categories', getCategories);     // 获取分类列表
router.post('/categories', createCategory);   // 创建分类
router.get('/tags', getTags);                 // 获取标签列表
router.post('/batch', batchUpdateNotes);      // 批量操作笔记
router.post('/summary', generateSummary);     // AI生成摘要
router.post('/recommend-tags', recommendTags); // AI推荐标签
router.get('/:id', getNoteById);              // 获取单个笔记
router.put('/:id', updateNote);               // 更新笔记
router.delete('/:id', deleteNote);            // 删除笔记

module.exports = router;