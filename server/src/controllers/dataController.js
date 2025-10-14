const aiService = require('../services/aiService');
const aiManager = require('../services/aiManager');
const fs = require('fs').promises;
const path = require('path');
const csv = require('csv-parser');
const { createReadStream } = require('fs');

class DataController {
  // 分析文本数据
  async analyzeText(req, res) {
    try {
      const { text, analysisType = 'general', model = 'gpt-3.5-turbo' } = req.body;
      const userId = req.user.id;

      if (!text || text.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: '请提供要分析的文本内容'
        });
      }

      // 根据分析类型构建提示词
      const analysisPrompts = {
        sentiment: '请分析以下文本的情感倾向，包括正面、负面、中性的比例，并给出详细的情感分析报告：',
        keywords: '请提取以下文本的关键词和关键短语，按重要性排序，并分析其主题分布：',
        summary: '请对以下文本进行摘要总结，提取核心观点和主要信息：',
        structure: '请分析以下文本的结构和逻辑，包括段落组织、论证方式等：',
        readability: '请分析以下文本的可读性，包括语言复杂度、句式结构、词汇难度等：',
        general: '请对以下文本进行全面分析，包括内容摘要、关键信息、情感倾向、主要观点等：'
      };

      const prompt = `${analysisPrompts[analysisType] || analysisPrompts.general}\n\n文本内容：\n${text}`;

      const response = await aiManager.callAI(userId, [
        { role: 'user', content: prompt }
      ], {
        model: model,
        taskType: 'data_analysis',
        skipIntentAnalysis: true
      });

      res.json({
        success: true,
        data: {
          analysis: response.content,
          analysisType,
          textLength: text.length,
          wordCount: text.split(/\s+/).length,
          usage: response.usage || null
        }
      });

    } catch (error) {
      console.error('文本分析失败:', error);
      res.status(500).json({
        success: false,
        message: '文本分析失败',
        error: error.message
      });
    }
  }

  // 分析数据文件
  async analyzeFile(req, res) {
    try {
      const { filePath, analysisType = 'general', model = 'gpt-3.5-turbo' } = req.body;
      const userId = req.user.id;

      if (!filePath) {
        return res.status(400).json({
          success: false,
          message: '请提供文件路径'
        });
      }

      // 读取文件内容
      let fileContent = '';
      const fileExtension = path.extname(filePath).toLowerCase();

      try {
        if (fileExtension === '.csv') {
          // 处理CSV文件
          const csvData = await this.readCSVFile(filePath);
          fileContent = this.formatCSVForAnalysis(csvData);
        } else if (fileExtension === '.json') {
          // 处理JSON文件
          const jsonData = await fs.readFile(filePath, 'utf8');
          const parsedData = JSON.parse(jsonData);
          fileContent = JSON.stringify(parsedData, null, 2);
        } else if (['.txt', '.md'].includes(fileExtension)) {
          // 处理文本文件
          fileContent = await fs.readFile(filePath, 'utf8');
        } else {
          return res.status(400).json({
            success: false,
            message: '不支持的文件格式，请上传CSV、JSON、TXT或MD文件'
          });
        }
      } catch (fileError) {
        return res.status(400).json({
          success: false,
          message: '文件读取失败，请检查文件路径和格式'
        });
      }

      // 构建分析提示词
      const analysisPrompts = {
        statistical: '请对以下数据进行统计分析，包括数据分布、趋势、异常值等：',
        pattern: '请分析以下数据中的模式和规律，识别重要的数据特征：',
        correlation: '请分析以下数据中各变量之间的相关性和关联关系：',
        trend: '请分析以下数据的趋势变化和发展方向：',
        quality: '请评估以下数据的质量，包括完整性、准确性、一致性等：',
        general: '请对以下数据进行全面分析，包括基本统计信息、数据特征、趋势和洞察：'
      };

      const prompt = `${analysisPrompts[analysisType] || analysisPrompts.general}\n\n数据内容：\n${fileContent.substring(0, 8000)}`; // 限制长度避免超出token限制

      const response = await aiManager.callAI(userId, [
        { role: 'user', content: prompt }
      ], {
        model: model,
        taskType: 'data_analysis',
        skipIntentAnalysis: true
      });

      res.json({
        success: true,
        data: {
          analysis: response.content,
          analysisType,
          fileType: fileExtension,
          dataSize: fileContent.length,
          usage: response.usage || null
        }
      });

    } catch (error) {
      console.error('文件分析失败:', error);
      res.status(500).json({
        success: false,
        message: '文件分析失败',
        error: error.message
      });
    }
  }

  // 分析上传的文件
  async analyzeUploadedFile(req, res) {
    try {
      const { analysisType = 'general', model = 'gpt-3.5-turbo' } = req.body;
      const userId = req.user.id;

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: '请上传文件'
        });
      }

      const file = req.file;
      const fileExtension = path.extname(file.originalname).toLowerCase();

      // 检查文件大小（10MB限制）
      if (file.size > 10 * 1024 * 1024) {
        return res.status(400).json({
          success: false,
          message: '文件大小不能超过10MB'
        });
      }

      // 检查文件类型
      if (!['.csv', '.json', '.txt', '.md'].includes(fileExtension)) {
        return res.status(400).json({
          success: false,
          message: '不支持的文件格式，请上传CSV、JSON、TXT或MD文件'
        });
      }

      // 读取文件内容
      let fileContent = '';
      try {
        if (fileExtension === '.csv') {
          // 处理CSV文件
          const csvData = await this.readCSVFileFromBuffer(file.buffer);
          fileContent = this.formatCSVForAnalysis(csvData);
        } else if (fileExtension === '.json') {
          // 处理JSON文件
          const jsonData = file.buffer.toString('utf8');
          const parsedData = JSON.parse(jsonData);
          fileContent = JSON.stringify(parsedData, null, 2);
        } else if (['.txt', '.md'].includes(fileExtension)) {
          // 处理文本文件
          fileContent = file.buffer.toString('utf8');
        }
      } catch (parseError) {
        return res.status(400).json({
          success: false,
          message: '文件格式错误或内容无法解析'
        });
      }

      // 构建分析提示词
      const analysisPrompts = {
        statistical: '请对以下数据进行统计分析，包括数据分布、趋势、异常值等：',
        pattern: '请分析以下数据中的模式和规律，识别重要的数据特征：',
        correlation: '请分析以下数据中各变量之间的相关性和关联关系：',
        trend: '请分析以下数据的趋势变化和发展方向：',
        quality: '请评估以下数据的质量，包括完整性、准确性、一致性等：',
        general: '请对以下数据进行全面分析，包括基本统计信息、数据特征、趋势和洞察：'
      };

      const prompt = `${analysisPrompts[analysisType] || analysisPrompts.general}\n\n文件名：${file.originalname}\n数据内容：\n${fileContent.substring(0, 8000)}`; // 限制长度避免超出token限制

      const response = await aiManager.callAI(userId, [
        { role: 'user', content: prompt }
      ], {
        model: model,
        taskType: 'data_analysis',
        skipIntentAnalysis: true
      });

      res.json({
        success: true,
        data: {
          analysis: response.content,
          analysisType,
          fileName: file.originalname,
          fileType: fileExtension,
          fileSize: file.size,
          dataSize: fileContent.length,
          usage: response.usage || null
        }
      });

    } catch (error) {
      console.error('文件上传分析失败:', error);
      res.status(500).json({
        success: false,
        message: '文件上传分析失败',
        error: error.message
      });
    }
  }

  // 生成数据报告
  async generateReport(req, res) {
    try {
      const { data, reportType = 'comprehensive', model = 'gpt-3.5-turbo' } = req.body;
      const userId = req.user.id;

      if (!data) {
        return res.status(400).json({
          success: false,
          message: '请提供要生成报告的数据'
        });
      }

      const reportPrompts = {
        executive: '请基于以下数据生成执行摘要报告，重点突出关键发现和建议：',
        detailed: '请基于以下数据生成详细分析报告，包括数据描述、分析方法、结果解释和结论：',
        visual: '请基于以下数据生成可视化建议报告，推荐合适的图表类型和展示方式：',
        predictive: '请基于以下数据生成预测性分析报告，包括趋势预测和未来展望：',
        comparative: '请基于以下数据生成对比分析报告，识别差异和相似性：',
        comprehensive: '请基于以下数据生成综合分析报告，包括数据概览、深度分析、洞察和建议：'
      };

      const prompt = `${reportPrompts[reportType] || reportPrompts.comprehensive}\n\n数据信息：\n${JSON.stringify(data, null, 2)}`;

      const response = await aiManager.callAI(userId, [
        { role: 'user', content: prompt }
      ], {
        model: model,
        taskType: 'data_analysis',
        skipIntentAnalysis: true
      });

      res.json({
        success: true,
        data: {
          report: response.content,
          reportType,
          generatedAt: new Date().toISOString(),
          usage: response.usage || null
        }
      });

    } catch (error) {
      console.error('报告生成失败:', error);
      res.status(500).json({
        success: false,
        message: '报告生成失败',
        error: error.message
      });
    }
  }

  // 数据可视化建议
  async getVisualizationSuggestions(req, res) {
    try {
      const { dataDescription, dataType = 'mixed' } = req.body;
      const userId = req.user.id;

      if (!dataDescription) {
        return res.status(400).json({
          success: false,
          message: '请提供数据描述'
        });
      }

      const suggestions = {
        numerical: [
          { type: 'line', name: '折线图', description: '适合展示时间序列数据和趋势变化' },
          { type: 'bar', name: '柱状图', description: '适合比较不同类别的数值' },
          { type: 'scatter', name: '散点图', description: '适合展示两个变量之间的关系' },
          { type: 'histogram', name: '直方图', description: '适合展示数据分布' }
        ],
        categorical: [
          { type: 'pie', name: '饼图', description: '适合展示部分与整体的关系' },
          { type: 'bar', name: '条形图', description: '适合比较不同类别的数量' },
          { type: 'donut', name: '环形图', description: '适合展示层次化的分类数据' }
        ],
        temporal: [
          { type: 'line', name: '时间线图', description: '适合展示时间序列变化' },
          { type: 'area', name: '面积图', description: '适合展示累积变化' },
          { type: 'heatmap', name: '热力图', description: '适合展示时间模式' }
        ],
        geographical: [
          { type: 'map', name: '地图', description: '适合展示地理分布数据' },
          { type: 'choropleth', name: '分级统计图', description: '适合展示区域数据差异' }
        ],
        mixed: [
          { type: 'dashboard', name: '仪表板', description: '适合综合展示多种数据' },
          { type: 'combo', name: '组合图', description: '适合同时展示不同类型的数据' }
        ]
      };

      const prompt = `基于以下数据描述，请推荐最适合的数据可视化方案：\n\n${dataDescription}\n\n请考虑数据特征、目标受众和展示目的，提供具体的可视化建议。`;

      const response = await aiManager.callAI(userId, [
        { role: 'user', content: prompt }
      ], {
        taskType: 'data_analysis',
        skipIntentAnalysis: true
      });

      res.json({
        success: true,
        data: {
          aiSuggestions: response.content,
          predefinedSuggestions: suggestions[dataType] || suggestions.mixed,
          dataType
        }
      });

    } catch (error) {
      console.error('可视化建议生成失败:', error);
      res.status(500).json({
        success: false,
        message: '可视化建议生成失败',
        error: error.message
      });
    }
  }

  // 生成Markdown总结
  async generateMarkdownSummary(req, res) {
    try {
      const { 
        analysisResult, 
        textInput, 
        summaryType = 'comprehensive', 
        model = 'gpt-3.5-turbo' 
      } = req.body;
      const userId = req.user.id;

      // 确定要总结的内容
      let contentToSummarize = '';
      if (analysisResult && analysisResult.analysis) {
        contentToSummarize = analysisResult.analysis;
      } else if (textInput) {
        contentToSummarize = textInput;
      } else {
        return res.status(400).json({
          success: false,
          message: '请提供要总结的内容（分析结果或文本输入）'
        });
      }

      // 根据总结类型构建提示词
      const summaryPrompts = {
        comprehensive: '请为以下内容生成一个全面的Markdown格式总结，包括主要观点、关键信息、结论等，使用适当的标题、列表和格式：',
        executive: '请为以下内容生成一个执行摘要格式的Markdown总结，重点突出关键决策点和行动建议：',
        technical: '请为以下内容生成一个技术性的Markdown总结，重点关注技术细节、方法论和实现要点：',
        bullet: '请为以下内容生成一个要点式的Markdown总结，使用项目符号和简洁的语言：',
        structured: '请为以下内容生成一个结构化的Markdown总结，包含背景、方法、结果、结论等标准章节：'
      };

      const prompt = `${summaryPrompts[summaryType] || summaryPrompts.comprehensive}\n\n内容：\n${contentToSummarize}`;

      const response = await aiManager.callAI(userId, [
        { role: 'user', content: prompt }
      ], {
        model: model,
        taskType: 'markdown_summary',
        skipIntentAnalysis: true
      });

      res.json({
        success: true,
        data: {
          markdown: response.content,
          summaryType,
          usage: response.usage || null
        }
      });

    } catch (error) {
      console.error('Markdown总结生成失败:', error);
      res.status(500).json({
        success: false,
        message: 'Markdown总结生成失败',
        error: error.message
      });
    }
  }

  // 生成HTML网页
  async generateHtmlPage(req, res) {
    try {
      const { 
        analysisResult, 
        textInput, 
        htmlTemplate = 'modern', 
        model = 'gpt-3.5-turbo' 
      } = req.body;
      const userId = req.user.id;

      // 确定要生成网页的内容
      let contentToConvert = '';
      if (analysisResult && analysisResult.analysis) {
        contentToConvert = analysisResult.analysis;
      } else if (textInput) {
        contentToConvert = textInput;
      } else {
        return res.status(400).json({
          success: false,
          message: '请提供要转换为网页的内容（分析结果或文本输入）'
        });
      }

      // 根据模板类型构建提示词
      const templatePrompts = {
        modern: '请将以下内容转换为现代风格的HTML网页，使用响应式设计、现代CSS样式、渐变背景和卡片布局：',
        classic: '请将以下内容转换为经典风格的HTML网页，使用传统的布局、简洁的样式和专业的外观：',
        minimal: '请将以下内容转换为极简风格的HTML网页，使用最少的样式、大量留白和清晰的排版：',
        dashboard: '请将以下内容转换为仪表板风格的HTML网页，使用数据可视化元素、统计卡片和现代界面：',
        report: '请将以下内容转换为报告风格的HTML网页，使用正式的布局、章节分割和专业的格式：',
        analytics: '请将以下内容转换为数据分析专用的HTML网页，要求包含以下特性：\n- 集成Chart.js图表库用于数据可视化\n- 使用炫酷的现代设计风格（深色主题、渐变背景、霓虹效果）\n- 包含动画效果和交互元素\n- 数据展示清晰明显，使用大字体和对比色\n- 添加统计卡片和仪表板元素\n- 响应式设计适配各种设备\n- 使用现代字体（如Inter、Roboto）\n- 添加悬停效果和过渡动画\n- 包含数据洞察和关键指标突出显示'
      };

      let prompt;
      
      if (htmlTemplate === 'analytics') {
        prompt = `${templatePrompts.analytics}

特殊要求：
1. 必须包含Chart.js CDN链接：<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
2. 生成完整的HTML文档，包含DOCTYPE、head和body标签
3. 使用深色主题（#1a1a1a, #2d2d2d）配合霓虹色彩（#00ff88, #ff6b6b, #4ecdc4, #45b7d1）
4. 自动解析内容中的数据并生成相应的图表：
   - 数值对比：使用柱状图或条形图
   - 占比数据：使用饼图或环形图
   - 趋势数据：使用折线图或面积图
   - 多维数据：使用雷达图或散点图
5. 添加渐变背景：linear-gradient(135deg, #667eea 0%, #764ba2 100%)
6. 统计卡片样式：玻璃拟态效果，包含图标、数值、变化趋势
7. 图表配置要求：
   - 启用动画效果（animation: {duration: 2000}）
   - 使用渐变色填充
   - 添加悬停交互效果
   - 响应式设计
8. CSS动画：淡入效果、数字滚动动画、悬停放大效果
9. 字体：使用Google Fonts的Inter或Poppins
10. 布局：网格布局，统计卡片+图表区域+数据表格
11. 添加适当的meta标签和标题

内容：
${contentToConvert}

请根据内容中的数据自动生成相应的图表代码，如果内容包含数值数据，请创建对应的Chart.js图表。`;
      } else {
        prompt = `${templatePrompts[htmlTemplate] || templatePrompts.modern}

要求：
1. 生成完整的HTML文档，包含DOCTYPE、head和body标签
2. 内联CSS样式，确保网页可以独立运行
3. 使用语义化的HTML标签
4. 确保内容结构清晰、易读
5. 添加适当的meta标签和标题

内容：
${contentToConvert}`;
      }

      const response = await aiManager.callAI(userId, [
        { role: 'user', content: prompt }
      ], {
        model: model,
        taskType: 'html_generation',
        skipIntentAnalysis: true
      });

      res.json({
        success: true,
        data: {
          html: response.content,
          htmlTemplate,
          usage: response.usage || null
        }
      });

    } catch (error) {
      console.error('HTML网页生成失败:', error);
      res.status(500).json({
        success: false,
        message: 'HTML网页生成失败',
        error: error.message
      });
    }
  }

  // 辅助方法：读取CSV文件
  async readCSVFile(filePath) {
    return new Promise((resolve, reject) => {
      const results = [];
      createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => resolve(results))
        .on('error', reject);
    });
  }

  // 辅助方法：从buffer读取CSV文件
  async readCSVFileFromBuffer(buffer) {
    return new Promise((resolve, reject) => {
      const results = [];
      const { Readable } = require('stream');
      
      const stream = new Readable();
      stream.push(buffer);
      stream.push(null);
      
      stream
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => resolve(results))
        .on('error', reject);
    });
  }

  // 辅助方法：格式化CSV数据用于分析
  formatCSVForAnalysis(csvData) {
    if (csvData.length === 0) return '空数据集';
    
    const headers = Object.keys(csvData[0]);
    const sampleSize = Math.min(csvData.length, 10); // 只取前10行作为样本
    
    let formatted = `数据集信息：\n`;
    formatted += `- 总行数: ${csvData.length}\n`;
    formatted += `- 列数: ${headers.length}\n`;
    formatted += `- 列名: ${headers.join(', ')}\n\n`;
    formatted += `数据样本（前${sampleSize}行）：\n`;
    
    for (let i = 0; i < sampleSize; i++) {
      formatted += `第${i + 1}行: ${JSON.stringify(csvData[i])}\n`;
    }
    
    return formatted;
  }
}

module.exports = new DataController();