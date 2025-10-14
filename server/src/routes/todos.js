const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  getTodos,
  createTodoList,
  getTodoListById,
  updateTodoList,
  deleteTodoList,
  createTodoItem,
  updateTodoItem,
  deleteTodoItem,
  reorderTodoItems,
  batchUpdateTodos,
  updateSubtask,
  getCategories,
  createCategory,
  getTags,
  getTodosStats,
  getSmartSuggestions
} = require('../controllers/todosController');

// 所有路由都需要认证
router.use(authenticate);

// 待办清单管理路由
router.get('/', getTodos);                           // 获取用户的待办清单列表
router.post('/', createTodoList);                    // 创建待办清单
router.get('/stats', getTodosStats);                 // 获取待办事项统计
router.get('/categories', getCategories);            // 获取分类列表
router.post('/categories', createCategory);          // 创建分类
router.get('/tags', getTags);                        // 获取标签列表
router.get('/suggestions', getSmartSuggestions);     // 获取智能建议
router.post('/batch', batchUpdateTodos);             // 批量操作待办事项

// 单个清单管理路由
router.get('/:id', getTodoListById);                 // 获取单个待办清单
router.put('/:id', updateTodoList);                  // 更新待办清单
router.delete('/:id', deleteTodoList);               // 删除待办清单

// 清单内待办事项管理路由
router.post('/:listId/items', createTodoItem);       // 在清单中创建待办事项
router.put('/:listId/items/:itemId', updateTodoItem); // 更新待办事项
router.delete('/:listId/items/:itemId', deleteTodoItem); // 删除待办事项
router.put('/:listId/reorder', reorderTodoItems);    // 重新排序待办事项
router.put('/:todoId/subtasks/:subtaskId', updateSubtask); // 更新子任务

module.exports = router;