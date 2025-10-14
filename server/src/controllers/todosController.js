const { v4: uuidv4 } = require('uuid');
const { TodoList, TodoItem } = require('../models/Todo');

const priorities = ['low', 'medium', 'high', 'urgent'];
const statuses = ['pending', 'in_progress', 'completed', 'cancelled'];

// 获取用户的待办清单列表
const getTodos = async (req, res) => {
  try {
    const { includeArchived = false } = req.query;
    const userId = req.user.id;

    const todoLists = await TodoList.getByUser(userId, includeArchived === 'true');
    
    // 为每个清单获取待办事项
    const listsWithItems = await Promise.all(
      todoLists.map(async (list) => {
        const items = await TodoItem.getByList(list.id);
        return {
          ...list,
          items: items || []
        };
      })
    );

    res.json({
      success: true,
      data: listsWithItems
    });
  } catch (error) {
    console.error('获取待办清单失败:', error);
    res.status(500).json({
      success: false,
      message: '获取待办清单失败',
      error: error.message
    });
  }
};

// 创建待办清单
const createTodoList = async (req, res) => {
  try {
    const { name, description, color } = req.body;
    const userId = req.user.id;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: '清单名称不能为空'
      });
    }

    const todoList = await TodoList.create({
      user_id: userId,
      name,
      description,
      color
    });

    res.status(201).json({
      success: true,
      message: '待办清单创建成功',
      data: todoList
    });
  } catch (error) {
    console.error('创建待办清单失败:', error);
    res.status(500).json({
      success: false,
      message: '创建待办清单失败',
      error: error.message
    });
  }
};

// 获取单个待办清单
const getTodoListById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const todoList = await TodoList.findById(id);
    
    if (!todoList || todoList.user_id !== userId) {
      return res.status(404).json({
        success: false,
        message: '待办清单不存在'
      });
    }

    // 获取清单中的待办事项
    const items = await TodoItem.getByList(id);

    res.json({
      success: true,
      data: {
        ...todoList,
        items: items || []
      }
    });
  } catch (error) {
    console.error('获取待办清单详情失败:', error);
    res.status(500).json({
      success: false,
      message: '获取待办清单详情失败',
      error: error.message
    });
  }
};

// 更新待办清单
const updateTodoList = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, color } = req.body;
    const userId = req.user.id;

    const todoList = await TodoList.findById(id);
    
    if (!todoList || todoList.user_id !== userId) {
      return res.status(404).json({
        success: false,
        message: '待办清单不存在'
      });
    }

    const updatedList = await todoList.update({
      name,
      description,
      color
    });

    res.json({
      success: true,
      message: '待办清单更新成功',
      data: updatedList
    });
  } catch (error) {
    console.error('更新待办清单失败:', error);
    res.status(500).json({
      success: false,
      message: '更新待办清单失败',
      error: error.message
    });
  }
};

// 删除待办清单
const deleteTodoList = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const todoList = await TodoList.findById(id);
    
    if (!todoList || todoList.user_id !== userId) {
      return res.status(404).json({
        success: false,
        message: '待办清单不存在'
      });
    }

    await todoList.delete();

    res.json({
      success: true,
      message: '待办清单删除成功'
    });
  } catch (error) {
    console.error('删除待办清单失败:', error);
    res.status(500).json({
      success: false,
      message: '删除待办清单失败',
      error: error.message
    });
  }
};

// 创建待办事项
const createTodoItem = async (req, res) => {
  try {
    const { listId } = req.params;
    const { 
      title, 
      description, 
      priority = 'medium', 
      dueDate
    } = req.body;
    const userId = req.user.id;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: '标题不能为空'
      });
    }

    if (!priorities.includes(priority)) {
      return res.status(400).json({
        success: false,
        message: '无效的优先级'
      });
    }

    // 验证清单是否存在且属于当前用户
    const todoList = await TodoList.findById(listId);
    if (!todoList || todoList.user_id !== userId) {
      return res.status(404).json({
        success: false,
        message: '待办清单不存在'
      });
    }

    const todoItem = await TodoItem.create({
      list_id: listId,
      title,
      description,
      priority,
      due_date: dueDate ? new Date(dueDate) : null
    });

    res.status(201).json({
      success: true,
      message: '待办事项创建成功',
      data: todoItem
    });
  } catch (error) {
    console.error('创建待办事项失败:', error);
    res.status(500).json({
      success: false,
      message: '创建待办事项失败',
      error: error.message
    });
  }
};

// 更新待办事项
const updateTodo = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      title, 
      description, 
      priority, 
      status, 
      category, 
      tags, 
      dueDate,
      subtasks
    } = req.body;
    const userId = req.user.id;

    const todoIndex = todos.findIndex(t => t.id === id && t.userId === userId);
    
    if (todoIndex === -1) {
      return res.status(404).json({
        success: false,
        message: '待办事项不存在'
      });
    }

    if (priority && !priorities.includes(priority)) {
      return res.status(400).json({
        success: false,
        message: '无效的优先级'
      });
    }

    if (status && !statuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: '无效的状态'
      });
    }

    const updatedTodo = {
      ...todos[todoIndex],
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(priority !== undefined && { priority }),
      ...(status !== undefined && { status }),
      ...(category !== undefined && { category }),
      ...(tags !== undefined && { tags: Array.isArray(tags) ? tags : [] }),
      ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
      ...(subtasks !== undefined && { subtasks }),
      updatedAt: new Date()
    };

    // 如果状态变为已完成，设置完成时间
    if (status === 'completed' && todos[todoIndex].status !== 'completed') {
      updatedTodo.completedAt = new Date();
    }

    // 如果状态从已完成变为其他状态，清除完成时间
    if (status && status !== 'completed' && todos[todoIndex].status === 'completed') {
      updatedTodo.completedAt = null;
    }

    todos[todoIndex] = updatedTodo;

    res.json({
      success: true,
      message: '待办事项更新成功',
      data: updatedTodo
    });
  } catch (error) {
    console.error('更新待办事项失败:', error);
    res.status(500).json({
      success: false,
      message: '更新待办事项失败',
      error: error.message
    });
  }
};

// 删除待办事项
const deleteTodo = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const todoIndex = todos.findIndex(t => t.id === id && t.userId === userId);
    
    if (todoIndex === -1) {
      return res.status(404).json({
        success: false,
        message: '待办事项不存在'
      });
    }

    todos.splice(todoIndex, 1);

    res.json({
      success: true,
      message: '待办事项删除成功'
    });
  } catch (error) {
    console.error('删除待办事项失败:', error);
    res.status(500).json({
      success: false,
      message: '删除待办事项失败',
      error: error.message
    });
  }
};

// 批量操作待办事项
const batchUpdateTodos = async (req, res) => {
  try {
    const { todoIds, action, data = {} } = req.body;
    const userId = req.user.id;

    if (!Array.isArray(todoIds) || todoIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: '请选择要操作的待办事项'
      });
    }

    let updatedCount = 0;

    todoIds.forEach(todoId => {
      const todoIndex = todos.findIndex(t => t.id === todoId && t.userId === userId);
      if (todoIndex !== -1) {
        switch (action) {
          case 'complete':
            todos[todoIndex].status = 'completed';
            todos[todoIndex].completedAt = new Date();
            todos[todoIndex].updatedAt = new Date();
            updatedCount++;
            break;
          case 'pending':
            todos[todoIndex].status = 'pending';
            todos[todoIndex].completedAt = null;
            todos[todoIndex].updatedAt = new Date();
            updatedCount++;
            break;
          case 'delete':
            todos.splice(todoIndex, 1);
            updatedCount++;
            break;
          case 'updatePriority':
            if (data.priority && priorities.includes(data.priority)) {
              todos[todoIndex].priority = data.priority;
              todos[todoIndex].updatedAt = new Date();
              updatedCount++;
            }
            break;
          case 'updateCategory':
            if (data.category) {
              todos[todoIndex].category = data.category;
              todos[todoIndex].updatedAt = new Date();
              updatedCount++;
            }
            break;
        }
      }
    });

    res.json({
      success: true,
      message: `成功操作 ${updatedCount} 个待办事项`,
      updatedCount
    });
  } catch (error) {
    console.error('批量操作待办事项失败:', error);
    res.status(500).json({
      success: false,
      message: '批量操作待办事项失败',
      error: error.message
    });
  }
};

// 更新子任务
const updateSubtask = async (req, res) => {
  try {
    const { todoId, subtaskId } = req.params;
    const { title, completed } = req.body;
    const userId = req.user.id;

    const todoIndex = todos.findIndex(t => t.id === todoId && t.userId === userId);
    
    if (todoIndex === -1) {
      return res.status(404).json({
        success: false,
        message: '待办事项不存在'
      });
    }

    const subtaskIndex = todos[todoIndex].subtasks.findIndex(s => s.id === subtaskId);
    
    if (subtaskIndex === -1) {
      return res.status(404).json({
        success: false,
        message: '子任务不存在'
      });
    }

    if (title !== undefined) {
      todos[todoIndex].subtasks[subtaskIndex].title = title;
    }

    if (completed !== undefined) {
      todos[todoIndex].subtasks[subtaskIndex].completed = completed;
    }

    todos[todoIndex].updatedAt = new Date();

    res.json({
      success: true,
      message: '子任务更新成功',
      data: todos[todoIndex]
    });
  } catch (error) {
    console.error('更新子任务失败:', error);
    res.status(500).json({
      success: false,
      message: '更新子任务失败',
      error: error.message
    });
  }
};

// 获取分类列表
const getCategories = async (req, res) => {
  try {
    const userId = req.user.id;
    const userCategories = categories.filter(cat => cat.userId === userId);

    res.json({
      success: true,
      data: userCategories
    });
  } catch (error) {
    console.error('获取分类失败:', error);
    res.status(500).json({
      success: false,
      message: '获取分类失败',
      error: error.message
    });
  }
};

// 创建分类
const createCategory = async (req, res) => {
  try {
    const { name, color = '#3b82f6' } = req.body;
    const userId = req.user.id;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: '分类名称不能为空'
      });
    }

    // 检查分类是否已存在
    const existingCategory = categories.find(cat => 
      cat.name === name && cat.userId === userId
    );

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: '分类已存在'
      });
    }

    const newCategory = {
      id: uuidv4(),
      name,
      color,
      userId
    };

    categories.push(newCategory);

    res.status(201).json({
      success: true,
      message: '分类创建成功',
      data: newCategory
    });
  } catch (error) {
    console.error('创建分类失败:', error);
    res.status(500).json({
      success: false,
      message: '创建分类失败',
      error: error.message
    });
  }
};

// 获取标签列表
const getTags = async (req, res) => {
  try {
    const userId = req.user.id;
    const userTodos = todos.filter(todo => todo.userId === userId);
    
    // 统计所有标签及其使用次数
    const tagCounts = {};
    userTodos.forEach(todo => {
      todo.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    const tags = Object.entries(tagCounts).map(([name, count]) => ({
      name,
      count
    })).sort((a, b) => b.count - a.count);

    res.json({
      success: true,
      data: tags
    });
  } catch (error) {
    console.error('获取标签失败:', error);
    res.status(500).json({
      success: false,
      message: '获取标签失败',
      error: error.message
    });
  }
};

// 获取待办事项统计
const getTodosStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const userTodos = todos.filter(todo => todo.userId === userId);

    const stats = {
      total: userTodos.length,
      pending: userTodos.filter(todo => todo.status === 'pending').length,
      inProgress: userTodos.filter(todo => todo.status === 'in_progress').length,
      completed: userTodos.filter(todo => todo.status === 'completed').length,
      cancelled: userTodos.filter(todo => todo.status === 'cancelled').length,
      overdue: 0,
      dueToday: 0,
      priorities: {
        urgent: userTodos.filter(todo => todo.priority === 'urgent').length,
        high: userTodos.filter(todo => todo.priority === 'high').length,
        medium: userTodos.filter(todo => todo.priority === 'medium').length,
        low: userTodos.filter(todo => todo.priority === 'low').length
      },
      categories: {},
      completionRate: 0,
      recentActivity: []
    };

    // 分类统计
    userTodos.forEach(todo => {
      stats.categories[todo.category] = (stats.categories[todo.category] || 0) + 1;
    });

    // 逾期和今日到期统计
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    userTodos.forEach(todo => {
      if (todo.dueDate && todo.status !== 'completed') {
        const dueDate = new Date(todo.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        
        if (dueDate < today) {
          stats.overdue++;
        } else if (dueDate.getTime() === today.getTime()) {
          stats.dueToday++;
        }
      }
    });

    // 完成率
    if (stats.total > 0) {
      stats.completionRate = Math.round((stats.completed / stats.total) * 100);
    }

    // 最近活动（最近7天的待办事项）
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    stats.recentActivity = userTodos
      .filter(todo => new Date(todo.updatedAt) > sevenDaysAgo)
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, 10)
      .map(todo => ({
        id: todo.id,
        title: todo.title,
        action: todo.status === 'completed' ? '完成' : '更新',
        timestamp: todo.updatedAt
      }));

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('获取待办事项统计失败:', error);
    res.status(500).json({
      success: false,
      message: '获取待办事项统计失败',
      error: error.message
    });
  }
};

// AI智能建议
const getSmartSuggestions = async (req, res) => {
  try {
    const userId = req.user.id;
    const userTodos = todos.filter(todo => todo.userId === userId);
    
    const suggestions = [];

    // 逾期任务提醒
    const overdueTodos = userTodos.filter(todo => {
      if (!todo.dueDate || todo.status === 'completed') return false;
      return new Date(todo.dueDate) < new Date();
    });

    if (overdueTodos.length > 0) {
      suggestions.push({
        type: 'overdue',
        title: '逾期任务提醒',
        message: `您有 ${overdueTodos.length} 个任务已逾期，建议优先处理`,
        priority: 'high',
        todos: overdueTodos.slice(0, 3).map(todo => ({
          id: todo.id,
          title: todo.title,
          dueDate: todo.dueDate
        }))
      });
    }

    // 今日任务提醒
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayTodos = userTodos.filter(todo => {
      if (!todo.dueDate || todo.status === 'completed') return false;
      const dueDate = new Date(todo.dueDate);
      return dueDate >= today && dueDate < tomorrow;
    });

    if (todayTodos.length > 0) {
      suggestions.push({
        type: 'today',
        title: '今日任务',
        message: `今天有 ${todayTodos.length} 个任务需要完成`,
        priority: 'medium',
        todos: todayTodos.map(todo => ({
          id: todo.id,
          title: todo.title,
          priority: todo.priority
        }))
      });
    }

    // 高优先级任务提醒
    const urgentTodos = userTodos.filter(todo => 
      todo.priority === 'urgent' && todo.status !== 'completed'
    );

    if (urgentTodos.length > 0) {
      suggestions.push({
        type: 'urgent',
        title: '紧急任务',
        message: `您有 ${urgentTodos.length} 个紧急任务待处理`,
        priority: 'high',
        todos: urgentTodos.map(todo => ({
          id: todo.id,
          title: todo.title,
          dueDate: todo.dueDate
        }))
      });
    }

    // 长期未更新任务
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const staleTodos = userTodos.filter(todo => 
      todo.status === 'in_progress' && new Date(todo.updatedAt) < sevenDaysAgo
    );

    if (staleTodos.length > 0) {
      suggestions.push({
        type: 'stale',
        title: '长期未更新',
        message: `有 ${staleTodos.length} 个进行中的任务超过7天未更新`,
        priority: 'low',
        todos: staleTodos.slice(0, 3).map(todo => ({
          id: todo.id,
          title: todo.title,
          updatedAt: todo.updatedAt
        }))
      });
    }

    res.json({
      success: true,
      data: suggestions
    });
  } catch (error) {
    console.error('获取智能建议失败:', error);
    res.status(500).json({
      success: false,
      message: '获取智能建议失败',
      error: error.message
    });
  }
};

// 更新待办事项
const updateTodoItem = async (req, res) => {
  try {
    const { listId, itemId } = req.params;
    const { title, description, priority, status, due_date } = req.body;
    const userId = req.user.id;

    // 验证清单是否存在且属于当前用户
    const todoList = await TodoList.findById(listId);
    if (!todoList || todoList.user_id !== userId) {
      return res.status(404).json({
        success: false,
        message: '待办清单不存在'
      });
    }

    // 验证待办事项是否存在
    const todoItem = await TodoItem.findById(itemId);
    if (!todoItem || todoItem.list_id !== listId) {
      return res.status(404).json({
        success: false,
        message: '待办事项不存在'
      });
    }

    const updatedItem = await TodoItem.update(itemId, {
      title,
      description,
      priority,
      status,
      due_date: due_date ? new Date(due_date) : null
    });

    res.json({
      success: true,
      message: '待办事项更新成功',
      data: updatedItem
    });
  } catch (error) {
    console.error('更新待办事项失败:', error);
    res.status(500).json({
      success: false,
      message: '更新待办事项失败',
      error: error.message
    });
  }
};

// 删除待办事项
const deleteTodoItem = async (req, res) => {
  try {
    const { listId, itemId } = req.params;
    const userId = req.user.id;

    // 验证清单是否存在且属于当前用户
    const todoList = await TodoList.findById(listId);
    if (!todoList || todoList.user_id !== userId) {
      return res.status(404).json({
        success: false,
        message: '待办清单不存在'
      });
    }

    // 验证待办事项是否存在
    const todoItem = await TodoItem.findById(itemId);
    if (!todoItem || todoItem.list_id !== listId) {
      return res.status(404).json({
        success: false,
        message: '待办事项不存在'
      });
    }

    await TodoItem.delete(itemId);

    res.json({
      success: true,
      message: '待办事项删除成功'
    });
  } catch (error) {
    console.error('删除待办事项失败:', error);
    res.status(500).json({
      success: false,
      message: '删除待办事项失败',
      error: error.message
    });
  }
};

// 重新排序待办事项
const reorderTodoItems = async (req, res) => {
  try {
    const { listId } = req.params;
    const { itemIds } = req.body; // 新的排序数组
    const userId = req.user.id;

    // 验证清单是否存在且属于当前用户
    const todoList = await TodoList.findById(listId);
    if (!todoList || todoList.user_id !== userId) {
      return res.status(404).json({
        success: false,
        message: '待办清单不存在'
      });
    }

    if (!Array.isArray(itemIds) || itemIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: '无效的排序数据'
      });
    }

    // 验证所有待办事项都属于该清单
    const items = await Promise.all(
      itemIds.map(async (itemId) => {
        const item = await TodoItem.findById(itemId);
        if (!item || item.list_id !== listId) {
          throw new Error(`待办事项 ${itemId} 不存在或不属于该清单`);
        }
        return item;
      })
    );

    // 批量更新排序
    await Promise.all(
      itemIds.map(async (itemId, index) => {
        const item = await TodoItem.findById(itemId);
        if (item) {
          await item.updateSortOrder(index + 1);
        }
      })
    );

    res.json({
      success: true,
      message: '排序更新成功'
    });
  } catch (error) {
    console.error('重新排序失败:', error);
    res.status(500).json({
      success: false,
      message: '重新排序失败',
      error: error.message
    });
  }
};

module.exports = {
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
};