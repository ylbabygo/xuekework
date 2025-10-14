const axios = require('axios');

class AIService {
  constructor() {
    this.providers = {
      openai: {
        baseURL: 'https://api.openai.com/v1',
        models: ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo']
      },
      claude: {
        baseURL: 'https://api.anthropic.com/v1',
        models: ['claude-3-haiku', 'claude-3-sonnet', 'claude-3-opus']
      },
      gemini: {
        baseURL: 'https://generativelanguage.googleapis.com/v1beta',
        models: ['gemini-pro', 'gemini-pro-vision']
      },
      baidu: {
        baseURL: 'https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat',
        models: ['ernie-bot', 'ernie-bot-turbo']
      },
      deepseek: {
        baseURL: 'https://api.deepseek.com/v1',
        models: ['deepseek-chat', 'deepseek-coder']
      },
      kimi: {
        baseURL: 'https://api.moonshot.cn/v1',
        models: ['moonshot-v1-8k', 'moonshot-v1-32k', 'moonshot-v1-128k']
      },
      zhipu: {
        baseURL: 'https://open.bigmodel.cn/api/paas/v4',
        models: ['glm-4', 'glm-3-turbo']
      }
    };
  }

  // 获取用户的API密钥
  async getUserApiKeys(userId) {
    const { query } = require('../config/database');
    const sql = 'SELECT api_keys FROM user_settings WHERE user_id = ?';
    const rows = await query(sql, [userId]);
    
    if (rows.length === 0) {
      return null;
    }
    
    const apiKeys = rows[0].api_keys;
    return apiKeys ? (typeof apiKeys === 'string' ? JSON.parse(apiKeys) : apiKeys) : null;
  }

  // 发送消息到OpenAI
  async sendToOpenAI(messages, model = 'gpt-3.5-turbo', apiKey, options = {}) {
    try {
      const response = await axios.post(
        `${this.providers.openai.baseURL}/chat/completions`,
        {
          model,
          messages,
          max_tokens: options.max_tokens || 2000,
          temperature: options.temperature || 0.7,
          stream: false
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      return {
        success: true,
        content: response.data.choices[0].message.content,
        tokens: response.data.usage.total_tokens,
        model: response.data.model
      };
    } catch (error) {
      console.error('OpenAI API错误:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message
      };
    }
  }

  // 发送消息到Claude
  async sendToClaude(messages, model = 'claude-3-haiku', apiKey, options = {}) {
    try {
      const response = await axios.post(
        `${this.providers.claude.baseURL}/messages`,
        {
          model,
          max_tokens: options.max_tokens || 2000,
          temperature: options.temperature || 0.7,
          messages: messages.filter(msg => msg.role !== 'system'),
          system: messages.find(msg => msg.role === 'system')?.content || ''
        },
        {
          headers: {
            'x-api-key': apiKey,
            'Content-Type': 'application/json',
            'anthropic-version': '2023-06-01'
          },
          timeout: 30000
        }
      );

      return {
        success: true,
        content: response.data.content[0].text,
        tokens: response.data.usage.input_tokens + response.data.usage.output_tokens,
        model: response.data.model
      };
    } catch (error) {
      console.error('Claude API错误:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message
      };
    }
  }

  // 发送消息到Gemini
  async sendToGemini(messages, model = 'gemini-pro', apiKey, options = {}) {
    try {
      // 转换消息格式为Gemini格式
      const contents = [];
      let systemInstruction = '';
      
      for (const message of messages) {
        if (message.role === 'system') {
          systemInstruction = message.content;
        } else {
          contents.push({
            role: message.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: message.content }]
          });
        }
      }

      const requestBody = {
        contents,
        generationConfig: {
          temperature: options.temperature || 0.7,
          maxOutputTokens: options.max_tokens || 2000
        }
      };

      if (systemInstruction) {
        requestBody.systemInstruction = {
          parts: [{ text: systemInstruction }]
        };
      }

      const response = await axios.post(
        `${this.providers.gemini.baseURL}/models/${model}:generateContent?key=${apiKey}`,
        requestBody,
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      return {
        success: true,
        content: response.data.candidates[0].content.parts[0].text,
        tokens: response.data.usageMetadata?.totalTokenCount || 0,
        model: model
      };
    } catch (error) {
      console.error('Gemini API错误:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message
      };
    }
  }

  // 发送消息到智谱AI
  async sendToZhipu(messages, model = 'glm-4', apiKey, options = {}) {
    try {
      const response = await axios.post(
        `${this.providers.zhipu.baseURL}/chat/completions`,
        {
          model,
          messages,
          max_tokens: options.max_tokens || 2000,
          temperature: options.temperature || 0.7,
          stream: false
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      return {
        success: true,
        content: response.data.choices[0].message.content,
        tokens: response.data.usage.total_tokens,
        model: response.data.model
      };
    } catch (error) {
      console.error('智谱AI API错误:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message
      };
    }
  }

  // 发送消息到百度文心一言
  async sendToBaidu(messages, model = 'ernie-bot', apiKey, secretKey, options = {}) {
    try {
      // 首先获取access_token
      const tokenResponse = await axios.post(
        `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${apiKey}&client_secret=${secretKey}`
      );
      
      const accessToken = tokenResponse.data.access_token;
      
      // 转换消息格式
      const baiduMessages = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await axios.post(
        `${this.providers.baidu.baseURL}/${model}?access_token=${accessToken}`,
        {
          messages: baiduMessages,
          temperature: options.temperature || 0.7,
          top_p: options.top_p || 0.8,
          penalty_score: options.penalty_score || 1.0
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      return {
        success: true,
        content: response.data.result,
        tokens: response.data.usage?.total_tokens || 0,
        model: model
      };
    } catch (error) {
      console.error('百度API错误:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error_msg || error.message
      };
    }
  }

  // 发送消息到DeepSeek
  async sendToDeepSeek(messages, model = 'deepseek-chat', apiKey, options = {}) {
    try {
      const response = await axios.post(
        `${this.providers.deepseek.baseURL}/chat/completions`,
        {
          model,
          messages,
          max_tokens: options.max_tokens || 2000,
          temperature: options.temperature || 0.7,
          stream: false
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      return {
        success: true,
        content: response.data.choices[0].message.content,
        tokens: response.data.usage.total_tokens,
        model: response.data.model
      };
    } catch (error) {
      console.error('DeepSeek API错误:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message
      };
    }
  }

  // 发送消息到Kimi (Moonshot)
  async sendToKimi(messages, model = 'moonshot-v1-8k', apiKey, options = {}) {
    try {
      const response = await axios.post(
        `${this.providers.kimi.baseURL}/chat/completions`,
        {
          model,
          messages,
          max_tokens: options.max_tokens || 2000,
          temperature: options.temperature || 0.7,
          stream: false
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      return {
        success: true,
        content: response.data.choices[0].message.content,
        tokens: response.data.usage.total_tokens,
        model: response.data.model
      };
    } catch (error) {
      console.error('Kimi API错误:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message
      };
    }
  }

  // 统一的聊天接口
  // 智能路由 - 分析用户意图并调用相应模块
  async analyzeIntent(userMessage) {
    const message = userMessage.toLowerCase();
    
    // 内容生成相关关键词
    const contentKeywords = ['生成', '写', '创作', '文案', '文章', '博客', '社交媒体', '邮件', '广告', '产品描述', '新闻', '故事'];
    // 数据分析相关关键词
    const dataKeywords = ['分析', '数据', '图表', '统计', '报告', '可视化', '趋势', '对比'];
    // 物料库相关关键词
    const materialKeywords = ['搜索', '查找', '物料', '素材', '图片', '视频', '文档', '资源'];

    if (contentKeywords.some(keyword => message.includes(keyword))) {
      return 'content_generation';
    } else if (dataKeywords.some(keyword => message.includes(keyword))) {
      return 'data_analysis';
    } else if (materialKeywords.some(keyword => message.includes(keyword))) {
      return 'material_search';
    }
    
    return 'general_chat';
  }

  // 调用内容生成模块
  async callContentGeneration(userId, prompt, contentType = 'article') {
    try {
      const ContentController = require('../controllers/contentController');
      
      // 模拟请求对象
      const mockReq = {
        body: {
          content_type: contentType,
          prompt: prompt,
          model: 'gpt-3.5-turbo'
        },
        user: { id: userId }
      };
      
      const mockRes = {
        json: (data) => data,
        status: (code) => ({ json: (data) => ({ ...data, statusCode: code }) })
      };
      
      const result = await ContentController.generateContent(mockReq, mockRes);
      return result;
    } catch (error) {
      console.error('调用内容生成模块失败:', error);
      return {
        success: false,
        error: '内容生成功能暂时不可用'
      };
    }
  }

  // 调用数据分析模块
  async callDataAnalysis(userId, query) {
    try {
      // 调用真正的数据分析功能
      // 构建数据分析提示词
      const analysisPrompt = `请对以下内容进行数据分析：\n\n${query}\n\n请提供详细的分析结果，包括数据特征、趋势、洞察和建议。`;
      
      // 获取用户API密钥
      const apiKeys = await this.getUserApiKeys(userId);
      if (!apiKeys) {
        return {
          success: false,
          message: '请先在设置中配置AI API密钥',
          suggestion: '前往设置页面配置您的AI服务API密钥。'
        };
      }

      // 选择可用的AI服务进行分析
      let result;
      if (apiKeys.deepseek) {
        result = await this.sendToDeepSeek([{ role: 'user', content: analysisPrompt }], 'deepseek-chat', apiKeys.deepseek);
      } else if (apiKeys.openai) {
        result = await this.sendToOpenAI([{ role: 'user', content: analysisPrompt }], 'gpt-3.5-turbo', apiKeys.openai);
      } else if (apiKeys.claude) {
        result = await this.sendToClaude([{ role: 'user', content: analysisPrompt }], 'claude-3-haiku', apiKeys.claude);
      } else if (apiKeys.kimi) {
        result = await this.sendToKimi([{ role: 'user', content: analysisPrompt }], 'moonshot-v1-8k', apiKeys.kimi);
      } else {
        return {
          success: false,
          message: '没有可用的AI服务',
          suggestion: '请在设置中配置至少一个AI服务的API密钥。'
        };
      }

      if (result.success) {
        return {
          success: true,
          message: result.content,
          suggestion: '如需更详细的分析，请前往数据分析页面上传文件。'
        };
      } else {
        return {
          success: false,
          message: '数据分析失败：' + result.error,
          suggestion: '请检查您的API密钥配置或稍后重试。'
        };
      }
    } catch (error) {
      console.error('调用数据分析模块失败:', error);
      return {
        success: false,
        error: '数据分析功能暂时不可用'
      };
    }
  }

  // 调用物料库搜索
  async callMaterialSearch(userId, query) {
    try {
      // 这里可以调用物料库搜索功能
      return {
        success: true,
        message: '物料库搜索功能正在开发中，敬请期待！',
        suggestion: '您可以前往物料库页面进行搜索和管理。'
      };
    } catch (error) {
      console.error('调用物料库搜索失败:', error);
      return {
        success: false,
        error: '物料库搜索功能暂时不可用'
      };
    }
  }

  async chat(userId, messages, model = 'gpt-3.5-turbo', options = {}) {
    try {
      // 获取最后一条用户消息
      const lastUserMessage = messages.filter(msg => msg.role === 'user').pop();
      
      if (lastUserMessage && !options.skipIntentAnalysis) {
        // 分析用户意图
        const intent = await this.analyzeIntent(lastUserMessage.content);
        
        // 根据意图调用相应模块
        if (intent === 'content_generation') {
          const contentResult = await this.callContentGeneration(userId, lastUserMessage.content);
          if (contentResult.success) {
            return {
              success: true,
              content: `我为您生成了内容：\n\n${contentResult.data.content}\n\n如需其他类型的内容或优化，请告诉我！`,
              tokens: this.estimateTokens(contentResult.data.content),
              model: model,
              moduleUsed: 'content_generation'
            };
          }
        } else if (intent === 'data_analysis') {
          const dataResult = await this.callDataAnalysis(userId, lastUserMessage.content);
          return {
            success: true,
            content: `${dataResult.message}\n\n${dataResult.suggestion || ''}`,
            tokens: this.estimateTokens(dataResult.message),
            model: model,
            moduleUsed: 'data_analysis'
          };
        } else if (intent === 'material_search') {
          const materialResult = await this.callMaterialSearch(userId, lastUserMessage.content);
          return {
            success: true,
            content: `${materialResult.message}\n\n${materialResult.suggestion || ''}`,
            tokens: this.estimateTokens(materialResult.message),
            model: model,
            moduleUsed: 'material_search'
          };
        }
      }

      // 如果不是特殊意图，则进行常规AI对话
      // 获取用户API密钥
      const apiKeys = await this.getUserApiKeys(userId);
      if (!apiKeys) {
        return {
          success: false,
          error: '请先在设置中配置AI API密钥'
        };
      }

      // 根据模型选择提供商
      let result;
      if (this.providers.openai.models.includes(model)) {
        if (!apiKeys.openai) {
          return {
            success: false,
            error: '请先配置OpenAI API密钥'
          };
        }
        result = await this.sendToOpenAI(messages, model, apiKeys.openai, options);
      } else if (this.providers.claude.models.includes(model)) {
        if (!apiKeys.claude) {
          return {
            success: false,
            error: '请先配置Claude API密钥'
          };
        }
        result = await this.sendToClaude(messages, model, apiKeys.claude, options);
      } else if (this.providers.gemini.models.includes(model)) {
        if (!apiKeys.gemini) {
          return {
            success: false,
            error: '请先配置Gemini API密钥'
          };
        }
        result = await this.sendToGemini(messages, model, apiKeys.gemini, options);
      } else if (this.providers.baidu.models.includes(model)) {
        if (!apiKeys.baidu || !apiKeys.baidu_secret) {
          return {
            success: false,
            error: '请先配置百度API密钥'
          };
        }
        result = await this.sendToBaidu(messages, model, apiKeys.baidu, apiKeys.baidu_secret, options);
      } else if (this.providers.deepseek.models.includes(model)) {
        if (!apiKeys.deepseek) {
          return {
            success: false,
            error: '请先配置DeepSeek API密钥'
          };
        }
        result = await this.sendToDeepSeek(messages, model, apiKeys.deepseek, options);
      } else if (this.providers.kimi.models.includes(model)) {
        if (!apiKeys.kimi) {
          return {
            success: false,
            error: '请先配置Kimi API密钥'
          };
        }
        result = await this.sendToKimi(messages, model, apiKeys.kimi, options);
      } else if (this.providers.zhipu.models.includes(model)) {
        if (!apiKeys.zhipu) {
          return {
            success: false,
            error: '请先配置智谱AI API密钥'
          };
        }
        result = await this.sendToZhipu(messages, model, apiKeys.zhipu, options);
      } else {
        return {
          success: false,
          error: '不支持的模型'
        };
      }

      return result;
    } catch (error) {
      console.error('AI聊天错误:', error);
      return {
        success: false,
        error: 'AI服务暂时不可用，请稍后重试'
      };
    }
  }

  // 获取可用的模型列表
  getAvailableModels() {
    return {
      openai: this.providers.openai.models,
      claude: this.providers.claude.models,
      gemini: this.providers.gemini.models,
      baidu: this.providers.baidu.models,
      deepseek: this.providers.deepseek.models,
      kimi: this.providers.kimi.models,
      zhipu: this.providers.zhipu.models
    };
  }

  // 估算token数量（简单估算）
  estimateTokens(text) {
    // 简单的token估算：中文字符约1.5个token，英文单词约1个token
    const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
    const englishWords = (text.match(/[a-zA-Z]+/g) || []).length;
    const otherChars = text.length - chineseChars - englishWords;
    
    return Math.ceil(chineseChars * 1.5 + englishWords + otherChars * 0.5);
  }

  // 验证API密钥有效性
  async validateApiKey(provider, apiKey, secretKey = null) {
    try {
      switch (provider.toLowerCase()) {
        case 'openai':
          return await this.validateOpenAIKey(apiKey);
        case 'claude':
          return await this.validateClaudeKey(apiKey);
        case 'gemini':
          return await this.validateGeminiKey(apiKey);
        case 'deepseek':
          return await this.validateDeepSeekKey(apiKey);
        case 'kimi':
          return await this.validateKimiKey(apiKey);
        case 'baidu':
          // 百度需要API Key和Secret Key
          return await this.validateBaiduKey(apiKey, secretKey);
        case 'zhipu':
          return await this.validateZhipuKey(apiKey);
        default:
          return false;
      }
    } catch (error) {
      console.error(`验证${provider} API密钥错误:`, error);
      return false;
    }
  }

  // 验证OpenAI API密钥
  async validateOpenAIKey(apiKey) {
    try {
      const response = await axios.get(
        `${this.providers.openai.baseURL}/models`,
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  // 验证Claude API密钥
  async validateClaudeKey(apiKey) {
    try {
      const response = await axios.post(
        'https://api.anthropic.com/v1/messages',
        {
          model: 'claude-3-haiku-20240307',
          max_tokens: 10,
          messages: [{ role: 'user', content: 'test' }]
        },
        {
          headers: {
            'x-api-key': apiKey,
            'Content-Type': 'application/json',
            'anthropic-version': '2023-06-01'
          },
          timeout: 10000
        }
      );
      return response.status === 200;
    } catch (error) {
      return error.response?.status !== 401 && error.response?.status !== 403;
    }
  }

  // 验证Gemini API密钥
  async validateGeminiKey(apiKey) {
    try {
      const response = await axios.get(
        `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`,
        {
          timeout: 10000
        }
      );
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  // 验证DeepSeek API密钥
  async validateDeepSeekKey(apiKey) {
    try {
      const response = await axios.get(
        `${this.providers.deepseek.baseURL}/models`,
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  // 验证Kimi API密钥
  async validateKimiKey(apiKey) {
    try {
      const response = await axios.get(
        `${this.providers.kimi.baseURL}/models`,
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  // 验证百度API密钥
  async validateBaiduKey(apiKey, secretKey) {
    try {
      // 检查两个密钥是否都存在
      if (!apiKey || !secretKey || apiKey.length < 10 || secretKey.length < 10) {
        return false;
      }
      
      // 获取百度access_token
      const tokenResponse = await axios.post(
        'https://aip.baidubce.com/oauth/2.0/token',
        null,
        {
          params: {
            grant_type: 'client_credentials',
            client_id: apiKey,
            client_secret: secretKey
          },
          timeout: 10000
        }
      );
      
      if (tokenResponse.data.access_token) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('百度API密钥验证错误:', error.response?.data || error.message);
      return false;
    }
  }

  // 验证智谱API密钥
  async validateZhipuKey(apiKey) {
    try {
      // 智谱API验证逻辑
      if (!apiKey || apiKey.length < 10) {
        return false;
      }
      // 实际应该调用智谱API进行验证
      return true;
    } catch (error) {
      return false;
    }
  }
}

// 简化的AI调用函数，用于向后兼容
async function callAI(prompt, model = 'gpt-3.5-turbo', options = {}) {
  const aiService = new AIService();
  
  // 构建消息格式
  const messages = [
    { role: 'user', content: prompt }
  ];
  
  try {
    // 使用默认用户ID（这里需要根据实际情况调整）
    const response = await aiService.chat('system', messages, model, options);
    
    if (response.success) {
      return response.content;
    } else {
      throw new Error(response.error || 'AI调用失败');
    }
  } catch (error) {
    console.error('callAI函数错误:', error);
    throw error;
  }
}

module.exports = new AIService();
module.exports.callAI = callAI;