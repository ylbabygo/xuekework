const aiService = require('./aiService');
const User = require('../models/User');

/**
 * AI服务管理器
 * 统一管理用户的AI服务配置和调用
 */
class AIManager {
  constructor() {
    // AI服务提供商映射
    this.providerMap = {
      'openai': {
        name: 'OpenAI',
        models: ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo'],
        defaultModel: 'gpt-3.5-turbo'
      },
      'claude': {
        name: 'Claude',
        models: ['claude-3-haiku', 'claude-3-sonnet', 'claude-3-opus'],
        defaultModel: 'claude-3-haiku'
      },
      'gemini': {
        name: 'Gemini',
        models: ['gemini-pro', 'gemini-pro-vision'],
        defaultModel: 'gemini-pro'
      },
      'deepseek': {
        name: 'DeepSeek',
        models: ['deepseek-chat', 'deepseek-coder'],
        defaultModel: 'deepseek-chat'
      },
      'kimi': {
        name: 'Kimi',
        models: ['moonshot-v1-8k', 'moonshot-v1-32k', 'moonshot-v1-128k'],
        defaultModel: 'moonshot-v1-8k'
      },
      'baidu': {
        name: '百度文心',
        models: ['ernie-bot', 'ernie-bot-turbo'],
        defaultModel: 'ernie-bot'
      },
      'zhipu': {
        name: '智谱AI',
        models: ['glm-4', 'glm-3-turbo'],
        defaultModel: 'glm-3-turbo'
      }
    };
  }

  /**
   * 获取用户可用的AI服务
   */
  async getAvailableServices(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('用户不存在');
      }

      const settings = await user.getSettings();
      const apiKeys = settings?.api_keys || {};

      const availableServices = {};

      // 检查每个服务商的API密钥是否配置
      for (const [provider, config] of Object.entries(this.providerMap)) {
        const hasApiKey = this._hasValidApiKey(provider, apiKeys);

        availableServices[provider] = {
          ...config,
          configured: hasApiKey,
          enabled: hasApiKey
        };
      }

      return availableServices;
    } catch (error) {
      console.error('获取可用AI服务失败:', error);
      throw error;
    }
  }

  /**
   * 获取用户可用的模型列表
   */
  async getAvailableModels(userId) {
    try {
      const availableServices = await this.getAvailableServices(userId);
      const availableModels = {};

      for (const [provider, service] of Object.entries(availableServices)) {
        if (service.enabled) {
          availableModels[provider] = service.models;
        }
      }

      return availableModels;
    } catch (error) {
      console.error('获取可用模型列表失败:', error);
      throw error;
    }
  }

  /**
   * 智能选择最适合的AI模型
   */
  async selectBestModel(userId, taskType = 'general', preferredProvider = null) {
    try {
      const availableServices = await this.getAvailableServices(userId);

      // 如果指定了首选服务商且可用，优先使用
      if (preferredProvider && availableServices[preferredProvider]?.enabled) {
        return {
          provider: preferredProvider,
          model: availableServices[preferredProvider].defaultModel
        };
      }

      // 根据任务类型推荐最适合的AI服务
      const taskRecommendations = {
        'chat': ['openai', 'claude', 'deepseek', 'kimi'],
        'content_generation': ['openai', 'claude', 'deepseek', 'kimi'],
        'data_analysis': ['openai', 'claude', 'deepseek'],
        'code_generation': ['openai', 'claude', 'deepseek'],
        'chinese_content': ['deepseek', 'kimi', 'baidu', 'zhipu'],
        'english_content': ['openai', 'claude', 'gemini'],
        'multilingual': ['openai', 'claude', 'gemini'],
        'reasoning': ['openai', 'claude', 'deepseek'],
        'creative': ['claude', 'openai', 'kimi'],
        'general': ['openai', 'claude', 'deepseek', 'kimi'],
        'markdown_summary': ['openai', 'claude', 'deepseek', 'kimi']
      };

      const recommendedProviders = taskRecommendations[taskType] || taskRecommendations['general'];

      // 找到第一个可用的推荐服务商
      for (const provider of recommendedProviders) {
        if (availableServices[provider]?.enabled) {
          return {
            provider: provider,
            model: availableServices[provider].defaultModel
          };
        }
      }

      // 如果没有推荐的服务商可用，使用第一个可用的
      const availableProviders = Object.keys(availableServices).filter(
        provider => availableServices[provider].enabled
      );

      if (availableProviders.length === 0) {
        throw new Error('没有可用的AI服务，请先配置API密钥');
      }

      const fallbackProvider = availableProviders[0];
      return {
        provider: fallbackProvider,
        model: availableServices[fallbackProvider].defaultModel
      };
    } catch (error) {
      console.error('选择AI模型失败:', error);
      throw error;
    }
  }

  /**
   * 统一的AI调用接口
   */
  async callAI(userId, messages, options = {}) {
    try {
      const { provider, model, taskType = 'general' } = options;

      // 如果没有指定模型，智能选择
      let selectedProvider, selectedModel;
      if (provider && model) {
        selectedProvider = provider;
        selectedModel = model;
      } else {
        const selection = await this.selectBestModel(userId, taskType, provider);
        selectedProvider = selection.provider;
        selectedModel = selection.model;
      }

      // 验证用户是否有权限使用该模型
      const availableServices = await this.getAvailableServices(userId);
      if (!availableServices[selectedProvider]?.enabled) {
        throw new Error(`您尚未配置 ${selectedProvider} 的API密钥`);
      }

      // 调用AI服务
      const response = await aiService.chat(userId, messages, selectedModel, options);

      return {
        ...response,
        provider: selectedProvider,
        model: selectedModel
      };
    } catch (error) {
      console.error('AI调用失败:', error);
      throw error;
    }
  }

  /**
   * 验证用户是否有指定的AI服务
   */
  async hasService(userId, provider) {
    try {
      const availableServices = await this.getAvailableServices(userId);
      return availableServices[provider]?.enabled || false;
    } catch (error) {
      console.error('检查AI服务失败:', error);
      return false;
    }
  }

  /**
   * 获取用户的AI服务使用统计
   */
  async getUsageStats(userId) {
    try {
      const availableServices = await this.getAvailableServices(userId);
      const stats = {
        totalServices: 0,
        enabledServices: 0,
        services: {}
      };

      for (const [provider, service] of Object.entries(availableServices)) {
        stats.totalServices++;
        if (service.enabled) {
          stats.enabledServices++;
        }
        stats.services[provider] = {
          configured: service.configured,
          enabled: service.enabled,
          models: service.models
        };
      }

      return stats;
    } catch (error) {
      console.error('获取使用统计失败:', error);
      throw error;
    }
  }

  /**
   * 检查是否有有效的API密钥
   * @private
   */
  _hasValidApiKey(provider, apiKeys) {
    switch (provider) {
      case 'openai':
        return !!(apiKeys.openai && apiKeys.openai.trim());
      case 'claude':
        return !!(apiKeys.claude && apiKeys.claude.trim());
      case 'gemini':
        return !!(apiKeys.gemini && apiKeys.gemini.trim());
      case 'deepseek':
        return !!(apiKeys.deepseek && apiKeys.deepseek.trim());
      case 'kimi':
        return !!(apiKeys.kimi && apiKeys.kimi.trim());
      case 'baidu':
        return !!(apiKeys.baidu && apiKeys.baidu.trim() && apiKeys.baidu_secret && apiKeys.baidu_secret.trim());
      case 'zhipu':
        return !!(apiKeys.zhipu && apiKeys.zhipu.trim());
      default:
        return false;
    }
  }
}

// 创建单例实例
const aiManager = new AIManager();

module.exports = aiManager;