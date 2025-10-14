const { query, transaction } = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs').promises;

class Asset {
  constructor(data) {
    this.id = data.id;
    this.user_id = data.user_id;
    this.filename = data.filename;
    this.original_name = data.original_name;
    this.file_path = data.file_path;
    this.file_size = data.file_size;
    this.mime_type = data.mime_type;
    this.file_type = data.file_type;
    this.description = data.description;
    this.tags = data.tags;
    this.ai_summary = data.ai_summary;
    this.ai_keywords = data.ai_keywords;
    this.download_count = data.download_count;
    this.is_public = data.is_public;
    this.version = data.version;
    this.parent_id = data.parent_id;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // 创建新物料
  static async create(assetData) {
    const {
      user_id,
      filename,
      original_name,
      file_path,
      file_size,
      mime_type,
      file_type,
      description = '',
      tags = [],
      is_public = false
    } = assetData;

    const id = uuidv4();
    const sql = `
      INSERT INTO assets (
        id, user_id, filename, original_name, file_path, file_size,
        mime_type, file_type, description, tags, is_public
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await query(sql, [
      id, user_id, filename, original_name, file_path, file_size,
      mime_type, file_type, description, JSON.stringify(tags), is_public
    ]);

    return await this.findById(id);
  }

  // 根据ID查找物料
  static async findById(id) {
    const sql = 'SELECT * FROM assets WHERE id = ?';
    const rows = await query(sql, [id]);
    if (rows.length === 0) return null;

    const asset = new Asset(rows[0]);
    asset.tags = JSON.parse(asset.tags || '[]');
    asset.ai_keywords = JSON.parse(asset.ai_keywords || '[]');
    return asset;
  }

  // 获取用户的物料列表
  static async getByUser(userId, options = {}) {
    const {
      page = 1,
      limit = 20,
      file_type = '',
      search = '',
      tags = [],
      sort_by = 'created_at',
      sort_order = 'DESC'
    } = options;

    let sql = 'SELECT * FROM assets WHERE user_id = ?';
    let countSql = 'SELECT COUNT(*) as total FROM assets WHERE user_id = ?';
    const params = [userId];

    // 文件类型筛选
    if (file_type) {
      sql += ' AND file_type = ?';
      countSql += ' AND file_type = ?';
      params.push(file_type);
    }

    // 搜索条件
    if (search) {
      sql += ' AND (original_name LIKE ? OR description LIKE ? OR ai_summary LIKE ?)';
      countSql += ' AND (original_name LIKE ? OR description LIKE ? OR ai_summary LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    // 标签筛选
    if (tags.length > 0) {
      const tagConditions = tags.map(() => 'JSON_CONTAINS(tags, ?)').join(' AND ');
      sql += ` AND ${tagConditions}`;
      countSql += ` AND ${tagConditions}`;
      tags.forEach(tag => {
        params.push(JSON.stringify(tag));
      });
    }

    // 获取总数
    const [countResult] = await query(countSql, params);
    const total = countResult.total;

    // 排序和分页
    const validSortFields = ['created_at', 'updated_at', 'original_name', 'file_size', 'download_count'];
    const sortField = validSortFields.includes(sort_by) ? sort_by : 'created_at';
    const sortDirection = sort_order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    
    sql += ` ORDER BY ${sortField} ${sortDirection}`;
    
    const offset = (page - 1) * limit;
    sql += ' LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const rows = await query(sql, params);
    const assets = rows.map(row => {
      const asset = new Asset(row);
      asset.tags = JSON.parse(asset.tags || '[]');
      asset.ai_keywords = JSON.parse(asset.ai_keywords || '[]');
      return asset;
    });

    return {
      assets,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // 获取公开物料列表
  static async getPublicAssets(options = {}) {
    const {
      page = 1,
      limit = 20,
      file_type = '',
      search = '',
      sort_by = 'created_at',
      sort_order = 'DESC'
    } = options;

    let sql = 'SELECT * FROM assets WHERE is_public = TRUE';
    let countSql = 'SELECT COUNT(*) as total FROM assets WHERE is_public = TRUE';
    const params = [];

    // 文件类型筛选
    if (file_type) {
      sql += ' AND file_type = ?';
      countSql += ' AND file_type = ?';
      params.push(file_type);
    }

    // 搜索条件
    if (search) {
      sql += ' AND (original_name LIKE ? OR description LIKE ? OR ai_summary LIKE ?)';
      countSql += ' AND (original_name LIKE ? OR description LIKE ? OR ai_summary LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    // 获取总数
    const [countResult] = await query(countSql, params);
    const total = countResult.total;

    // 排序和分页
    const validSortFields = ['created_at', 'updated_at', 'original_name', 'file_size', 'download_count'];
    const sortField = validSortFields.includes(sort_by) ? sort_by : 'created_at';
    const sortDirection = sort_order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    
    sql += ` ORDER BY ${sortField} ${sortDirection}`;
    
    const offset = (page - 1) * limit;
    sql += ' LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const rows = await query(sql, params);
    const assets = rows.map(row => {
      const asset = new Asset(row);
      asset.tags = JSON.parse(asset.tags || '[]');
      asset.ai_keywords = JSON.parse(asset.ai_keywords || '[]');
      return asset;
    });

    return {
      assets,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // 更新物料信息
  async update(updateData) {
    const allowedFields = ['description', 'tags', 'is_public'];
    const updates = [];
    const values = [];

    for (const [key, value] of Object.entries(updateData)) {
      if (allowedFields.includes(key) && value !== undefined) {
        if (key === 'tags') {
          updates.push(`${key} = ?`);
          values.push(JSON.stringify(value));
        } else {
          updates.push(`${key} = ?`);
          values.push(value);
        }
      }
    }

    if (updates.length === 0) {
      throw new Error('没有可更新的字段');
    }

    values.push(this.id);
    const sql = `UPDATE assets SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    
    await query(sql, values);
    
    // 重新获取更新后的物料信息
    const updatedAsset = await Asset.findById(this.id);
    Object.assign(this, updatedAsset);
    
    return this;
  }

  // 更新AI分析结果
  async updateAIAnalysis(aiSummary, aiKeywords) {
    const sql = `
      UPDATE assets 
      SET ai_summary = ?, ai_keywords = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `;
    
    await query(sql, [aiSummary, JSON.stringify(aiKeywords), this.id]);
    
    this.ai_summary = aiSummary;
    this.ai_keywords = aiKeywords;
    
    return this;
  }

  // 增加下载次数
  async incrementDownloadCount() {
    const sql = 'UPDATE assets SET download_count = download_count + 1 WHERE id = ?';
    await query(sql, [this.id]);
    this.download_count += 1;
  }

  // 删除物料
  async delete() {
    return await transaction(async (connection) => {
      // 删除数据库记录
      await connection.execute('DELETE FROM assets WHERE id = ?', [this.id]);
      
      // 删除物理文件
      try {
        await fs.unlink(this.file_path);
      } catch (error) {
        console.warn(`删除文件失败: ${this.file_path}`, error.message);
      }
      
      return true;
    });
  }

  // 创建新版本
  async createVersion(newFileData) {
    const versionData = {
      ...newFileData,
      user_id: this.user_id,
      parent_id: this.parent_id || this.id,
      version: this.version + 1,
      description: this.description,
      tags: this.tags,
      is_public: this.is_public
    };

    return await Asset.create(versionData);
  }

  // 获取版本历史
  async getVersionHistory() {
    const parentId = this.parent_id || this.id;
    const sql = `
      SELECT * FROM assets 
      WHERE (id = ? OR parent_id = ?) 
      ORDER BY version ASC
    `;
    
    const rows = await query(sql, [parentId, parentId]);
    return rows.map(row => {
      const asset = new Asset(row);
      asset.tags = JSON.parse(asset.tags || '[]');
      asset.ai_keywords = JSON.parse(asset.ai_keywords || '[]');
      return asset;
    });
  }

  // 获取文件类型统计
  static async getFileTypeStats(userId) {
    const sql = `
      SELECT file_type, COUNT(*) as count, SUM(file_size) as total_size
      FROM assets 
      WHERE user_id = ? 
      GROUP BY file_type
      ORDER BY count DESC
    `;
    
    const rows = await query(sql, [userId]);
    return rows;
  }

  // 获取存储使用情况
  static async getStorageUsage(userId) {
    const sql = `
      SELECT 
        COUNT(*) as total_files,
        SUM(file_size) as total_size,
        AVG(file_size) as avg_size
      FROM assets 
      WHERE user_id = ?
    `;
    
    const [result] = await query(sql, [userId]);
    return result;
  }

  // 批量删除
  static async batchDelete(assetIds, userId) {
    return await transaction(async (connection) => {
      // 获取要删除的文件路径
      const [assets] = await connection.execute(
        `SELECT file_path FROM assets WHERE id IN (${assetIds.map(() => '?').join(',')}) AND user_id = ?`,
        [...assetIds, userId]
      );

      // 删除数据库记录
      await connection.execute(
        `DELETE FROM assets WHERE id IN (${assetIds.map(() => '?').join(',')}) AND user_id = ?`,
        [...assetIds, userId]
      );

      // 删除物理文件
      for (const asset of assets) {
        try {
          await fs.unlink(asset.file_path);
        } catch (error) {
          console.warn(`删除文件失败: ${asset.file_path}`, error.message);
        }
      }

      return assets.length;
    });
  }

  // 检查用户是否有访问权限
  canAccess(userId, userRole) {
    // 文件所有者可以访问
    if (this.user_id === userId) return true;
    
    // 公开文件任何人都可以访问
    if (this.is_public) return true;
    
    // 管理员可以访问所有文件
    if (userRole === 'super_admin') return true;
    
    return false;
  }

  // 转换为JSON格式
  toJSON() {
    return {
      ...this,
      tags: this.tags || [],
      ai_keywords: this.ai_keywords || []
    };
  }
}

module.exports = Asset;