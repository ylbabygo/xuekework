const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');
const { callAI } = require('../services/aiService');
const aiManager = require('../services/aiManager');
const aiAnalysisService = require('../services/aiAnalysisService');
const { getFileType, getFileCategory } = require('../middleware/upload');

// 模拟数据存储（实际项目中应使用数据库）
let assets = [
  {
    id: '1',
    name: '产品介绍PPT模板',
    description: '用于产品介绍的专业PPT模板，包含多种布局和设计元素',
    type: 'template',
    category: 'presentation',
    tags: ['PPT', '模板', '产品介绍', '商务'],
    fileUrl: '/assets/templates/product-intro.pptx',
    thumbnailUrl: '/assets/thumbnails/product-intro.jpg',
    fileSize: 2048000,
    format: 'pptx',
    createdAt: new Date('2024-01-15').toISOString(),
    updatedAt: new Date('2024-01-15').toISOString(),
    createdBy: 'admin',
    downloadCount: 25,
    rating: 4.5,
    isPublic: true,
    metadata: {
      dimensions: '1920x1080',
      slides: 15,
      theme: 'business'
    }
  },
  {
    id: '2',
    name: '品牌Logo设计',
    description: '公司品牌Logo的矢量设计文件，包含多种格式和颜色变体',
    type: 'design',
    category: 'branding',
    tags: ['Logo', '品牌', '设计', '矢量'],
    fileUrl: '/assets/designs/brand-logo.ai',
    thumbnailUrl: '/assets/thumbnails/brand-logo.jpg',
    fileSize: 512000,
    format: 'ai',
    createdAt: new Date('2024-01-10').toISOString(),
    updatedAt: new Date('2024-01-20').toISOString(),
    createdBy: 'designer',
    downloadCount: 45,
    rating: 4.8,
    isPublic: true,
    metadata: {
      dimensions: '1000x1000',
      colorMode: 'CMYK',
      version: 'CC 2023'
    }
  },
  {
    id: '3',
    name: '营销文案模板',
    description: '多种营销场景的文案模板集合，包含邮件、社交媒体、广告等',
    type: 'document',
    category: 'marketing',
    tags: ['文案', '营销', '模板', '邮件'],
    fileUrl: '/assets/documents/marketing-copy.docx',
    thumbnailUrl: '/assets/thumbnails/marketing-copy.jpg',
    fileSize: 128000,
    format: 'docx',
    createdAt: new Date('2024-01-12').toISOString(),
    updatedAt: new Date('2024-01-18').toISOString(),
    createdBy: 'copywriter',
    downloadCount: 38,
    rating: 4.3,
    isPublic: true,
    metadata: {
      pages: 12,
      wordCount: 3500,
      language: 'zh-CN'
    }
  },
  {
    id: '4',
    name: '数据分析图表',
    description: '常用的数据可视化图表模板，支持Excel和PowerBI格式',
    type: 'template',
    category: 'analytics',
    tags: ['图表', '数据', '可视化', 'Excel'],
    fileUrl: '/assets/templates/data-charts.xlsx',
    thumbnailUrl: '/assets/thumbnails/data-charts.jpg',
    fileSize: 256000,
    format: 'xlsx',
    createdAt: new Date('2024-01-08').toISOString(),
    updatedAt: new Date('2024-01-22').toISOString(),
    createdBy: 'analyst',
    downloadCount: 32,
    rating: 4.6,
    isPublic: true,
    metadata: {
      sheets: 8,
      chartTypes: ['bar', 'line', 'pie', 'scatter'],
      compatibility: 'Excel 2016+'
    }
  },
  {
    id: '5',
    name: '产品宣传视频',
    description: '产品功能演示和宣传视频，高清MP4格式',
    type: 'media',
    category: 'video',
    tags: ['视频', '产品', '宣传', '演示'],
    fileUrl: '/assets/media/product-demo.mp4',
    thumbnailUrl: '/assets/thumbnails/product-demo.jpg',
    fileSize: 52428800,
    format: 'mp4',
    createdAt: new Date('2024-01-05').toISOString(),
    updatedAt: new Date('2024-01-25').toISOString(),
    createdBy: 'videographer',
    downloadCount: 18,
    rating: 4.7,
    isPublic: false,
    metadata: {
      duration: '2:35',
      resolution: '1920x1080',
      frameRate: '30fps',
      codec: 'H.264'
    }
  }
];

let categories = [
  { id: 'presentation', name: '演示文稿', description: 'PPT模板和演示文件' },
  { id: 'branding', name: '品牌设计', description: 'Logo、VI设计等品牌相关素材' },
  { id: 'marketing', name: '营销素材', description: '营销文案、广告素材等' },
  { id: 'analytics', name: '数据分析', description: '图表模板、数据可视化素材' },
  { id: 'video', name: '视频素材', description: '宣传视频、演示视频等' },
  { id: 'document', name: '文档模板', description: '各类文档模板和范本' },
  { id: 'image', name: '图片素材', description: '图片、插图、图标等' },
  { id: 'audio', name: '音频素材', description: '背景音乐、音效等' }
];

// 获取所有物料
const getAssets = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      type,
      tags,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      isPublic
    } = req.query;

    let filteredAssets = [...assets];

    // 过滤条件
    if (category) {
      filteredAssets = filteredAssets.filter(asset => asset.category === category);
    }

    if (type) {
      filteredAssets = filteredAssets.filter(asset => asset.type === type);
    }

    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim().toLowerCase());
      filteredAssets = filteredAssets.filter(asset =>
        asset.tags.some(tag => tagArray.includes(tag.toLowerCase()))
      );
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filteredAssets = filteredAssets.filter(asset =>
        asset.name.toLowerCase().includes(searchLower) ||
        asset.description.toLowerCase().includes(searchLower) ||
        asset.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    if (isPublic !== undefined) {
      filteredAssets = filteredAssets.filter(asset => asset.isPublic === (isPublic === 'true'));
    }

    // 排序
    filteredAssets.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (sortOrder === 'desc') {
        return bValue > aValue ? 1 : -1;
      } else {
        return aValue > bValue ? 1 : -1;
      }
    });

    // 分页
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedAssets = filteredAssets.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        assets: paginatedAssets,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(filteredAssets.length / limit),
          totalItems: filteredAssets.length,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('获取物料列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取物料列表失败',
      error: error.message
    });
  }
};

// 获取单个物料详情
const getAssetById = async (req, res) => {
  try {
    const { id } = req.params;
    const asset = assets.find(a => a.id === id);

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: '物料不存在'
      });
    }

    res.json({
      success: true,
      data: asset
    });
  } catch (error) {
    console.error('获取物料详情失败:', error);
    res.status(500).json({
      success: false,
      message: '获取物料详情失败',
      error: error.message
    });
  }
};

// 添加新物料
const addAsset = async (req, res) => {
  try {
    const {
      name,
      description,
      type,
      category,
      tags = [],
      fileUrl,
      thumbnailUrl,
      fileSize,
      format,
      isPublic = true,
      metadata = {}
    } = req.body;

    if (!name || !type || !category) {
      return res.status(400).json({
        success: false,
        message: '请提供必要的物料信息'
      });
    }

    const newAsset = {
      id: uuidv4(),
      name,
      description: description || '',
      type,
      category,
      tags: Array.isArray(tags) ? tags : [],
      fileUrl: fileUrl || '',
      thumbnailUrl: thumbnailUrl || '',
      fileSize: fileSize || 0,
      format: format || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: req.user.username,
      downloadCount: 0,
      rating: 0,
      isPublic,
      metadata
    };

    assets.push(newAsset);

    res.status(201).json({
      success: true,
      message: '物料添加成功',
      data: newAsset
    });
  } catch (error) {
    console.error('添加物料失败:', error);
    res.status(500).json({
      success: false,
      message: '添加物料失败',
      error: error.message
    });
  }
};

// 更新物料
const updateAsset = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const assetIndex = assets.findIndex(a => a.id === id);
    if (assetIndex === -1) {
      return res.status(404).json({
        success: false,
        message: '物料不存在'
      });
    }

    // 更新物料信息
    assets[assetIndex] = {
      ...assets[assetIndex],
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    res.json({
      success: true,
      message: '物料更新成功',
      data: assets[assetIndex]
    });
  } catch (error) {
    console.error('更新物料失败:', error);
    res.status(500).json({
      success: false,
      message: '更新物料失败',
      error: error.message
    });
  }
};

// 删除物料
const deleteAsset = async (req, res) => {
  try {
    const { id } = req.params;

    const assetIndex = assets.findIndex(a => a.id === id);
    if (assetIndex === -1) {
      return res.status(404).json({
        success: false,
        message: '物料不存在'
      });
    }

    assets.splice(assetIndex, 1);

    res.json({
      success: true,
      message: '物料删除成功'
    });
  } catch (error) {
    console.error('删除物料失败:', error);
    res.status(500).json({
      success: false,
      message: '删除物料失败',
      error: error.message
    });
  }
};

// 获取分类列表
const getCategories = async (req, res) => {
  try {
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('获取分类列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取分类列表失败',
      error: error.message
    });
  }
};

// 下载物料
const downloadAsset = async (req, res) => {
  try {
    const { id } = req.params;
    const asset = assets.find(a => a.id === id);

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: '物料不存在'
      });
    }

    // 增加下载次数
    asset.downloadCount += 1;
    asset.updatedAt = new Date().toISOString();

    res.json({
      success: true,
      message: '下载链接获取成功',
      data: {
        downloadUrl: asset.fileUrl,
        fileName: asset.name,
        fileSize: asset.fileSize
      }
    });
  } catch (error) {
    console.error('下载物料失败:', error);
    res.status(500).json({
      success: false,
      message: '下载物料失败',
      error: error.message
    });
  }
};

// 物料评分
const rateAsset = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: '评分必须在1-5之间'
      });
    }

    const asset = assets.find(a => a.id === id);
    if (!asset) {
      return res.status(404).json({
        success: false,
        message: '物料不存在'
      });
    }

    // 简单的评分更新（实际项目中应该记录每个用户的评分）
    asset.rating = ((asset.rating * asset.downloadCount) + rating) / (asset.downloadCount + 1);
    asset.updatedAt = new Date().toISOString();

    res.json({
      success: true,
      message: '评分成功',
      data: {
        rating: asset.rating
      }
    });
  } catch (error) {
    console.error('物料评分失败:', error);
    res.status(500).json({
      success: false,
      message: '物料评分失败',
      error: error.message
    });
  }
};

// AI生成物料描述
const generateDescription = async (req, res) => {
  try {
    const { name, type, category, tags = [] } = req.body;
    const userId = req.user.id;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: '请提供物料名称'
      });
    }

    const prompt = `请为以下物料生成一个专业、详细的描述：

物料名称：${name}
物料类型：${type || '未指定'}
分类：${category || '未指定'}
标签：${tags.join(', ') || '无'}

要求：
1. 描述要专业、准确，突出物料的特点和用途
2. 长度控制在50-150字之间
3. 使用中文
4. 突出物料的价值和适用场景

请直接返回描述内容，不需要其他说明。`;

    // 使用AI管理器调用AI服务
    const response = await aiManager.callAI(userId, [
      { role: 'system', content: '你是专业的物料描述生成专家，能够根据物料信息生成准确、专业的描述。' },
      { role: 'user', content: prompt }
    ], {
      taskType: 'content_generation'
    });

    res.json({
      success: true,
      data: {
        description: response.content.trim()
      }
    });
  } catch (error) {
    console.error('生成物料描述失败:', error);
    res.status(500).json({
      success: false,
      message: '生成物料描述失败',
      error: error.message
    });
  }
};

// 获取推荐标签
const getRecommendedTags = async (req, res) => {
  try {
    const { name, type, category } = req.query;

    // 基于现有物料提取常用标签
    const allTags = assets.reduce((tags, asset) => {
      return tags.concat(asset.tags);
    }, []);

    const tagCounts = allTags.reduce((counts, tag) => {
      counts[tag] = (counts[tag] || 0) + 1;
      return counts;
    }, {});

    let recommendedTags = Object.keys(tagCounts)
      .sort((a, b) => tagCounts[b] - tagCounts[a])
      .slice(0, 20);

    // 如果提供了类型或分类，过滤相关标签
    if (type || category) {
      const relatedAssets = assets.filter(asset => 
        (type && asset.type === type) || (category && asset.category === category)
      );
      
      const relatedTags = relatedAssets.reduce((tags, asset) => {
        return tags.concat(asset.tags);
      }, []);

      const relatedTagCounts = relatedTags.reduce((counts, tag) => {
        counts[tag] = (counts[tag] || 0) + 1;
        return counts;
      }, {});

      recommendedTags = Object.keys(relatedTagCounts)
        .sort((a, b) => relatedTagCounts[b] - relatedTagCounts[a])
        .slice(0, 10);
    }

    res.json({
      success: true,
      data: {
        tags: recommendedTags
      }
    });
  } catch (error) {
    console.error('获取推荐标签失败:', error);
    res.status(500).json({
      success: false,
      message: '获取推荐标签失败',
      error: error.message
    });
  }
};

// 获取物料统计信息
const getAssetStats = async (req, res) => {
  try {
    const totalAssets = assets.length;
    const publicAssets = assets.filter(asset => asset.isPublic).length;
    const privateAssets = totalAssets - publicAssets;
    
    const assetsByType = assets.reduce((stats, asset) => {
      stats[asset.type] = (stats[asset.type] || 0) + 1;
      return stats;
    }, {});

    const assetsByCategory = assets.reduce((stats, asset) => {
      stats[asset.category] = (stats[asset.category] || 0) + 1;
      return stats;
    }, {});

    const totalDownloads = assets.reduce((total, asset) => total + asset.downloadCount, 0);
    const averageRating = assets.reduce((total, asset) => total + asset.rating, 0) / totalAssets;

    const recentAssets = assets
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map(asset => ({
        id: asset.id,
        name: asset.name,
        type: asset.type,
        createdAt: asset.createdAt,
        downloadCount: asset.downloadCount
      }));

    res.json({
      success: true,
      data: {
        totalAssets,
        publicAssets,
        privateAssets,
        assetsByType,
        assetsByCategory,
        totalDownloads,
        averageRating: Math.round(averageRating * 10) / 10,
        recentAssets
      }
    });
  } catch (error) {
    console.error('获取物料统计失败:', error);
    res.status(500).json({
      success: false,
      message: '获取物料统计失败',
      error: error.message
    });
  }
};

// 上传物料文件
const uploadAsset = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: '请选择要上传的文件'
      });
    }

    const uploadedAssets = [];
    const userId = req.user.id;

    for (const file of req.files) {
      const {
        description = '',
        tags = '[]',
        isPublic = 'true',
        enableAIAnalysis = 'true'
      } = req.body;

      // 解析标签
      let parsedTags = [];
      try {
        parsedTags = JSON.parse(tags);
      } catch (e) {
        parsedTags = [];
      }

      // 获取文件信息
      const fileType = getFileType(file.mimetype);
      const category = getFileCategory(file.mimetype, file.originalname);
      const fileUrl = `/uploads/assets/${file.filename}`;

      // AI自动分析
      let aiAnalysis = null;
      let finalDescription = description;
      let finalTags = parsedTags;
      let finalCategory = category;

      if (enableAIAnalysis === 'true') {
        try {
          console.log(`开始AI分析文件: ${file.originalname}`);
          aiAnalysis = await aiAnalysisService.analyzeFile(file, userId);
          
          // 如果没有手动提供描述，使用AI生成的描述
          if (!description && aiAnalysis.aiGenerated.description) {
            finalDescription = aiAnalysis.aiGenerated.description;
          }
          
          // 合并AI生成的标签和手动标签
          if (aiAnalysis.aiGenerated.tags && aiAnalysis.aiGenerated.tags.length > 0) {
            const aiTags = aiAnalysis.aiGenerated.tags;
            finalTags = [...new Set([...parsedTags, ...aiTags])]; // 去重合并
          }
          
          // 如果AI建议了更合适的分类，使用AI分类
          if (aiAnalysis.aiGenerated.category && aiAnalysis.aiGenerated.confidence > 0.6) {
            finalCategory = aiAnalysis.aiGenerated.category;
          }
          
          console.log(`AI分析完成: ${file.originalname}, 置信度: ${aiAnalysis.aiGenerated.confidence}`);
        } catch (error) {
          console.error('AI分析失败:', error);
          aiAnalysis = {
            error: error.message,
            analyzedAt: new Date().toISOString()
          };
        }
      }

      // 创建新物料记录
      const newAsset = {
        id: uuidv4(),
        name: file.originalname,
        description: finalDescription || `上传的${fileType}文件`,
        type: fileType,
        category: finalCategory,
        tags: finalTags,
        fileUrl: fileUrl,
        thumbnailUrl: fileType === 'image' ? fileUrl : '/assets/thumbnails/default.jpg',
        fileSize: file.size,
        format: path.extname(file.originalname).substring(1).toLowerCase(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: req.user.username,
        downloadCount: 0,
        rating: 0,
        isPublic: isPublic === 'true',
        metadata: {
          originalName: file.originalname,
          mimetype: file.mimetype,
          uploadPath: file.path,
          aiAnalysis: aiAnalysis // 保存AI分析结果
        }
      };

      assets.push(newAsset);
      uploadedAssets.push(newAsset);
    }

    res.status(201).json({
      success: true,
      message: `成功上传 ${uploadedAssets.length} 个文件`,
      data: uploadedAssets,
      aiAnalysisEnabled: req.body.enableAIAnalysis === 'true'
    });

  } catch (error) {
    console.error('文件上传失败:', error);
    res.status(500).json({
      success: false,
      message: '文件上传失败',
      error: error.message
    });
  }
};

// AI重新分析资产
const reanalyzeAsset = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // 查找资产
    const asset = assets.find(a => a.id === id);
    if (!asset) {
      return res.status(404).json({
        success: false,
        message: '资产不存在'
      });
    }

    // 检查权限（只有创建者可以重新分析）
    if (asset.createdBy !== req.user.username) {
      return res.status(403).json({
        success: false,
        message: '无权限操作此资产'
      });
    }

    // 构造文件信息用于AI分析
    const fileInfo = {
      originalname: asset.metadata.originalName,
      mimetype: asset.metadata.mimetype,
      size: asset.fileSize,
      path: asset.metadata.uploadPath
    };

    // 执行AI分析
    const aiAnalysis = await aiAnalysisService.analyzeFile(fileInfo, userId);

    // 更新资产信息
    if (aiAnalysis.aiGenerated.description) {
      asset.description = aiAnalysis.aiGenerated.description;
    }
    
    if (aiAnalysis.aiGenerated.tags && aiAnalysis.aiGenerated.tags.length > 0) {
      // 保留原有标签，合并AI标签
      asset.tags = [...new Set([...asset.tags, ...aiAnalysis.aiGenerated.tags])];
    }
    
    if (aiAnalysis.aiGenerated.category && aiAnalysis.aiGenerated.confidence > 0.6) {
      asset.category = aiAnalysis.aiGenerated.category;
    }

    asset.metadata.aiAnalysis = aiAnalysis;
    asset.updatedAt = new Date().toISOString();

    res.json({
      success: true,
      message: 'AI重新分析完成',
      data: asset
    });

  } catch (error) {
    console.error('AI重新分析失败:', error);
    res.status(500).json({
      success: false,
      message: 'AI重新分析失败',
      error: error.message
    });
  }
};

// 批量AI分析
const batchAnalyzeAssets = async (req, res) => {
  try {
    const { assetIds } = req.body;
    const userId = req.user.id;

    if (!assetIds || !Array.isArray(assetIds)) {
      return res.status(400).json({
        success: false,
        message: '请提供要分析的资产ID列表'
      });
    }

    const results = [];

    for (const assetId of assetIds) {
      const asset = assets.find(a => a.id === assetId);
      if (!asset) {
        results.push({
          assetId,
          success: false,
          error: '资产不存在'
        });
        continue;
      }

      // 检查权限
      if (asset.createdBy !== req.user.username) {
        results.push({
          assetId,
          success: false,
          error: '无权限操作此资产'
        });
        continue;
      }

      try {
        const fileInfo = {
          originalname: asset.metadata.originalName,
          mimetype: asset.metadata.mimetype,
          size: asset.fileSize,
          path: asset.metadata.uploadPath
        };

        const aiAnalysis = await aiAnalysisService.analyzeFile(fileInfo, userId);
        
        // 更新资产
        if (aiAnalysis.aiGenerated.description) {
          asset.description = aiAnalysis.aiGenerated.description;
        }
        
        if (aiAnalysis.aiGenerated.tags && aiAnalysis.aiGenerated.tags.length > 0) {
          asset.tags = [...new Set([...asset.tags, ...aiAnalysis.aiGenerated.tags])];
        }
        
        if (aiAnalysis.aiGenerated.category && aiAnalysis.aiGenerated.confidence > 0.6) {
          asset.category = aiAnalysis.aiGenerated.category;
        }

        asset.metadata.aiAnalysis = aiAnalysis;
        asset.updatedAt = new Date().toISOString();

        results.push({
          assetId,
          success: true,
          analysis: aiAnalysis
        });

      } catch (error) {
        results.push({
          assetId,
          success: false,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      message: `批量分析完成，成功: ${results.filter(r => r.success).length}，失败: ${results.filter(r => !r.success).length}`,
      data: results
    });

  } catch (error) {
    console.error('批量AI分析失败:', error);
    res.status(500).json({
      success: false,
      message: '批量AI分析失败',
      error: error.message
    });
  }
};

// 获取AI分析摘要
const getAISummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const { category, limit = 50 } = req.query;

    // 筛选资产
    let filteredAssets = assets;
    if (category && category !== 'all') {
      filteredAssets = assets.filter(asset => asset.category === category);
    }

    // 限制数量
    filteredAssets = filteredAssets.slice(0, parseInt(limit));

    // 生成AI摘要
    const summary = await aiAnalysisService.generateSummary(filteredAssets, userId);

    res.json({
      success: true,
      data: {
        summary,
        assetCount: filteredAssets.length,
        category: category || 'all'
      }
    });

  } catch (error) {
    console.error('获取AI摘要失败:', error);
    res.status(500).json({
      success: false,
      message: '获取AI摘要失败',
      error: error.message
    });
  }
};

// 智能标签建议
const getSmartTagSuggestions = async (req, res) => {
  try {
    const { fileName, fileType, description } = req.body;
    const userId = req.user.id;

    if (!fileName) {
      return res.status(400).json({
        success: false,
        message: '请提供文件名'
      });
    }

    const prompt = `
基于以下信息，为文件推荐5-8个相关标签：

文件名：${fileName}
文件类型：${fileType || '未知'}
描述：${description || '无'}

请推荐准确、有用的标签，包括：
1. 内容类型标签
2. 用途场景标签  
3. 行业相关标签
4. 格式特征标签

请以JSON数组格式返回：["标签1", "标签2", "标签3", ...]
`;

    const aiResponse = await aiManager.callAI(userId, [
      { role: 'system', content: '你是标签推荐专家，能够为文件推荐准确有用的标签。' },
      { role: 'user', content: prompt }
    ], {
      taskType: 'content_generation'
    });

    if (aiResponse.success) {
      try {
        const tagsMatch = aiResponse.content.match(/\[[\s\S]*?\]/);
        if (tagsMatch) {
          const suggestedTags = JSON.parse(tagsMatch[0]);
          res.json({
            success: true,
            data: {
              suggestedTags,
              confidence: 0.8
            }
          });
        } else {
          throw new Error('无法解析标签建议');
        }
      } catch (error) {
        res.status(400).json({
          success: false,
          message: '标签建议解析失败'
        });
      }
    } else {
      res.status(500).json({
        success: false,
        message: 'AI服务暂时不可用'
      });
    }

  } catch (error) {
    console.error('获取智能标签建议失败:', error);
    res.status(500).json({
      success: false,
      message: '获取智能标签建议失败',
      error: error.message
    });
  }
};

module.exports = {
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
};