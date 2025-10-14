const { v4: uuidv4 } = require('uuid');

// 模拟数据存储
let notes = [
  {
    id: '1',
    title: '项目计划',
    content: '完成学科AI工作台的核心功能开发，包括数据分析、学习资源管理等模块。',
    category: '工作',
    tags: ['项目', '开发', '计划'],
    isPinned: true,
    isArchived: false,
    createdAt: new Date('2024-01-15T10:00:00Z'),
    updatedAt: new Date('2024-01-15T10:00:00Z'),
    userId: 'test-user'
  },
  {
    id: '2',
    title: '学习笔记',
    content: '今天学习了React Hooks的使用方法，特别是useState和useEffect的应用场景。\n\n重点内容：\n1. useState用于管理组件状态\n2. useEffect用于处理副作用\n3. 依赖数组的正确使用',
    category: '学习',
    tags: ['React', 'Hooks', '前端'],
    isPinned: false,
    isArchived: false,
    createdAt: new Date('2024-01-14T14:30:00Z'),
    updatedAt: new Date('2024-01-14T15:45:00Z'),
    userId: 'test-user'
  },
  {
    id: '3',
    title: '会议记录',
    content: '团队周会要点：\n- 本周完成的任务回顾\n- 下周工作计划安排\n- 技术难点讨论\n- 项目进度同步',
    category: '工作',
    tags: ['会议', '团队', '计划'],
    isPinned: false,
    isArchived: false,
    createdAt: new Date('2024-01-12T09:00:00Z'),
    updatedAt: new Date('2024-01-12T09:00:00Z'),
    userId: 'test-user'
  }
];

let categories = [
  { id: '1', name: '工作', color: '#3b82f6', userId: 'test-user' },
  { id: '2', name: '学习', color: '#10b981', userId: 'test-user' },
  { id: '3', name: '生活', color: '#f59e0b', userId: 'test-user' },
  { id: '4', name: '想法', color: '#8b5cf6', userId: 'test-user' }
];

// 获取所有笔记
const getNotes = async (req, res) => {
  try {
    const { category, tag, search, isPinned, isArchived, sortBy = 'updatedAt', sortOrder = 'desc' } = req.query;
    const userId = req.user.id;

    let filteredNotes = notes.filter(note => note.userId === userId);

    // 分类筛选
    if (category) {
      filteredNotes = filteredNotes.filter(note => note.category === category);
    }

    // 标签筛选
    if (tag) {
      filteredNotes = filteredNotes.filter(note => note.tags.includes(tag));
    }

    // 搜索筛选
    if (search) {
      const searchLower = search.toLowerCase();
      filteredNotes = filteredNotes.filter(note => 
        note.title.toLowerCase().includes(searchLower) ||
        note.content.toLowerCase().includes(searchLower) ||
        note.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // 置顶筛选
    if (isPinned !== undefined) {
      filteredNotes = filteredNotes.filter(note => note.isPinned === (isPinned === 'true'));
    }

    // 归档筛选
    if (isArchived !== undefined) {
      filteredNotes = filteredNotes.filter(note => note.isArchived === (isArchived === 'true'));
    }

    // 排序
    filteredNotes.sort((a, b) => {
      // 置顶笔记优先
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;

      const aValue = a[sortBy];
      const bValue = b[sortBy];
      
      if (sortOrder === 'desc') {
        return new Date(bValue) - new Date(aValue);
      } else {
        return new Date(aValue) - new Date(bValue);
      }
    });

    res.json({
      success: true,
      data: filteredNotes,
      total: filteredNotes.length
    });
  } catch (error) {
    console.error('获取笔记失败:', error);
    res.status(500).json({
      success: false,
      message: '获取笔记失败',
      error: error.message
    });
  }
};

// 获取单个笔记
const getNoteById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const note = notes.find(n => n.id === id && n.userId === userId);
    
    if (!note) {
      return res.status(404).json({
        success: false,
        message: '笔记不存在'
      });
    }

    res.json({
      success: true,
      data: note
    });
  } catch (error) {
    console.error('获取笔记详情失败:', error);
    res.status(500).json({
      success: false,
      message: '获取笔记详情失败',
      error: error.message
    });
  }
};

// 创建笔记
const createNote = async (req, res) => {
  try {
    const { title, content, category, tags = [], isPinned = false } = req.body;
    const userId = req.user.id;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: '标题和内容不能为空'
      });
    }

    const newNote = {
      id: uuidv4(),
      title,
      content,
      category: category || '默认',
      tags: Array.isArray(tags) ? tags : [],
      isPinned,
      isArchived: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      userId
    };

    notes.push(newNote);

    res.status(201).json({
      success: true,
      message: '笔记创建成功',
      data: newNote
    });
  } catch (error) {
    console.error('创建笔记失败:', error);
    res.status(500).json({
      success: false,
      message: '创建笔记失败',
      error: error.message
    });
  }
};

// 更新笔记
const updateNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, category, tags, isPinned, isArchived } = req.body;
    const userId = req.user.id;

    const noteIndex = notes.findIndex(n => n.id === id && n.userId === userId);
    
    if (noteIndex === -1) {
      return res.status(404).json({
        success: false,
        message: '笔记不存在'
      });
    }

    const updatedNote = {
      ...notes[noteIndex],
      ...(title !== undefined && { title }),
      ...(content !== undefined && { content }),
      ...(category !== undefined && { category }),
      ...(tags !== undefined && { tags: Array.isArray(tags) ? tags : [] }),
      ...(isPinned !== undefined && { isPinned }),
      ...(isArchived !== undefined && { isArchived }),
      updatedAt: new Date()
    };

    notes[noteIndex] = updatedNote;

    res.json({
      success: true,
      message: '笔记更新成功',
      data: updatedNote
    });
  } catch (error) {
    console.error('更新笔记失败:', error);
    res.status(500).json({
      success: false,
      message: '更新笔记失败',
      error: error.message
    });
  }
};

// 删除笔记
const deleteNote = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const noteIndex = notes.findIndex(n => n.id === id && n.userId === userId);
    
    if (noteIndex === -1) {
      return res.status(404).json({
        success: false,
        message: '笔记不存在'
      });
    }

    notes.splice(noteIndex, 1);

    res.json({
      success: true,
      message: '笔记删除成功'
    });
  } catch (error) {
    console.error('删除笔记失败:', error);
    res.status(500).json({
      success: false,
      message: '删除笔记失败',
      error: error.message
    });
  }
};

// 批量操作笔记
const batchUpdateNotes = async (req, res) => {
  try {
    const { noteIds, action, data = {} } = req.body;
    const userId = req.user.id;

    if (!Array.isArray(noteIds) || noteIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: '请选择要操作的笔记'
      });
    }

    let updatedCount = 0;

    noteIds.forEach(noteId => {
      const noteIndex = notes.findIndex(n => n.id === noteId && n.userId === userId);
      if (noteIndex !== -1) {
        switch (action) {
          case 'pin':
            notes[noteIndex].isPinned = true;
            notes[noteIndex].updatedAt = new Date();
            updatedCount++;
            break;
          case 'unpin':
            notes[noteIndex].isPinned = false;
            notes[noteIndex].updatedAt = new Date();
            updatedCount++;
            break;
          case 'archive':
            notes[noteIndex].isArchived = true;
            notes[noteIndex].updatedAt = new Date();
            updatedCount++;
            break;
          case 'unarchive':
            notes[noteIndex].isArchived = false;
            notes[noteIndex].updatedAt = new Date();
            updatedCount++;
            break;
          case 'delete':
            notes.splice(noteIndex, 1);
            updatedCount++;
            break;
          case 'updateCategory':
            if (data.category) {
              notes[noteIndex].category = data.category;
              notes[noteIndex].updatedAt = new Date();
              updatedCount++;
            }
            break;
          case 'addTags':
            if (Array.isArray(data.tags)) {
              const existingTags = notes[noteIndex].tags;
              const newTags = data.tags.filter(tag => !existingTags.includes(tag));
              notes[noteIndex].tags = [...existingTags, ...newTags];
              notes[noteIndex].updatedAt = new Date();
              updatedCount++;
            }
            break;
        }
      }
    });

    res.json({
      success: true,
      message: `成功操作 ${updatedCount} 条笔记`,
      updatedCount
    });
  } catch (error) {
    console.error('批量操作笔记失败:', error);
    res.status(500).json({
      success: false,
      message: '批量操作笔记失败',
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
    const userNotes = notes.filter(note => note.userId === userId);
    
    // 统计所有标签及其使用次数
    const tagCounts = {};
    userNotes.forEach(note => {
      note.tags.forEach(tag => {
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

// 获取笔记统计
const getNotesStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const userNotes = notes.filter(note => note.userId === userId);

    const stats = {
      total: userNotes.length,
      pinned: userNotes.filter(note => note.isPinned).length,
      archived: userNotes.filter(note => note.isArchived).length,
      active: userNotes.filter(note => !note.isArchived).length,
      categories: {},
      recentActivity: []
    };

    // 分类统计
    userNotes.forEach(note => {
      stats.categories[note.category] = (stats.categories[note.category] || 0) + 1;
    });

    // 最近活动（最近7天的笔记）
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    stats.recentActivity = userNotes
      .filter(note => new Date(note.updatedAt) > sevenDaysAgo)
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, 10)
      .map(note => ({
        id: note.id,
        title: note.title,
        action: '更新',
        timestamp: note.updatedAt
      }));

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('获取笔记统计失败:', error);
    res.status(500).json({
      success: false,
      message: '获取笔记统计失败',
      error: error.message
    });
  }
};

// AI智能摘要
const generateSummary = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: '内容不能为空'
      });
    }

    // 模拟AI生成摘要
    const sentences = content.split(/[。！？\n]/).filter(s => s.trim().length > 0);
    const summary = sentences.slice(0, 2).join('。') + '。';

    res.json({
      success: true,
      data: {
        summary,
        wordCount: content.length,
        readingTime: Math.ceil(content.length / 200) // 假设每分钟阅读200字
      }
    });
  } catch (error) {
    console.error('生成摘要失败:', error);
    res.status(500).json({
      success: false,
      message: '生成摘要失败',
      error: error.message
    });
  }
};

// AI标签推荐
const recommendTags = async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title && !content) {
      return res.status(400).json({
        success: false,
        message: '标题或内容不能为空'
      });
    }

    // 模拟AI推荐标签
    const text = (title + ' ' + content).toLowerCase();
    const recommendedTags = [];

    // 简单的关键词匹配
    const keywords = {
      '工作': ['工作', '项目', '任务', '会议', '计划', '开发'],
      '学习': ['学习', '笔记', '知识', '教程', '课程', '研究'],
      '技术': ['技术', '代码', '编程', '算法', '框架', 'api'],
      '前端': ['前端', 'react', 'vue', 'javascript', 'css', 'html'],
      '后端': ['后端', 'node', 'python', 'java', '数据库', 'sql'],
      '设计': ['设计', 'ui', 'ux', '界面', '原型', '交互'],
      '管理': ['管理', '团队', '领导', '协调', '沟通', '规划']
    };

    Object.entries(keywords).forEach(([tag, words]) => {
      if (words.some(word => text.includes(word))) {
        recommendedTags.push(tag);
      }
    });

    res.json({
      success: true,
      data: {
        recommendedTags: recommendedTags.slice(0, 5)
      }
    });
  } catch (error) {
    console.error('推荐标签失败:', error);
    res.status(500).json({
      success: false,
      message: '推荐标签失败',
      error: error.message
    });
  }
};

module.exports = {
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
};