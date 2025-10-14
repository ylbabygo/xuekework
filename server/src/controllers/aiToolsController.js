const AITool = require('../models/AITool');
const UserAIToolFavorite = require('../models/UserAIToolFavorite');
const UserAIToolBookmark = require('../models/UserAIToolBookmark');

// 获取AI工具列表
const getAITools = async (req, res) => {
  try {
    const {
      category,
      subcategory,
      search,
      is_featured,
      is_trending,
      is_new,
      pricing,
      api_available,
      open_source,
      free_tier,
      trial_available,
      mobile_app,
      chrome_extension,
      difficulty_level,
      target_audience,
      page = 1,
      limit = 20,
      sort_by = 'rating',
      sort_order = 'DESC'
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    const tools = await AITool.getAll({
      category,
      subcategory,
      search,
      is_featured: is_featured !== undefined ? is_featured === 'true' : undefined,
      is_trending: is_trending !== undefined ? is_trending === 'true' : undefined,
      is_new: is_new !== undefined ? is_new === 'true' : undefined,
      pricing,
      api_available: api_available !== undefined ? api_available === 'true' : undefined,
      open_source: open_source !== undefined ? open_source === 'true' : undefined,
      free_tier: free_tier !== undefined ? free_tier === 'true' : undefined,
      trial_available: trial_available !== undefined ? trial_available === 'true' : undefined,
      mobile_app: mobile_app !== undefined ? mobile_app === 'true' : undefined,
      chrome_extension: chrome_extension !== undefined ? chrome_extension === 'true' : undefined,
      difficulty_level,
      target_audience,
      limit: parseInt(limit),
      offset,
      sort_by,
      sort_order
    });

    // 如果用户已登录，获取用户的收藏状态
    let favoriteToolIds = [];
    if (req.user) {
      favoriteToolIds = await UserAIToolFavorite.getUserFavoriteToolIds(req.user.id);
    }

    // 为每个工具添加收藏状态
    const toolsWithFavoriteStatus = tools.map(tool => ({
      ...tool.toJSON(),
      is_favorited: favoriteToolIds.includes(tool.id)
    }));

    res.json({
      success: true,
      data: {
        tools: toolsWithFavoriteStatus,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          has_more: tools.length === parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('获取AI工具列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取AI工具列表失败',
      error: error.message
    });
  }
};

// 获取单个AI工具详情
const getAITool = async (req, res) => {
  try {
    const { id } = req.params;
    const tool = await AITool.findById(id);

    if (!tool) {
      return res.status(404).json({
        success: false,
        message: 'AI工具不存在'
      });
    }

    // 增加浏览次数
    await tool.incrementViewCount();

    // 检查用户是否收藏了此工具
    let is_favorited = false;
    if (req.user) {
      is_favorited = await UserAIToolFavorite.isFavorited(req.user.id, id);
    }

    res.json({
      success: true,
      data: {
        ...tool.toJSON(),
        is_favorited
      }
    });
  } catch (error) {
    console.error('获取AI工具详情失败:', error);
    res.status(500).json({
      success: false,
      message: '获取AI工具详情失败',
      error: error.message
    });
  }
};

// 获取AI工具分类
const getCategories = async (req, res) => {
  try {
    const categories = await AITool.getCategories();
    res.json({
      success: true,
      data: categories
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

// 获取热门标签
const getPopularTags = async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    const tags = await AITool.getPopularTags(parseInt(limit));
    res.json({
      success: true,
      data: tags
    });
  } catch (error) {
    console.error('获取热门标签失败:', error);
    res.status(500).json({
      success: false,
      message: '获取热门标签失败',
      error: error.message
    });
  }
};

// 添加收藏
const addFavorite = async (req, res) => {
  try {
    const { toolId } = req.params;
    const userId = req.user.id;

    // 检查工具是否存在
    const tool = await AITool.findById(toolId);
    if (!tool) {
      return res.status(404).json({
        success: false,
        message: 'AI工具不存在'
      });
    }

    const favorite = await UserAIToolFavorite.create(userId, toolId);
    res.json({
      success: true,
      message: '收藏成功',
      data: favorite.toJSON()
    });
  } catch (error) {
    console.error('添加收藏失败:', error);
    if (error.message === '已经收藏过此工具') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    res.status(500).json({
      success: false,
      message: '添加收藏失败',
      error: error.message
    });
  }
};

// 取消收藏
const removeFavorite = async (req, res) => {
  try {
    const { toolId } = req.params;
    const userId = req.user.id;

    const success = await UserAIToolFavorite.removeFavorite(userId, toolId);
    if (!success) {
      return res.status(404).json({
        success: false,
        message: '收藏记录不存在'
      });
    }

    res.json({
      success: true,
      message: '取消收藏成功'
    });
  } catch (error) {
    console.error('取消收藏失败:', error);
    res.status(500).json({
      success: false,
      message: '取消收藏失败',
      error: error.message
    });
  }
};

// 获取用户收藏列表
const getUserFavorites = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const favorites = await UserAIToolFavorite.getUserFavorites(userId, {
      limit: parseInt(limit),
      offset
    });

    res.json({
      success: true,
      data: {
        favorites,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          has_more: favorites.length === parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('获取收藏列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取收藏列表失败',
      error: error.message
    });
  }
};

// 获取统计信息
const getStats = async (req, res) => {
  try {
    const stats = await AITool.getStats();
    
    // 如果用户已登录，获取用户的收藏统计
    let userStats = null;
    if (req.user) {
      userStats = await UserAIToolFavorite.getUserFavoriteStats(req.user.id);
    }

    res.json({
      success: true,
      data: {
        global: stats,
        user: userStats
      }
    });
  } catch (error) {
    console.error('获取统计信息失败:', error);
    res.status(500).json({
      success: false,
      message: '获取统计信息失败',
      error: error.message
    });
  }
};

// 创建AI工具（管理员功能）
const createAITool = async (req, res) => {
  try {
    const toolData = req.body;
    const tool = await AITool.create(toolData);
    
    res.status(201).json({
      success: true,
      message: 'AI工具创建成功',
      data: tool.toJSON()
    });
  } catch (error) {
    console.error('创建AI工具失败:', error);
    res.status(500).json({
      success: false,
      message: '创建AI工具失败',
      error: error.message
    });
  }
};

// 更新AI工具（管理员功能）
const updateAITool = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const tool = await AITool.findById(id);
    if (!tool) {
      return res.status(404).json({
        success: false,
        message: 'AI工具不存在'
      });
    }

    const updatedTool = await tool.update(updateData);
    res.json({
      success: true,
      message: 'AI工具更新成功',
      data: updatedTool.toJSON()
    });
  } catch (error) {
    console.error('更新AI工具失败:', error);
    res.status(500).json({
      success: false,
      message: '更新AI工具失败',
      error: error.message
    });
  }
};

// 删除AI工具（管理员功能）
const deleteAITool = async (req, res) => {
  try {
    const { id } = req.params;
    const tool = await AITool.findById(id);

    if (!tool) {
      return res.status(404).json({
        success: false,
        message: 'AI工具不存在'
      });
    }

    await tool.delete();
    res.json({
      success: true,
      message: 'AI工具删除成功'
    });
  } catch (error) {
    console.error('删除AI工具失败:', error);
    res.status(500).json({
      success: false,
      message: '删除AI工具失败',
      error: error.message
    });
  }
};

// 点赞AI工具
const likeAITool = async (req, res) => {
  try {
    const { id } = req.params;
    const tool = await AITool.findById(id);

    if (!tool) {
      return res.status(404).json({
        success: false,
        message: 'AI工具不存在'
      });
    }

    // 增加点赞数
    await tool.update({ like_count: (tool.like_count || 0) + 1 });
    
    res.json({
      success: true,
      message: '点赞成功',
      data: { like_count: tool.like_count + 1 }
    });
  } catch (error) {
    console.error('点赞失败:', error);
    res.status(500).json({
      success: false,
      message: '点赞失败',
      error: error.message
    });
  }
};

// 添加书签
const addBookmark = async (req, res) => {
  try {
    const { toolId } = req.params;
    const userId = req.user.id;

    const tool = await AITool.findById(toolId);
    if (!tool) {
      return res.status(404).json({
        success: false,
        message: 'AI工具不存在'
      });
    }

    // 检查是否已经书签
    const isBookmarked = await UserAIToolBookmark.isBookmarked(userId, toolId);
    if (isBookmarked) {
      return res.status(400).json({
        success: false,
        message: '已经添加到书签'
      });
    }

    // 添加书签
    await UserAIToolBookmark.addBookmark(userId, toolId);
    
    // 更新工具的书签数
    const bookmarkCount = await UserAIToolBookmark.getBookmarkCount(toolId);
    await tool.update({ bookmark_count: bookmarkCount });

    res.json({
      success: true,
      message: '添加书签成功'
    });
  } catch (error) {
    console.error('添加书签失败:', error);
    res.status(500).json({
      success: false,
      message: '添加书签失败',
      error: error.message
    });
  }
};

// 移除书签
const removeBookmark = async (req, res) => {
  try {
    const { toolId } = req.params;
    const userId = req.user.id;

    const removed = await UserAIToolBookmark.removeBookmark(userId, toolId);
    if (!removed) {
      return res.status(404).json({
        success: false,
        message: '书签不存在'
      });
    }

    // 更新工具的书签数
    const tool = await AITool.findById(toolId);
    if (tool) {
      const bookmarkCount = await UserAIToolBookmark.getBookmarkCount(toolId);
      await tool.update({ bookmark_count: bookmarkCount });
    }

    res.json({
      success: true,
      message: '移除书签成功'
    });
  } catch (error) {
    console.error('移除书签失败:', error);
    res.status(500).json({
      success: false,
      message: '移除书签失败',
      error: error.message
    });
  }
};

// 获取用户书签
const getUserBookmarks = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const bookmarks = await UserAIToolBookmark.getUserBookmarks(userId, {
      limit: parseInt(limit),
      offset
    });

    res.json({
      success: true,
      data: bookmarks,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        has_more: bookmarks.length === parseInt(limit)
      }
    });
  } catch (error) {
    console.error('获取用户书签失败:', error);
    res.status(500).json({
      success: false,
      message: '获取用户书签失败',
      error: error.message
    });
  }
};

// 书签AI工具（保持向后兼容，公开接口）
const bookmarkAITool = async (req, res) => {
  try {
    const { id } = req.params;
    const tool = await AITool.findById(id);

    if (!tool) {
      return res.status(404).json({
        success: false,
        message: 'AI工具不存在'
      });
    }

    // 增加书签数
    await tool.update({ bookmark_count: (tool.bookmark_count || 0) + 1 });
    
    res.json({
      success: true,
      message: '书签添加成功',
      data: { bookmark_count: tool.bookmark_count + 1 }
    });
  } catch (error) {
    console.error('添加书签失败:', error);
    res.status(500).json({
      success: false,
      message: '添加书签失败',
      error: error.message
    });
  }
};

// 获取趋势工具
const getTrendingTools = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const tools = await AITool.getAll({
      is_trending: true,
      limit: parseInt(limit),
      offset: 0,
      sort_by: 'monthly_visits',
      sort_order: 'DESC'
    });

    res.json({
      success: true,
      data: tools.map(tool => tool.toJSON())
    });
  } catch (error) {
    console.error('获取趋势工具失败:', error);
    res.status(500).json({
      success: false,
      message: '获取趋势工具失败',
      error: error.message
    });
  }
};

// 获取新工具
const getNewTools = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const tools = await AITool.getAll({
      is_new: true,
      limit: parseInt(limit),
      offset: 0,
      sort_by: 'launch_date',
      sort_order: 'DESC'
    });

    res.json({
      success: true,
      data: tools.map(tool => tool.toJSON())
    });
  } catch (error) {
    console.error('获取新工具失败:', error);
    res.status(500).json({
      success: false,
      message: '获取新工具失败',
      error: error.message
    });
  }
};

// 获取子分类
const getSubcategories = async (req, res) => {
  try {
    const { category } = req.query;
    const subcategories = await AITool.getSubcategories(category);
    
    res.json({
      success: true,
      data: subcategories
    });
  } catch (error) {
    console.error('获取子分类失败:', error);
    res.status(500).json({
      success: false,
      message: '获取子分类失败',
      error: error.message
    });
  }
};

// 获取工具的相似推荐
const getSimilarTools = async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 5 } = req.query;
    
    const tool = await AITool.findById(id);
    if (!tool) {
      return res.status(404).json({
        success: false,
        message: 'AI工具不存在'
      });
    }

    // 基于分类和标签获取相似工具
    const similarTools = await AITool.getAll({
      category: tool.category,
      limit: parseInt(limit) + 1, // +1 因为要排除当前工具
      offset: 0,
      sort_by: 'rating',
      sort_order: 'DESC'
    });

    // 排除当前工具
    const filteredTools = similarTools.filter(t => t.id !== parseInt(id));
    
    res.json({
      success: true,
      data: filteredTools.slice(0, parseInt(limit)).map(tool => tool.toJSON())
    });
  } catch (error) {
    console.error('获取相似工具失败:', error);
    res.status(500).json({
      success: false,
      message: '获取相似工具失败',
      error: error.message
    });
  }
};

module.exports = {
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
};