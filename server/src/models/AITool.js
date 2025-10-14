const { query, transaction } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class AITool {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.short_description = data.short_description;
    this.category = data.category;
    this.subcategory = data.subcategory;
    this.url = data.url;
    this.logo_url = data.logo_url;
    this.screenshot_url = data.screenshot_url;
    this.rating = data.rating;
    this.rating_count = data.rating_count;
    this.pricing = data.pricing;
    this.pricing_details = data.pricing_details;
    this.features = typeof data.features === 'string' ? JSON.parse(data.features) : data.features;
    this.tags = typeof data.tags === 'string' ? JSON.parse(data.tags) : data.tags;
    this.is_featured = data.is_featured;
    this.is_trending = data.is_trending;
    this.is_new = data.is_new;
    this.view_count = data.view_count;
    this.like_count = data.like_count;
    this.bookmark_count = data.bookmark_count;
    this.monthly_visits = data.monthly_visits;
    this.launch_date = data.launch_date;
    this.company = data.company;
    this.country = data.country;
    this.languages = typeof data.languages === 'string' ? JSON.parse(data.languages) : data.languages;
    this.platforms = typeof data.platforms === 'string' ? JSON.parse(data.platforms) : data.platforms;
    this.api_available = data.api_available;
    this.open_source = data.open_source;
    this.free_tier = data.free_tier;
    this.trial_available = data.trial_available;
    this.mobile_app = data.mobile_app;
    this.chrome_extension = data.chrome_extension;
    this.integrations = typeof data.integrations === 'string' ? JSON.parse(data.integrations) : data.integrations;
    this.use_cases = typeof data.use_cases === 'string' ? JSON.parse(data.use_cases) : data.use_cases;
    this.target_audience = typeof data.target_audience === 'string' ? JSON.parse(data.target_audience) : data.target_audience;
    this.difficulty_level = data.difficulty_level;
    this.last_synced_at = data.last_synced_at;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // 创建AI工具
  static async create(toolData) {
    const id = uuidv4();
    const {
      name,
      description,
      short_description = '',
      category,
      subcategory = '',
      url,
      logo_url,
      screenshot_url = '',
      rating = 0,
      rating_count = 0,
      pricing = 'free',
      pricing_details = '',
      features = [],
      tags = [],
      is_featured = false,
      is_trending = false,
      is_new = false,
      like_count = 0,
      bookmark_count = 0,
      monthly_visits = 0,
      launch_date = '',
      company = '',
      country = '',
      languages = [],
      platforms = [],
      api_available = false,
      open_source = false,
      free_tier = false,
      trial_available = false,
      mobile_app = false,
      chrome_extension = false,
      integrations = [],
      use_cases = [],
      target_audience = [],
      difficulty_level = 'beginner'
    } = toolData;

    const sql = `
      INSERT INTO ai_tools (
        id, name, description, short_description, category, subcategory, url, logo_url, screenshot_url,
        rating, rating_count, pricing, pricing_details, features, tags, is_featured, is_trending, is_new,
        view_count, like_count, bookmark_count, monthly_visits, launch_date, company, country,
        languages, platforms, api_available, open_source, free_tier, trial_available,
        mobile_app, chrome_extension, integrations, use_cases, target_audience, difficulty_level,
        last_synced_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `;

    await query(sql, [
      id, name, description, short_description, category, subcategory, url, logo_url, screenshot_url,
      rating, rating_count, pricing, pricing_details, JSON.stringify(features), JSON.stringify(tags), 
      is_featured, is_trending, is_new, like_count, bookmark_count, monthly_visits, launch_date, 
      company, country, JSON.stringify(languages), JSON.stringify(platforms), api_available, 
      open_source, free_tier, trial_available, mobile_app, chrome_extension, 
      JSON.stringify(integrations), JSON.stringify(use_cases), JSON.stringify(target_audience), difficulty_level
    ]);

    return await AITool.findById(id);
  }

  // 根据ID查找AI工具
  static async findById(id) {
    const sql = 'SELECT * FROM ai_tools WHERE id = ?';
    const rows = await query(sql, [id]);
    return rows.length > 0 ? new AITool(rows[0]) : null;
  }

  // 获取所有AI工具
  static async getAll(options = {}) {
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
      limit = 50,
      offset = 0,
      sort_by = 'rating',
      sort_order = 'DESC'
    } = options;

    let sql = 'SELECT * FROM ai_tools WHERE 1=1';
    const params = [];

    // 分类筛选
    if (category) {
      sql += ' AND category = ?';
      params.push(category);
    }

    // 子分类筛选
    if (subcategory) {
      sql += ' AND subcategory = ?';
      params.push(subcategory);
    }

    // 搜索筛选
    if (search) {
      sql += ' AND (name LIKE ? OR description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    // 精选筛选
    if (is_featured !== undefined) {
      sql += ' AND is_featured = ?';
      params.push(is_featured);
    }

    // 趋势筛选
    if (is_trending !== undefined) {
      sql += ' AND is_trending = ?';
      params.push(is_trending);
    }

    // 新工具筛选
    if (is_new !== undefined) {
      sql += ' AND is_new = ?';
      params.push(is_new);
    }

    // 定价筛选
    if (pricing) {
      sql += ' AND pricing = ?';
      params.push(pricing);
    }

    // API可用性筛选
    if (api_available !== undefined) {
      sql += ' AND api_available = ?';
      params.push(api_available);
    }

    // 开源筛选
    if (open_source !== undefined) {
      sql += ' AND open_source = ?';
      params.push(open_source);
    }

    // 免费层筛选
    if (free_tier !== undefined) {
      sql += ' AND free_tier = ?';
      params.push(free_tier);
    }

    // 试用筛选
    if (trial_available !== undefined) {
      sql += ' AND trial_available = ?';
      params.push(trial_available);
    }

    // 移动应用筛选
    if (mobile_app !== undefined) {
      sql += ' AND mobile_app = ?';
      params.push(mobile_app);
    }

    // Chrome扩展筛选
    if (chrome_extension !== undefined) {
      sql += ' AND chrome_extension = ?';
      params.push(chrome_extension);
    }

    // 难度级别筛选
    if (difficulty_level) {
      sql += ' AND difficulty_level = ?';
      params.push(difficulty_level);
    }

    // 目标受众筛选
    if (target_audience) {
      sql += ' AND target_audience LIKE ?';
      params.push(`%${target_audience}%`);
    }

    // 排序
    const validSortFields = ['rating', 'view_count', 'created_at', 'name', 'like_count', 'bookmark_count', 'monthly_visits', 'launch_date'];
    const sortField = validSortFields.includes(sort_by) ? sort_by : 'rating';
    const sortDirection = sort_order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    sql += ` ORDER BY ${sortField} ${sortDirection}`;

    // 分页
    sql += ' LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const rows = await query(sql, params);
    return rows.map(row => new AITool(row));
  }

  // 获取分类列表
  static async getCategories() {
    const sql = `
      SELECT category, COUNT(*) as count 
      FROM ai_tools 
      GROUP BY category 
      ORDER BY count DESC
    `;
    const rows = await query(sql);
    return rows;
  }

  // 获取子分类列表
  static async getSubcategories(category = null) {
    let sql = `
      SELECT subcategory, COUNT(*) as count 
      FROM ai_tools 
      WHERE subcategory IS NOT NULL AND subcategory != ''
    `;
    const params = [];

    if (category) {
      sql += ' AND category = ?';
      params.push(category);
    }

    sql += ' GROUP BY subcategory ORDER BY count DESC';
    
    const rows = await query(sql, params);
    return rows;
  }

  // 获取热门标签
  static async getPopularTags(limit = 20) {
    const sql = 'SELECT tags FROM ai_tools WHERE tags IS NOT NULL';
    const rows = await query(sql);
    
    const tagCount = {};
    rows.forEach(row => {
      const tags = typeof row.tags === 'string' ? JSON.parse(row.tags) : row.tags;
      if (Array.isArray(tags)) {
        tags.forEach(tag => {
          tagCount[tag] = (tagCount[tag] || 0) + 1;
        });
      }
    });

    return Object.entries(tagCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)
      .map(([tag, count]) => ({ tag, count }));
  }

  // 增加浏览次数
  async incrementViewCount() {
    const sql = 'UPDATE ai_tools SET view_count = view_count + 1 WHERE id = ?';
    await query(sql, [this.id]);
    this.view_count += 1;
    return this;
  }

  // 更新AI工具信息
  async update(updateData) {
    const allowedFields = [
      'name', 'description', 'short_description', 'category', 'subcategory', 'url', 'logo_url', 'screenshot_url',
      'rating', 'rating_count', 'pricing', 'pricing_details', 'features', 'tags', 'is_featured', 'is_trending', 'is_new',
      'like_count', 'bookmark_count', 'monthly_visits', 'launch_date', 'company', 'country',
      'languages', 'platforms', 'api_available', 'open_source', 'free_tier', 'trial_available',
      'mobile_app', 'chrome_extension', 'integrations', 'use_cases', 'target_audience', 'difficulty_level'
    ];

    const updates = [];
    const params = [];

    Object.keys(updateData).forEach(key => {
      if (allowedFields.includes(key) && updateData[key] !== undefined) {
        updates.push(`${key} = ?`);
        if (['features', 'tags', 'languages', 'platforms', 'integrations', 'use_cases', 'target_audience'].includes(key)) {
          params.push(JSON.stringify(updateData[key]));
        } else {
          params.push(updateData[key]);
        }
      }
    });

    if (updates.length === 0) {
      return this;
    }

    updates.push('updated_at = datetime(\'now\')');
    params.push(this.id);

    const sql = `UPDATE ai_tools SET ${updates.join(', ')} WHERE id = ?`;
    await query(sql, params);

    // 重新获取更新后的数据
    return await AITool.findById(this.id);
  }

  // 删除AI工具
  async delete() {
    return await transaction(async (connection) => {
      // 删除用户收藏
      await connection.execute('DELETE FROM user_ai_tool_favorites WHERE tool_id = ?', [this.id]);
      // 删除工具
      await connection.execute('DELETE FROM ai_tools WHERE id = ?', [this.id]);
      return true;
    });
  }

  // 获取统计信息
  static async getStats() {
    const sql = `
      SELECT 
        COUNT(*) as total_tools,
        COUNT(CASE WHEN is_featured = 1 THEN 1 END) as featured_tools,
        AVG(rating) as avg_rating,
        SUM(view_count) as total_views,
        COUNT(DISTINCT category) as total_categories
      FROM ai_tools
    `;
    const rows = await query(sql);
    return rows[0];
  }

  // 转换为JSON格式
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      short_description: this.short_description,
      category: this.category,
      subcategory: this.subcategory,
      url: this.url,
      logo_url: this.logo_url,
      screenshot_url: this.screenshot_url,
      rating: this.rating,
      rating_count: this.rating_count,
      pricing: this.pricing,
      pricing_details: this.pricing_details,
      features: this.features,
      tags: this.tags,
      is_featured: this.is_featured,
      is_trending: this.is_trending,
      is_new: this.is_new,
      view_count: this.view_count,
      like_count: this.like_count,
      bookmark_count: this.bookmark_count,
      monthly_visits: this.monthly_visits,
      launch_date: this.launch_date,
      company: this.company,
      country: this.country,
      languages: this.languages,
      platforms: this.platforms,
      api_available: this.api_available,
      open_source: this.open_source,
      free_tier: this.free_tier,
      trial_available: this.trial_available,
      mobile_app: this.mobile_app,
      chrome_extension: this.chrome_extension,
      integrations: this.integrations,
      use_cases: this.use_cases,
      target_audience: this.target_audience,
      difficulty_level: this.difficulty_level,
      last_synced_at: this.last_synced_at,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

module.exports = AITool;