const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const aiService = require('../services/aiService');
const aiManager = require('../services/aiManager');
const { query } = require('../config/database');

class AIController {
  // 创建新对话
  static async createConversation(req, res) {
    try {
      // 检查用户认证
      if (!req.user || !req.user.id) {
        return res.status(401).json({
          success: false,
          message: '用户未认证'
        });
      }

      const { title, model = 'gpt-3.5-turbo' } = req.body;
      const userId = req.user.id;

      if (!title) {
        return res.status(400).json({
          success: false,
          message: '对话标题不能为空'
        });
      }

      const conversation = await Conversation.create(userId, title, model);

      // 记录系统日志
      await query(
        'INSERT INTO system_logs (user_id, action, details, ip_address, user_agent) VALUES (?, ?, ?, ?, ?)',
        [
          userId,
          'conversation_create',
          JSON.stringify({ conversation_id: conversation.id, title, model }),
          req.ip,
          req.get('User-Agent')
        ]
      );

      res.status(201).json({
        success: true,
        message: '对话创建成功',
        data: conversation.toJSON()
      });
    } catch (error) {
      console.error('创建对话错误:', error);
      res.status(500).json({
        success: false,
        message: '创建对话失败'
      });
    }
  }

  // 获取用户的对话列表
  static async getConversations(req, res) {
    try {
      // 检查用户认证
      if (!req.user || !req.user.id) {
        return res.status(401).json({
          success: false,
          message: '用户未认证'
        });
      }

      const userId = req.user.id;
      const { page = 1, limit = 20, archived = false } = req.query;

      const conversations = await Conversation.findByUserId(userId, {
        page: parseInt(page),
        limit: parseInt(limit),
        archived: archived === 'true'
      });

      res.json({
        success: true,
        data: conversations.map(conv => conv.toJSON()),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit)
        }
      });
    } catch (error) {
      console.error('获取对话列表错误:', error);
      res.status(500).json({
        success: false,
        message: '获取对话列表失败'
      });
    }
  }

  // 获取单个对话详情
  static async getConversation(req, res) {
    try {
      // 检查用户认证
      if (!req.user || !req.user.id) {
        return res.status(401).json({
          success: false,
          message: '用户未认证'
        });
      }

      const { id } = req.params;
      const userId = req.user.id;

      const conversation = await Conversation.findById(id);
      if (!conversation) {
        return res.status(404).json({
          success: false,
          message: '对话不存在'
        });
      }

      // 检查权限
      if (conversation.user_id !== userId) {
        return res.status(403).json({
          success: false,
          message: '无权访问此对话'
        });
      }

      // 获取对话消息
      const messages = await conversation.getMessages();

      res.json({
        success: true,
        data: {
          conversation: conversation.toJSON(),
          messages: messages.map(msg => new Message(msg).toJSON())
        }
      });
    } catch (error) {
      console.error('获取对话详情错误:', error);
      res.status(500).json({
        success: false,
        message: '获取对话详情失败'
      });
    }
  }

  // 发送消息
  static async sendMessage(req, res) {
    try {
      // 检查用户认证
      if (!req.user || !req.user.id) {
        return res.status(401).json({
          success: false,
          message: '用户未认证'
        });
      }

      const { id } = req.params;
      const { content, model } = req.body;
      const userId = req.user.id;

      if (!content || !content.trim()) {
        return res.status(400).json({
          success: false,
          message: '消息内容不能为空'
        });
      }

      // 获取对话
      const conversation = await Conversation.findById(id);
      if (!conversation) {
        return res.status(404).json({
          success: false,
          message: '对话不存在'
        });
      }

      // 检查权限
      if (conversation.user_id !== userId) {
        return res.status(403).json({
          success: false,
          message: '无权访问此对话'
        });
      }

      // 估算用户消息的token数
      const userTokens = aiService.estimateTokens(content);

      // 保存用户消息
      const userMessage = await conversation.addMessage('user', content, userTokens);

      // 获取对话历史
      const messages = await conversation.getMessages();
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // 调用AI服务 - 使用AI管理器智能选择模型
      const aiResponse = await aiManager.callAI(
        userId,
        conversationHistory,
        {
          model: model || conversation.model,
          taskType: 'chat'
        }
      );

      if (!aiResponse.success) {
        return res.status(400).json({
          success: false,
          message: aiResponse.error
        });
      }

      // 保存AI回复
      const assistantMessage = await conversation.addMessage(
        'assistant',
        aiResponse.content,
        aiResponse.tokens,
        {
          model: aiResponse.model,
          total_tokens: aiResponse.tokens
        }
      );

      // 记录系统日志
      await query(
        'INSERT INTO system_logs (user_id, action, details, ip_address, user_agent) VALUES (?, ?, ?, ?, ?)',
        [
          userId,
          'ai_chat',
          JSON.stringify({
            conversation_id: conversation.id,
            user_tokens: userTokens,
            ai_tokens: aiResponse.tokens,
            model: aiResponse.model
          }),
          req.ip,
          req.get('User-Agent')
        ]
      );

      res.json({
        success: true,
        data: {
          userMessage: userMessage.toJSON(),
          assistantMessage: assistantMessage.toJSON(),
          conversation: conversation.toJSON()
        }
      });
    } catch (error) {
      console.error('发送消息错误:', error);
      res.status(500).json({
        success: false,
        message: '发送消息失败'
      });
    }
  }

  // 更新对话标题
  static async updateConversation(req, res) {
    try {
      const { id } = req.params;
      const { title } = req.body;
      const userId = req.user.id;

      if (!title || !title.trim()) {
        return res.status(400).json({
          success: false,
          message: '对话标题不能为空'
        });
      }

      const conversation = await Conversation.findById(id);
      if (!conversation) {
        return res.status(404).json({
          success: false,
          message: '对话不存在'
        });
      }

      // 检查权限
      if (conversation.user_id !== userId) {
        return res.status(403).json({
          success: false,
          message: '无权修改此对话'
        });
      }

      await conversation.updateTitle(title);

      res.json({
        success: true,
        message: '对话标题更新成功',
        data: conversation.toJSON()
      });
    } catch (error) {
      console.error('更新对话错误:', error);
      res.status(500).json({
        success: false,
        message: '更新对话失败'
      });
    }
  }

  // 归档对话
  static async archiveConversation(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const conversation = await Conversation.findById(id);
      if (!conversation) {
        return res.status(404).json({
          success: false,
          message: '对话不存在'
        });
      }

      // 检查权限
      if (conversation.user_id !== userId) {
        return res.status(403).json({
          success: false,
          message: '无权归档此对话'
        });
      }

      await conversation.archive();

      res.json({
        success: true,
        message: '对话归档成功',
        data: conversation.toJSON()
      });
    } catch (error) {
      console.error('归档对话错误:', error);
      res.status(500).json({
        success: false,
        message: '归档对话失败'
      });
    }
  }

  // 删除对话
  static async deleteConversation(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const conversation = await Conversation.findById(id);
      if (!conversation) {
        return res.status(404).json({
          success: false,
          message: '对话不存在'
        });
      }

      // 检查权限
      if (conversation.user_id !== userId) {
        return res.status(403).json({
          success: false,
          message: '无权删除此对话'
        });
      }

      await conversation.delete();

      // 记录系统日志
      await query(
        'INSERT INTO system_logs (user_id, action, details, ip_address, user_agent) VALUES (?, ?, ?, ?, ?)',
        [
          userId,
          'conversation_delete',
          JSON.stringify({ conversation_id: id }),
          req.ip,
          req.get('User-Agent')
        ]
      );

      res.json({
        success: true,
        message: '对话删除成功'
      });
    } catch (error) {
      console.error('删除对话错误:', error);
      res.status(500).json({
        success: false,
        message: '删除对话失败'
      });
    }
  }

  // 获取用户可用的AI模型
  static async getModels(req, res) {
    try {
      // 如果用户未认证，返回空的模型列表
      if (!req.user || !req.user.id) {
        return res.json({
          success: true,
          data: {}
        });
      }

      const userId = req.user.id;

      // 获取用户可用的模型列表（仅显示已配置API密钥的模型）
      const availableModels = await aiManager.getAvailableModels(userId);

      res.json({
        success: true,
        data: availableModels
      });
    } catch (error) {
      console.error('获取模型列表错误:', error);
      res.status(500).json({
        success: false,
        message: '获取模型列表失败',
        error: error.message
      });
    }
  }

  // 测试API密钥有效性
  static async testApiKey(req, res) {
    try {
      const { provider, apiKey } = req.body;

      if (!provider || !apiKey) {
        return res.status(400).json({
          success: false,
          message: '提供商和API密钥不能为空'
        });
      }

      // 使用AI服务验证API密钥
      const isValid = await aiService.validateApiKey(provider, apiKey);

      res.json({
        success: isValid,
        message: isValid ? 'API密钥验证成功' : 'API密钥验证失败',
        data: {
          provider,
          isValid
        }
      });
    } catch (error) {
      console.error('API密钥验证错误:', error);
      res.status(500).json({
        success: false,
        message: 'API密钥验证失败',
        error: error.message
      });
    }
  }
}

module.exports = AIController;