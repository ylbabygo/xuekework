const express = require('express');
const router = express.Router();
const User = require('../models/User');
const aiService = require('../services/aiService');

// 获取用户设置
router.get('/', async (req, res) => {
  try {
    let userId = req.user?.id;
    
    // 如果没有用户ID，获取第一个可用用户
    if (!userId) {
      const users = await User.getList(1, 1);
      if (users.users.length === 0) {
        return res.status(404).json({
          success: false,
          message: '系统中没有用户'
        });
      }
      userId = users.users[0].id;
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }
    
    const settings = await user.getSettings();
    
    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取设置失败',
      error: error.message
    });
  }
});

// 更新用户设置
router.put('/', async (req, res) => {
  try {
    let userId = req.user?.id;
    
    // 如果没有用户ID，获取第一个可用用户
    if (!userId) {
      const users = await User.getList(1, 1);
      if (users.users.length === 0) {
        return res.status(404).json({
          success: false,
          message: '系统中没有用户'
        });
      }
      userId = users.users[0].id;
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }
    
    const settings = req.body;
    await user.updateSettings(settings);
    
    res.json({
      success: true,
      message: '设置更新成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '更新设置失败',
      error: error.message
    });
  }
});

// 更新API密钥
router.put('/api-keys', async (req, res) => {
  try {
    let userId = req.user?.id;
    
    // 如果没有用户ID，获取第一个可用用户
    if (!userId) {
      const users = await User.getList(1, 1);
      if (users.users.length === 0) {
        return res.status(404).json({
          success: false,
          message: '系统中没有用户'
        });
      }
      userId = users.users[0].id;
    }
    
    // 获取用户实例
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }
    
    // 获取当前设置
    const currentSettings = await user.getSettings();
    const currentApiKeys = currentSettings?.api_keys || {};
    
    // 合并新的API密钥
    const updatedApiKeys = { ...currentApiKeys, ...req.body };
    
    await user.updateSettings({ api_keys: updatedApiKeys });
    
    res.json({
      success: true,
      message: 'API密钥更新成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '更新API密钥失败',
      error: error.message
    });
  }
});

// 验证API密钥
router.post('/validate-api-key', async (req, res) => {
  try {
    const userId = req.user?.id || 1;
    const { provider, api_key, secret_key } = req.body;

    if (!provider || !api_key) {
      return res.status(400).json({
        success: false,
        message: '请提供服务商和API密钥'
      });
    }

    // 百度API需要两个密钥
    if (provider === 'baidu' && !secret_key) {
      return res.status(400).json({
        success: false,
        message: '百度API需要同时提供API Key和Secret Key'
      });
    }

    // 验证API密钥
    const isValid = await aiService.validateApiKey(provider, api_key, secret_key);

    if (isValid) {
      res.json({
        success: true,
        message: `${provider} API密钥验证成功`
      });
    } else {
      res.status(400).json({
        success: false,
        message: `${provider} API密钥验证失败，请检查密钥是否正确`
      });
    }
  } catch (error) {
    console.error('验证API密钥错误:', error);
    res.status(500).json({
      success: false,
      message: '验证API密钥时发生错误',
      error: error.message
    });
  }
});

// 批量验证所有API密钥
router.post('/validate-all-api-keys', async (req, res) => {
  try {
    let userId = req.user?.id;

    // 如果没有用户ID，获取第一个可用用户
    if (!userId) {
      const users = await User.getList(1, 1);
      if (users.users.length === 0) {
        return res.status(404).json({
          success: false,
          message: '系统中没有用户'
        });
      }
      userId = users.users[0].id;
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    const settings = await user.getSettings();
    const apiKeys = settings?.api_keys || {};

    const validationResults = {};

    // 验证所有已配置的API密钥
    for (const [provider, apiKey] of Object.entries(apiKeys)) {
      if (apiKey && apiKey.trim()) {
        try {
          const isValid = await aiService.validateApiKey(provider, apiKey);
          validationResults[provider] = {
            valid: isValid,
            message: isValid ? '验证成功' : '验证失败'
          };
        } catch (error) {
          validationResults[provider] = {
            valid: false,
            message: `验证出错: ${error.message}`
          };
        }
      } else {
        validationResults[provider] = {
          valid: null,
          message: '未配置密钥'
        };
      }
    }

    res.json({
      success: true,
      data: validationResults
    });
  } catch (error) {
    console.error('批量验证API密钥错误:', error);
    res.status(500).json({
      success: false,
      message: '批量验证API密钥时发生错误',
      error: error.message
    });
  }
});

// 更新主题设置
router.put('/theme', async (req, res) => {
  try {
    const userId = req.user?.id || 1; // 临时使用默认用户ID
    const { theme } = req.body;
    
    await User.updateSettings(userId, { theme });
    
    res.json({
      success: true,
      message: '主题设置更新成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '更新主题设置失败',
      error: error.message
    });
  }
});

module.exports = router;