const aiService = require('./aiService');
const fs = require('fs').promises;
const path = require('path');

class AIAnalysisService {
  constructor() {
    // 支持的文件类型和对应的分析策略
    this.supportedTypes = {
      image: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'],
      document: ['pdf', 'doc', 'docx', 'txt', 'md'],
      presentation: ['ppt', 'pptx'],
      spreadsheet: ['xls', 'xlsx', 'csv'],
      video: ['mp4', 'avi', 'mov', 'wmv', 'flv'],
      audio: ['mp3', 'wav', 'aac', 'ogg']
    };
  }

  /**
   * 分析文件内容并生成智能标签和描述
   * @param {Object} fileInfo - 文件信息
   * @param {string} userId - 用户ID
   * @returns {Object} 分析结果
   */
  async analyzeFile(fileInfo, userId) {
    try {
      const { originalname, mimetype, path: filePath, size } = fileInfo;
      const fileExtension = path.extname(originalname).substring(1).toLowerCase();
      const fileType = this.getFileType(fileExtension);

      const analysisResult = {
        aiGenerated: {
          description: '',
          tags: [],
          category: '',
          keywords: [],
          summary: '',
          contentType: fileType,
          confidence: 0
        },
        metadata: {
          fileSize: size,
          format: fileExtension,
          mimetype: mimetype,
          analyzedAt: new Date().toISOString()
        }
      };

      // 根据文件类型选择分析策略
      switch (fileType) {
        case 'image':
          await this.analyzeImage(fileInfo, analysisResult, userId);
          break;
        case 'document':
          await this.analyzeDocument(fileInfo, analysisResult, userId);
          break;
        case 'presentation':
          await this.analyzePresentation(fileInfo, analysisResult, userId);
          break;
        case 'spreadsheet':
          await this.analyzeSpreadsheet(fileInfo, analysisResult, userId);
          break;
        case 'video':
          await this.analyzeVideo(fileInfo, analysisResult, userId);
          break;
        case 'audio':
          await this.analyzeAudio(fileInfo, analysisResult, userId);
          break;
        default:
          await this.analyzeGeneric(fileInfo, analysisResult, userId);
      }

      return analysisResult;
    } catch (error) {
      console.error('AI分析失败:', error);
      return {
        aiGenerated: {
          description: '自动分析失败，请手动添加描述',
          tags: [],
          category: 'other',
          keywords: [],
          summary: '',
          contentType: 'unknown',
          confidence: 0
        },
        metadata: {
          error: error.message,
          analyzedAt: new Date().toISOString()
        }
      };
    }
  }

  /**
   * 分析图片内容
   */
  async analyzeImage(fileInfo, result, userId) {
    const prompt = `
请分析这个图片文件的内容和用途。文件名：${fileInfo.originalname}

请从以下角度进行分析：
1. 图片可能的内容类型（如：产品图、人物照片、图表、设计素材等）
2. 适用的业务场景（如：营销推广、产品展示、教育培训等）
3. 推荐的标签（3-8个关键词）
4. 简洁的描述（1-2句话）
5. 建议的分类

请以JSON格式返回：
{
  "description": "简洁描述",
  "tags": ["标签1", "标签2", "标签3"],
  "category": "建议分类",
  "keywords": ["关键词1", "关键词2"],
  "summary": "详细总结",
  "confidence": 0.8
}
`;

    const aiResponse = await aiService.chat(userId, [
      { role: 'system', content: '你是一个专业的图片内容分析专家，能够准确识别图片内容并提供有用的标签和描述。' },
      { role: 'user', content: prompt }
    ]);

    if (aiResponse.success) {
      try {
        const analysis = this.parseAIResponse(aiResponse.content);
        Object.assign(result.aiGenerated, analysis);
      } catch (error) {
        console.error('解析AI响应失败:', error);
        this.setFallbackAnalysis(result, fileInfo, 'image');
      }
    } else {
      this.setFallbackAnalysis(result, fileInfo, 'image');
    }
  }

  /**
   * 分析文档内容
   */
  async analyzeDocument(fileInfo, result, userId) {
    const prompt = `
请分析这个文档文件的内容和用途。文件名：${fileInfo.originalname}

基于文件名和类型，请分析：
1. 文档可能的内容类型（如：报告、模板、手册、合同等）
2. 适用的业务场景
3. 推荐的标签（3-8个关键词）
4. 简洁的描述
5. 建议的分类

请以JSON格式返回：
{
  "description": "简洁描述",
  "tags": ["标签1", "标签2", "标签3"],
  "category": "建议分类",
  "keywords": ["关键词1", "关键词2"],
  "summary": "详细总结",
  "confidence": 0.7
}
`;

    const aiResponse = await aiService.chat(userId, [
      { role: 'system', content: '你是一个专业的文档内容分析专家，能够根据文件名和类型推断文档内容并提供准确的分类和标签。' },
      { role: 'user', content: prompt }
    ]);

    if (aiResponse.success) {
      try {
        const analysis = this.parseAIResponse(aiResponse.content);
        Object.assign(result.aiGenerated, analysis);
      } catch (error) {
        console.error('解析AI响应失败:', error);
        this.setFallbackAnalysis(result, fileInfo, 'document');
      }
    } else {
      this.setFallbackAnalysis(result, fileInfo, 'document');
    }
  }

  /**
   * 分析演示文稿
   */
  async analyzePresentation(fileInfo, result, userId) {
    const prompt = `
请分析这个演示文稿文件。文件名：${fileInfo.originalname}

请分析：
1. 演示文稿可能的主题和内容
2. 适用场景（如：产品介绍、培训、汇报等）
3. 推荐标签
4. 描述和分类建议

请以JSON格式返回分析结果。
`;

    const aiResponse = await aiService.chat(userId, [
      { role: 'system', content: '你是演示文稿内容分析专家。' },
      { role: 'user', content: prompt }
    ]);

    if (aiResponse.success) {
      try {
        const analysis = this.parseAIResponse(aiResponse.content);
        Object.assign(result.aiGenerated, analysis);
      } catch (error) {
        this.setFallbackAnalysis(result, fileInfo, 'presentation');
      }
    } else {
      this.setFallbackAnalysis(result, fileInfo, 'presentation');
    }
  }

  /**
   * 分析电子表格
   */
  async analyzeSpreadsheet(fileInfo, result, userId) {
    const prompt = `
请分析这个电子表格文件。文件名：${fileInfo.originalname}

请分析可能的内容类型和用途，提供标签和分类建议。

请以JSON格式返回分析结果。
`;

    const aiResponse = await aiService.chat(userId, [
      { role: 'system', content: '你是数据表格内容分析专家。' },
      { role: 'user', content: prompt }
    ]);

    if (aiResponse.success) {
      try {
        const analysis = this.parseAIResponse(aiResponse.content);
        Object.assign(result.aiGenerated, analysis);
      } catch (error) {
        this.setFallbackAnalysis(result, fileInfo, 'spreadsheet');
      }
    } else {
      this.setFallbackAnalysis(result, fileInfo, 'spreadsheet');
    }
  }

  /**
   * 分析视频文件
   */
  async analyzeVideo(fileInfo, result, userId) {
    const prompt = `
请分析这个视频文件。文件名：${fileInfo.originalname}

基于文件名推断视频内容类型和用途，提供标签和分类建议。

请以JSON格式返回分析结果。
`;

    const aiResponse = await aiService.chat(userId, [
      { role: 'system', content: '你是视频内容分析专家。' },
      { role: 'user', content: prompt }
    ]);

    if (aiResponse.success) {
      try {
        const analysis = this.parseAIResponse(aiResponse.content);
        Object.assign(result.aiGenerated, analysis);
      } catch (error) {
        this.setFallbackAnalysis(result, fileInfo, 'video');
      }
    } else {
      this.setFallbackAnalysis(result, fileInfo, 'video');
    }
  }

  /**
   * 分析音频文件
   */
  async analyzeAudio(fileInfo, result, userId) {
    const prompt = `
请分析这个音频文件。文件名：${fileInfo.originalname}

基于文件名推断音频内容类型和用途，提供标签和分类建议。

请以JSON格式返回分析结果。
`;

    const aiResponse = await aiService.chat(userId, [
      { role: 'system', content: '你是音频内容分析专家。' },
      { role: 'user', content: prompt }
    ]);

    if (aiResponse.success) {
      try {
        const analysis = this.parseAIResponse(aiResponse.content);
        Object.assign(result.aiGenerated, analysis);
      } catch (error) {
        this.setFallbackAnalysis(result, fileInfo, 'audio');
      }
    } else {
      this.setFallbackAnalysis(result, fileInfo, 'audio');
    }
  }

  /**
   * 通用文件分析
   */
  async analyzeGeneric(fileInfo, result, userId) {
    const prompt = `
请分析这个文件。文件名：${fileInfo.originalname}，类型：${fileInfo.mimetype}

基于文件名和类型，推断文件用途并提供标签和分类建议。

请以JSON格式返回分析结果。
`;

    const aiResponse = await aiService.chat(userId, [
      { role: 'system', content: '你是文件内容分析专家。' },
      { role: 'user', content: prompt }
    ]);

    if (aiResponse.success) {
      try {
        const analysis = this.parseAIResponse(aiResponse.content);
        Object.assign(result.aiGenerated, analysis);
      } catch (error) {
        this.setFallbackAnalysis(result, fileInfo, 'other');
      }
    } else {
      this.setFallbackAnalysis(result, fileInfo, 'other');
    }
  }

  /**
   * 解析AI响应
   */
  parseAIResponse(content) {
    try {
      // 尝试提取JSON
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('无法找到JSON格式的响应');
    } catch (error) {
      throw new Error('AI响应格式错误');
    }
  }

  /**
   * 设置备用分析结果
   */
  setFallbackAnalysis(result, fileInfo, fileType) {
    const fileName = path.parse(fileInfo.originalname).name;
    
    result.aiGenerated = {
      description: `${fileType}文件：${fileName}`,
      tags: [fileType, fileName.split(/[-_\s]+/)[0]],
      category: this.getDefaultCategory(fileType),
      keywords: fileName.split(/[-_\s]+/).filter(word => word.length > 1),
      summary: `上传的${fileType}文件，文件名：${fileInfo.originalname}`,
      contentType: fileType,
      confidence: 0.3
    };
  }

  /**
   * 获取文件类型
   */
  getFileType(extension) {
    for (const [type, extensions] of Object.entries(this.supportedTypes)) {
      if (extensions.includes(extension)) {
        return type;
      }
    }
    return 'other';
  }

  /**
   * 获取默认分类
   */
  getDefaultCategory(fileType) {
    const categoryMap = {
      image: 'image',
      document: 'document',
      presentation: 'presentation',
      spreadsheet: 'analytics',
      video: 'video',
      audio: 'audio',
      other: 'other'
    };
    return categoryMap[fileType] || 'other';
  }

  /**
   * 批量分析文件
   */
  async analyzeFiles(files, userId) {
    const results = [];
    
    for (const file of files) {
      try {
        const analysis = await this.analyzeFile(file, userId);
        results.push({
          file: file.originalname,
          analysis: analysis,
          success: true
        });
      } catch (error) {
        results.push({
          file: file.originalname,
          error: error.message,
          success: false
        });
      }
    }
    
    return results;
  }

  /**
   * 生成智能摘要
   */
  async generateSummary(assets, userId) {
    if (!assets || assets.length === 0) {
      return null;
    }

    const prompt = `
请为以下物料库资产生成一个智能摘要：

${assets.map(asset => `
- ${asset.name} (${asset.type}): ${asset.description}
  标签: ${asset.tags.join(', ')}
`).join('\n')}

请生成：
1. 整体内容概览
2. 主要类型分布
3. 推荐使用场景
4. 内容特点总结

请以JSON格式返回：
{
  "overview": "整体概览",
  "typeDistribution": "类型分布",
  "recommendedScenarios": ["场景1", "场景2"],
  "characteristics": "特点总结"
}
`;

    const aiResponse = await aiService.chat(userId, [
      { role: 'system', content: '你是物料库内容分析专家，能够对资产集合进行智能分析和总结。' },
      { role: 'user', content: prompt }
    ]);

    if (aiResponse.success) {
      try {
        return this.parseAIResponse(aiResponse.content);
      } catch (error) {
        console.error('解析摘要失败:', error);
        return null;
      }
    }

    return null;
  }

  // 生成资产库摘要
  async generateSummary(assets, userId) {
    try {
      if (!assets || assets.length === 0) {
        return {
          overview: '暂无资产数据',
          statistics: {
            totalAssets: 0,
            categories: {},
            tags: {},
            recentActivity: []
          },
          insights: [],
          recommendations: []
        };
      }

      // 统计信息
      const statistics = {
        totalAssets: assets.length,
        categories: {},
        tags: {},
        fileTypes: {},
        recentActivity: []
      };

      // 分析资产分布
      assets.forEach(asset => {
        // 分类统计
        if (asset.category) {
          statistics.categories[asset.category] = (statistics.categories[asset.category] || 0) + 1;
        }

        // 标签统计
        if (asset.tags && Array.isArray(asset.tags)) {
          asset.tags.forEach(tag => {
            statistics.tags[tag] = (statistics.tags[tag] || 0) + 1;
          });
        }

        // 文件类型统计
        if (asset.metadata && asset.metadata.mimetype) {
          const fileType = this.getFileTypeFromMimetype(asset.metadata.mimetype);
          statistics.fileTypes[fileType] = (statistics.fileTypes[fileType] || 0) + 1;
        }

        // 最近活动
        if (asset.createdAt) {
          statistics.recentActivity.push({
            name: asset.name,
            action: 'uploaded',
            date: asset.createdAt
          });
        }
      });

      // 排序最近活动
      statistics.recentActivity.sort((a, b) => new Date(b.date) - new Date(a.date));
      statistics.recentActivity = statistics.recentActivity.slice(0, 10);

      // 生成AI洞察
      const prompt = `
基于以下资产库数据，生成智能分析摘要：

总资产数量：${statistics.totalAssets}
分类分布：${JSON.stringify(statistics.categories, null, 2)}
热门标签：${JSON.stringify(Object.entries(statistics.tags).sort((a, b) => b[1] - a[1]).slice(0, 10), null, 2)}
文件类型分布：${JSON.stringify(statistics.fileTypes, null, 2)}

请提供：
1. 资产库概览（2-3句话）
2. 关键洞察（3-5个要点）
3. 优化建议（3-5个建议）

请以JSON格式返回：
{
  "overview": "资产库概览文本",
  "insights": ["洞察1", "洞察2", "洞察3"],
  "recommendations": ["建议1", "建议2", "建议3"]
}
`;

      const aiResponse = await aiService.chat(userId, [
        { role: 'system', content: '你是资产管理专家，能够分析资产库数据并提供有价值的洞察和建议。' },
        { role: 'user', content: prompt }
      ]);

      let aiInsights = {
        overview: '您的资产库包含多种类型的学习材料，分布均衡，标签丰富。',
        insights: ['资产分类清晰', '标签使用规范', '文件类型多样'],
        recommendations: ['继续保持分类规范', '定期整理标签', '增加互动性内容']
      };

      if (aiResponse.success) {
        try {
          const jsonMatch = aiResponse.content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            aiInsights = { ...aiInsights, ...parsed };
          }
        } catch (error) {
          console.log('AI摘要解析失败，使用默认摘要');
        }
      }

      return {
        ...aiInsights,
        statistics,
        generatedAt: new Date().toISOString()
      };

    } catch (error) {
      console.error('生成AI摘要失败:', error);
      return {
        overview: '摘要生成失败，请稍后重试',
        statistics: {
          totalAssets: assets ? assets.length : 0,
          categories: {},
          tags: {},
          recentActivity: []
        },
        insights: [],
        recommendations: [],
        error: error.message
      };
    }
  }

  // 从MIME类型获取文件类型
  getFileTypeFromMimetype(mimetype) {
    if (mimetype.startsWith('image/')) return 'image';
    if (mimetype.startsWith('video/')) return 'video';
    if (mimetype.startsWith('audio/')) return 'audio';
    if (mimetype.includes('pdf')) return 'pdf';
    if (mimetype.includes('word') || mimetype.includes('document')) return 'document';
    if (mimetype.includes('sheet') || mimetype.includes('excel')) return 'spreadsheet';
    if (mimetype.includes('presentation') || mimetype.includes('powerpoint')) return 'presentation';
    if (mimetype.includes('text/')) return 'text';
    return 'other';
  }
}

module.exports = new AIAnalysisService();