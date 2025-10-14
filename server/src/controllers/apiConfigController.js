const aiService = require('../services/aiService');
const User = require('../models/User');

class APIConfigController {

  // 保存API配置到用户账户（需要认证）
  async saveApiConfig(req, res) {
    try {
      const { provider, apiKey } = req.body;
      const userId = req.user.id;

      if (!provider || !apiKey) {
        return res.status(400).json({
          success: false,
          message: '提供商和API密钥不能为空'
        });
      }

      // 获取用户
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: '用户不存在'
        });
      }

      // 先保存密钥，再验证（避免验证超时导致保存失败）
      console.log(`开始保存${provider} API密钥...`);
      
      // 获取当前设置
      const currentSettings = await user.getSettings();
      const currentApiKeys = currentSettings?.api_keys || {};

      // 合并API密钥
      const updatedApiKeys = {
        ...currentApiKeys,
        [provider]: apiKey
      };

      // 更新用户设置
      await user.updateSettings({ api_keys: updatedApiKeys });
      console.log(`${provider} API密钥保存成功`);

      // 异步验证API密钥（不阻塞响应）
      setImmediate(async () => {
        try {
          console.log(`开始验证${provider} API密钥...`);
          const isValid = await Promise.race([
            aiService.validateApiKey(provider, apiKey),
            new Promise((_, reject) => setTimeout(() => reject(new Error('验证超时')), 15000))
          ]);
          console.log(`${provider} API密钥验证结果:`, isValid ? '有效' : '无效');
        } catch (error) {
          console.log(`${provider} API密钥验证失败:`, error.message);
        }
      });

      res.json({
        success: true,
        message: 'API配置保存成功',
        data: {
          provider,
          saved: true,
          validating: true
        }
      });
    } catch (error) {
      console.error('保存API配置错误:', error);
      res.status(500).json({
        success: false,
        message: '保存API配置失败: ' + error.message
      });
    }
  }

  // 获取用户的API配置状态（需要认证）
  async getApiConfigStatus(req, res) {
    try {
      const userId = req.user.id;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: '用户不存在'
        });
      }

      // 获取用户设置中的API密钥
      const settings = await user.getSettings();
      const apiKeys = settings?.api_keys || {};
      const configStatus = {};

      // 检查每个配置的API密钥状态
      for (const [provider, apiKey] of Object.entries(apiKeys)) {
        if (apiKey) {
          try {
            const isValid = await aiService.validateApiKey(provider, apiKey);
            configStatus[provider] = {
              configured: true,
              isValid,
              lastChecked: new Date().toISOString()
            };
          } catch (error) {
            configStatus[provider] = {
              configured: true,
              isValid: false,
              error: error.message,
              lastChecked: new Date().toISOString()
            };
          }
        } else {
          configStatus[provider] = {
            configured: false,
            isValid: false
          };
        }
      }

      res.json({
        success: true,
        data: {
          configStatus,
          hasValidKeys: Object.values(configStatus).some(status => status.isValid)
        }
      });
    } catch (error) {
      console.error('获取API配置状态错误:', error);
      res.status(500).json({
        success: false,
        message: '获取API配置状态时发生错误',
        error: error.message
      });
    }
  }

  // 获取API配置（需要认证）
  async getApiConfig(req, res) {
    try {
      const userId = req.user.id;
      
      // 获取用户
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: '用户不存在'
        });
      }

      // 获取用户设置
      const settings = await user.getSettings();
      const apiKeys = settings.api_keys || {};

      // 返回配置状态（不返回实际密钥）
      const configStatus = {};
      for (const [provider, key] of Object.entries(apiKeys)) {
        configStatus[provider] = {
          configured: !!key,
          keyLength: key ? key.length : 0,
          keyPreview: key ? `${key.substring(0, 8)}...` : null
        };
      }

      res.json({
        success: true,
        data: {
          configStatus,
          totalConfigured: Object.keys(apiKeys).length
        }
      });
    } catch (error) {
      console.error('获取API配置错误:', error);
      res.status(500).json({
        success: false,
        message: '获取API配置失败'
      });
    }
  }

  // 实时验证API密钥（需要认证）
  async validateApiKeyRealtime(req, res) {
    try {
      const { provider, apiKey } = req.body;

      if (!provider || !apiKey) {
        return res.status(400).json({
          success: false,
          message: '提供商和API密钥不能为空'
        });
      }

      console.log(`开始验证${provider} API密钥...`);

      // 设置验证超时
      const validationPromise = aiService.validateApiKey(provider, apiKey);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('验证超时')), 15000)
      );

      try {
        const isValid = await Promise.race([validationPromise, timeoutPromise]);
        
        console.log(`${provider} API密钥验证结果:`, isValid ? '有效' : '无效');

        res.json({
          success: true,
          data: {
            provider,
            valid: isValid,
            message: isValid ? 'API密钥验证成功' : 'API密钥验证失败'
          }
        });
      } catch (error) {
        console.log(`${provider} API密钥验证失败:`, error.message);
        
        res.json({
          success: true,
          data: {
            provider,
            valid: false,
            message: `验证失败: ${error.message}`,
            error: error.message
          }
        });
      }
    } catch (error) {
      console.error('验证API密钥错误:', error);
      res.status(500).json({
        success: false,
        message: '验证API密钥失败: ' + error.message
      });
    }
  }

  // 删除API密钥配置（需要认证）
  async removeApiKey(req, res) {
    try {
      const { provider } = req.params;
      const userId = req.user.id;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: '用户不存在'
        });
      }

      // 获取当前设置
      const settings = await user.getSettings();
      const apiKeys = settings?.api_keys || {};
      
      if (apiKeys[provider]) {
        delete apiKeys[provider];
        await user.updateSettings({ api_keys: apiKeys });
      }

      res.json({
        success: true,
        message: `${provider} API密钥已删除`
      });
    } catch (error) {
      console.error('删除API密钥错误:', error);
      res.status(500).json({
        success: false,
        message: '删除API密钥时发生错误',
        error: error.message
      });
    }
  }
}

module.exports = new APIConfigController();