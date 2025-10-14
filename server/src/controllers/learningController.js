const { callAI } = require('../services/aiService');
const fs = require('fs').promises;
const path = require('path');

// 学习资源类型
const RESOURCE_TYPES = {
  ARTICLE: 'article',
  VIDEO: 'video',
  BOOK: 'book',
  COURSE: 'course',
  DOCUMENT: 'document',
  LINK: 'link'
};

// 学习状态
const LEARNING_STATUS = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  PAUSED: 'paused'
};

// 模拟数据库存储（实际项目中应使用真实数据库）
let learningResources = [];
let learningProgress = [];
let studyPlans = [];

// 获取所有学习资源
const getResources = async (req, res) => {
  try {
    const { type, status, search, page = 1, limit = 20 } = req.query;
    
    let filteredResources = [...learningResources];
    
    // 按类型过滤
    if (type && type !== 'all') {
      filteredResources = filteredResources.filter(resource => resource.type === type);
    }
    
    // 按状态过滤
    if (status && status !== 'all') {
      filteredResources = filteredResources.filter(resource => {
        const progress = learningProgress.find(p => p.resourceId === resource.id && p.userId === req.user.id);
        return progress ? progress.status === status : status === LEARNING_STATUS.NOT_STARTED;
      });
    }
    
    // 搜索过滤
    if (search) {
      const searchLower = search.toLowerCase();
      filteredResources = filteredResources.filter(resource => 
        resource.title.toLowerCase().includes(searchLower) ||
        resource.description.toLowerCase().includes(searchLower) ||
        resource.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }
    
    // 分页
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedResources = filteredResources.slice(startIndex, endIndex);
    
    // 添加学习进度信息
    const resourcesWithProgress = paginatedResources.map(resource => {
      const progress = learningProgress.find(p => p.resourceId === resource.id && p.userId === req.user.id);
      return {
        ...resource,
        progress: progress || {
          status: LEARNING_STATUS.NOT_STARTED,
          completionPercentage: 0,
          timeSpent: 0,
          lastAccessed: null
        }
      };
    });
    
    res.json({
      success: true,
      data: {
        resources: resourcesWithProgress,
        total: filteredResources.length,
        page: parseInt(page),
        totalPages: Math.ceil(filteredResources.length / limit)
      }
    });
  } catch (error) {
    console.error('获取学习资源失败:', error);
    res.status(500).json({
      success: false,
      message: '获取学习资源失败'
    });
  }
};

// 添加学习资源
const addResource = async (req, res) => {
  try {
    const { title, description, type, url, tags, difficulty, estimatedTime } = req.body;
    
    if (!title || !type) {
      return res.status(400).json({
        success: false,
        message: '标题和类型为必填项'
      });
    }
    
    const newResource = {
      id: Date.now().toString(),
      title,
      description: description || '',
      type,
      url: url || '',
      tags: tags || [],
      difficulty: difficulty || 'beginner',
      estimatedTime: estimatedTime || 0,
      createdBy: req.user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    learningResources.push(newResource);
    
    res.json({
      success: true,
      data: newResource,
      message: '学习资源添加成功'
    });
  } catch (error) {
    console.error('添加学习资源失败:', error);
    res.status(500).json({
      success: false,
      message: '添加学习资源失败'
    });
  }
};

// 更新学习资源
const updateResource = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const resourceIndex = learningResources.findIndex(r => r.id === id);
    if (resourceIndex === -1) {
      return res.status(404).json({
        success: false,
        message: '学习资源不存在'
      });
    }
    
    learningResources[resourceIndex] = {
      ...learningResources[resourceIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: learningResources[resourceIndex],
      message: '学习资源更新成功'
    });
  } catch (error) {
    console.error('更新学习资源失败:', error);
    res.status(500).json({
      success: false,
      message: '更新学习资源失败'
    });
  }
};

// 删除学习资源
const deleteResource = async (req, res) => {
  try {
    const { id } = req.params;
    
    const resourceIndex = learningResources.findIndex(r => r.id === id);
    if (resourceIndex === -1) {
      return res.status(404).json({
        success: false,
        message: '学习资源不存在'
      });
    }
    
    learningResources.splice(resourceIndex, 1);
    
    // 删除相关的学习进度
    learningProgress = learningProgress.filter(p => p.resourceId !== id);
    
    res.json({
      success: true,
      message: '学习资源删除成功'
    });
  } catch (error) {
    console.error('删除学习资源失败:', error);
    res.status(500).json({
      success: false,
      message: '删除学习资源失败'
    });
  }
};

// 更新学习进度
const updateProgress = async (req, res) => {
  try {
    const { resourceId } = req.params;
    const { status, completionPercentage, timeSpent, notes } = req.body;
    
    const resource = learningResources.find(r => r.id === resourceId);
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: '学习资源不存在'
      });
    }
    
    const existingProgressIndex = learningProgress.findIndex(
      p => p.resourceId === resourceId && p.userId === req.user.id
    );
    
    const progressData = {
      resourceId,
      userId: req.user.id,
      status: status || LEARNING_STATUS.IN_PROGRESS,
      completionPercentage: completionPercentage || 0,
      timeSpent: timeSpent || 0,
      notes: notes || '',
      lastAccessed: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    if (existingProgressIndex !== -1) {
      learningProgress[existingProgressIndex] = {
        ...learningProgress[existingProgressIndex],
        ...progressData
      };
    } else {
      progressData.createdAt = new Date().toISOString();
      learningProgress.push(progressData);
    }
    
    res.json({
      success: true,
      data: progressData,
      message: '学习进度更新成功'
    });
  } catch (error) {
    console.error('更新学习进度失败:', error);
    res.status(500).json({
      success: false,
      message: '更新学习进度失败'
    });
  }
};

// 获取学习统计
const getStatistics = async (req, res) => {
  try {
    const userId = req.user.id;
    const userProgress = learningProgress.filter(p => p.userId === userId);
    
    const stats = {
      totalResources: learningResources.length,
      completedResources: userProgress.filter(p => p.status === LEARNING_STATUS.COMPLETED).length,
      inProgressResources: userProgress.filter(p => p.status === LEARNING_STATUS.IN_PROGRESS).length,
      totalTimeSpent: userProgress.reduce((total, p) => total + (p.timeSpent || 0), 0),
      averageCompletion: userProgress.length > 0 
        ? userProgress.reduce((total, p) => total + (p.completionPercentage || 0), 0) / userProgress.length 
        : 0,
      resourcesByType: {},
      recentActivity: userProgress
        .sort((a, b) => new Date(b.lastAccessed) - new Date(a.lastAccessed))
        .slice(0, 10)
        .map(p => {
          const resource = learningResources.find(r => r.id === p.resourceId);
          return {
            ...p,
            resourceTitle: resource ? resource.title : '未知资源'
          };
        })
    };
    
    // 按类型统计资源
    Object.values(RESOURCE_TYPES).forEach(type => {
      const typeResources = learningResources.filter(r => r.type === type);
      const typeProgress = userProgress.filter(p => {
        const resource = learningResources.find(r => r.id === p.resourceId);
        return resource && resource.type === type;
      });
      
      stats.resourcesByType[type] = {
        total: typeResources.length,
        completed: typeProgress.filter(p => p.status === LEARNING_STATUS.COMPLETED).length,
        inProgress: typeProgress.filter(p => p.status === LEARNING_STATUS.IN_PROGRESS).length
      };
    });
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('获取学习统计失败:', error);
    res.status(500).json({
      success: false,
      message: '获取学习统计失败'
    });
  }
};

// 生成学习计划
const generateStudyPlan = async (req, res) => {
  try {
    const { goals, timeAvailable, difficulty, subjects, duration } = req.body;
    
    if (!goals || !timeAvailable) {
      return res.status(400).json({
        success: false,
        message: '学习目标和可用时间为必填项'
      });
    }
    
    // 使用AI生成学习计划
    const prompt = `
请为用户生成一个详细的学习计划，要求如下：

学习目标：${goals}
每周可用时间：${timeAvailable}小时
难度级别：${difficulty || 'intermediate'}
感兴趣的学科：${subjects ? subjects.join(', ') : '通用'}
计划持续时间：${duration || '4'}周

请生成一个结构化的学习计划，包括：
1. 总体学习路径
2. 每周学习重点
3. 具体的学习任务和时间分配
4. 推荐的学习资源类型
5. 学习进度检查点
6. 学习建议和技巧

请以JSON格式返回，包含以下字段：
- title: 计划标题
- description: 计划描述
- weeks: 每周计划数组，每个包含 week, focus, tasks, timeAllocation
- milestones: 里程碑数组
- recommendations: 学习建议数组
`;

    const aiResponse = await callAI(prompt, 'gpt-3.5-turbo');
    
    let planData;
    try {
      // 尝试解析AI返回的JSON
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        planData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('无法解析AI响应');
      }
    } catch (parseError) {
      // 如果解析失败，创建一个基本的计划结构
      planData = {
        title: `${goals} - 学习计划`,
        description: aiResponse,
        weeks: [],
        milestones: [],
        recommendations: []
      };
    }
    
    const studyPlan = {
      id: Date.now().toString(),
      userId: req.user.id,
      ...planData,
      goals,
      timeAvailable,
      difficulty: difficulty || 'intermediate',
      subjects: subjects || [],
      duration: duration || 4,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'active'
    };
    
    studyPlans.push(studyPlan);
    
    res.json({
      success: true,
      data: studyPlan,
      message: '学习计划生成成功'
    });
  } catch (error) {
    console.error('生成学习计划失败:', error);
    res.status(500).json({
      success: false,
      message: '生成学习计划失败'
    });
  }
};

// 获取学习计划
const getStudyPlans = async (req, res) => {
  try {
    const userId = req.user.id;
    const userPlans = studyPlans.filter(plan => plan.userId === userId);
    
    res.json({
      success: true,
      data: userPlans
    });
  } catch (error) {
    console.error('获取学习计划失败:', error);
    res.status(500).json({
      success: false,
      message: '获取学习计划失败'
    });
  }
};

// 推荐学习资源
const getRecommendations = async (req, res) => {
  try {
    const userId = req.user.id;
    const userProgress = learningProgress.filter(p => p.userId === userId);
    
    // 基于用户学习历史推荐资源
    const completedResources = userProgress
      .filter(p => p.status === LEARNING_STATUS.COMPLETED)
      .map(p => learningResources.find(r => r.id === p.resourceId))
      .filter(Boolean);
    
    const inProgressResources = userProgress
      .filter(p => p.status === LEARNING_STATUS.IN_PROGRESS)
      .map(p => learningResources.find(r => r.id === p.resourceId))
      .filter(Boolean);
    
    // 获取用户感兴趣的标签
    const userTags = [...new Set([
      ...completedResources.flatMap(r => r.tags),
      ...inProgressResources.flatMap(r => r.tags)
    ])];
    
    // 推荐相似的资源
    const recommendations = learningResources
      .filter(resource => {
        // 排除已完成和正在学习的资源
        const isAlreadyLearning = userProgress.some(p => p.resourceId === resource.id);
        if (isAlreadyLearning) return false;
        
        // 基于标签相似度推荐
        const commonTags = resource.tags.filter(tag => userTags.includes(tag));
        return commonTags.length > 0;
      })
      .sort((a, b) => {
        // 按标签匹配度排序
        const aMatches = a.tags.filter(tag => userTags.includes(tag)).length;
        const bMatches = b.tags.filter(tag => userTags.includes(tag)).length;
        return bMatches - aMatches;
      })
      .slice(0, 10);
    
    res.json({
      success: true,
      data: {
        recommendations,
        userInterests: userTags,
        totalRecommendations: recommendations.length
      }
    });
  } catch (error) {
    console.error('获取推荐资源失败:', error);
    res.status(500).json({
      success: false,
      message: '获取推荐资源失败'
    });
  }
};

// 初始化一些示例数据
const initializeSampleData = () => {
  if (learningResources.length === 0) {
    learningResources = [
      {
        id: '1',
        title: 'JavaScript基础教程',
        description: '从零开始学习JavaScript编程语言的基础知识',
        type: RESOURCE_TYPES.COURSE,
        url: 'https://example.com/js-basics',
        tags: ['JavaScript', '编程', '前端', '基础'],
        difficulty: 'beginner',
        estimatedTime: 20,
        createdBy: 'system',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '2',
        title: 'React开发实战',
        description: '深入学习React框架，构建现代化的Web应用',
        type: RESOURCE_TYPES.COURSE,
        url: 'https://example.com/react-course',
        tags: ['React', 'JavaScript', '前端', '框架'],
        difficulty: 'intermediate',
        estimatedTime: 40,
        createdBy: 'system',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '3',
        title: '数据结构与算法',
        description: '计算机科学基础：数据结构与算法设计',
        type: RESOURCE_TYPES.BOOK,
        url: 'https://example.com/algorithms-book',
        tags: ['算法', '数据结构', '计算机科学', '编程'],
        difficulty: 'advanced',
        estimatedTime: 60,
        createdBy: 'system',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  }
};

// 初始化示例数据
initializeSampleData();

module.exports = {
  getResources,
  addResource,
  updateResource,
  deleteResource,
  updateProgress,
  getStatistics,
  generateStudyPlan,
  getStudyPlans,
  getRecommendations,
  RESOURCE_TYPES,
  LEARNING_STATUS
};