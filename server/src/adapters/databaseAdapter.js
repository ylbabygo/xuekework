const { USE_SUPABASE } = require('../config/database');
const supabaseService = require('../services/supabaseService');

class DatabaseAdapter {
  constructor() {
    this.useSupabase = USE_SUPABASE;
  }

  // 用户相关操作
  async getUsers(page = 1, limit = 10) {
    if (this.useSupabase) {
      return await supabaseService.getUsers(page, limit);
    } else {
      // 原有MySQL/SQLite逻辑
      const { User } = require('../models');
      return await User.findAll({ page, limit });
    }
  }

  async getUserById(id) {
    if (this.useSupabase) {
      return await supabaseService.getUserById(id);
    } else {
      const { User } = require('../models');
      return await User.findById(id);
    }
  }

  async getUserByUsername(username) {
    if (this.useSupabase) {
      return await supabaseService.getUserByUsername(username);
    } else {
      const { User } = require('../models');
      return await User.findByUsername(username);
    }
  }

  async createUser(userData) {
    if (this.useSupabase) {
      return await supabaseService.createUser(userData);
    } else {
      const { User } = require('../models');
      return await User.create(userData);
    }
  }

  async updateUser(id, userData) {
    if (this.useSupabase) {
      return await supabaseService.updateUser(id, userData);
    } else {
      const { User } = require('../models');
      return await User.update(id, userData);
    }
  }

  async deleteUser(id) {
    if (this.useSupabase) {
      return await supabaseService.deleteUser(id);
    } else {
      const { User } = require('../models');
      return await User.delete(id);
    }
  }

  // 用户设置相关操作
  async getUserSettings(userId) {
    if (this.useSupabase) {
      return await supabaseService.getUserSettings(userId);
    } else {
      const { User } = require('../models');
      const user = await User.findById(userId);
      return user ? await user.getSettings() : null;
    }
  }

  async updateUserSettings(userId, settingsData) {
    if (this.useSupabase) {
      return await supabaseService.updateUserSettings(userId, settingsData);
    } else {
      const { User } = require('../models');
      const user = await User.findById(userId);
      return user ? await user.updateSettings(settingsData) : null;
    }
  }

  // AI对话相关操作
  async getConversations(userId, page = 1, limit = 10) {
    if (this.useSupabase) {
      return await supabaseService.getConversations(userId, page, limit);
    } else {
      const { AIConversation } = require('../models');
      return await AIConversation.findByUserId(userId, { page, limit });
    }
  }

  async createConversation(conversationData) {
    console.log('🔍 DatabaseAdapter.createConversation - useSupabase:', this.useSupabase);
    if (this.useSupabase) {
      console.log('📡 使用Supabase创建对话');
      return await supabaseService.createConversation(conversationData);
    } else {
      console.log('🗄️ 使用本地数据库创建对话');
      const { AIConversation } = require('../models');
      return await AIConversation.create(conversationData);
    }
  }

  async getConversationById(id) {
    if (this.useSupabase) {
      return await supabaseService.getConversationById(id);
    } else {
      const { AIConversation } = require('../models');
      return await AIConversation.findById(id);
    }
  }

  async getMessages(conversationId) {
    if (this.useSupabase) {
      return await supabaseService.getMessages(conversationId);
    } else {
      const { AIMessage } = require('../models');
      return await AIMessage.findByConversationId(conversationId);
    }
  }

  async createMessage(messageData) {
    if (this.useSupabase) {
      return await supabaseService.createMessage(messageData);
    } else {
      const { AIMessage } = require('../models');
      return await AIMessage.create(messageData);
    }
  }

  // 内容生成相关操作
  async getContentGenerations(userId, page = 1, limit = 10, type = null) {
    if (this.useSupabase) {
      return await supabaseService.getContentGenerations(userId, page, limit, type);
    } else {
      const { ContentGeneration } = require('../models');
      return await ContentGeneration.findByUserId(userId, { page, limit, type });
    }
  }

  async createContentGeneration(contentData) {
    if (this.useSupabase) {
      return await supabaseService.createContentGeneration(contentData);
    } else {
      const { ContentGeneration } = require('../models');
      return await ContentGeneration.create(contentData);
    }
  }

  // 笔记相关操作
  async getNotes(userId, page = 1, limit = 10, folder = null) {
    if (this.useSupabase) {
      return await supabaseService.getNotes(userId, page, limit, folder);
    } else {
      const { Note } = require('../models');
      return await Note.findByUserId(userId, { page, limit, folder });
    }
  }

  async createNote(noteData) {
    if (this.useSupabase) {
      return await supabaseService.createNote(noteData);
    } else {
      const { Note } = require('../models');
      return await Note.create(noteData);
    }
  }

  async updateNote(id, noteData) {
    if (this.useSupabase) {
      return await supabaseService.updateNote(id, noteData);
    } else {
      const { Note } = require('../models');
      return await Note.update(id, noteData);
    }
  }

  // 待办事项相关操作
  async getTodoLists(userId) {
    if (this.useSupabase) {
      return await supabaseService.getTodoLists(userId);
    } else {
      const { TodoList } = require('../models');
      return await TodoList.findByUserId(userId);
    }
  }

  async createTodoList(listData) {
    if (this.useSupabase) {
      return await supabaseService.createTodoList(listData);
    } else {
      const { TodoList } = require('../models');
      return await TodoList.create(listData);
    }
  }

  async createTodoItem(itemData) {
    if (this.useSupabase) {
      return await supabaseService.createTodoItem(itemData);
    } else {
      const { TodoItem } = require('../models');
      return await TodoItem.create(itemData);
    }
  }

  async updateTodoItem(id, itemData) {
    if (this.useSupabase) {
      return await supabaseService.updateTodoItem(id, itemData);
    } else {
      const { TodoItem } = require('../models');
      return await TodoItem.update(id, itemData);
    }
  }

  // AI工具相关操作
  async getAITools(page = 1, limit = 20, category = null, featured = null) {
    if (this.useSupabase) {
      return await supabaseService.getAITools(page, limit, category, featured);
    } else {
      const { AITool } = require('../models');
      return await AITool.findAll({ page, limit, category, featured });
    }
  }

  async getUserFavoriteTools(userId) {
    if (this.useSupabase) {
      return await supabaseService.getUserFavoriteTools(userId);
    } else {
      const { UserAIToolFavorite } = require('../models');
      return await UserAIToolFavorite.findByUserId(userId);
    }
  }

  async addToolToFavorites(userId, toolId) {
    if (this.useSupabase) {
      return await supabaseService.addToolToFavorites(userId, toolId);
    } else {
      const { UserAIToolFavorite } = require('../models');
      return await UserAIToolFavorite.create({ userId, toolId });
    }
  }

  // 系统日志
  async createSystemLog(logData) {
    if (this.useSupabase) {
      return await supabaseService.createSystemLog(logData);
    } else {
      const { SystemLog } = require('../models');
      return await SystemLog.create(logData);
    }
  }

  // 搜索功能
  async searchNotes(userId, searchTerm) {
    if (this.useSupabase) {
      return await supabaseService.searchNotes(userId, searchTerm);
    } else {
      const { Note } = require('../models');
      return await Note.search(userId, searchTerm);
    }
  }

  async searchAITools(searchTerm) {
    if (this.useSupabase) {
      return await supabaseService.searchAITools(searchTerm);
    } else {
      const { AITool } = require('../models');
      return await AITool.search(searchTerm);
    }
  }

  // 统计信息
  async getStats() {
    if (this.useSupabase) {
      return await supabaseService.getStats();
    } else {
      const { query } = require('../config/database');
      // 原有统计逻辑
      const stats = {};
      const tables = [
        'users', 'ai_conversations', 'ai_messages', 'content_generations',
        'notes', 'todo_lists', 'todo_items', 'ai_tools'
      ];
      
      for (const table of tables) {
        try {
          const result = await query(`SELECT COUNT(*) as count FROM ${table}`);
          stats[table] = result[0].count;
        } catch (error) {
          console.error(`获取表 ${table} 统计失败:`, error);
          stats[table] = 0;
        }
      }
      
      stats.timestamp = new Date().toISOString();
      return stats;
    }
  }

  // 密码验证（特殊处理）
  async validateUserPassword(user, password) {
    if (this.useSupabase) {
      // Supabase中密码验证需要使用bcrypt
      const bcrypt = require('bcryptjs');
      return await bcrypt.compare(password, user.password_hash);
    } else {
      // 原有逻辑
      return await user.validatePassword(password);
    }
  }

  // 密码哈希（特殊处理）
  async hashPassword(password) {
    const bcrypt = require('bcryptjs');
    return await bcrypt.hash(password, 10);
  }
}

module.exports = new DatabaseAdapter();