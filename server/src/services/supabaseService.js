const { supabaseAdmin } = require('../config/supabase');

class SupabaseService {
  constructor() {
    this.client = supabaseAdmin;
  }

  // 用户相关操作
  async getUsers(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const { data, error, count } = await this.client
      .from('users')
      .select('*', { count: 'exact' })
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return { data, total: count };
  }

  async getUserById(id) {
    const { data, error } = await this.client
      .from('users')
      .select('*')
      .eq('id', id);
    
    if (error) throw error;
    return data && data.length > 0 ? data[0] : null;
  }

  async getUserByUsername(username) {
    const { data, error } = await this.client
      .from('users')
      .select('*')
      .eq('username', username);
    
    if (error) throw error;
    return data && data.length > 0 ? data[0] : null;
  }

  async createUser(userData) {
    // 确保有ID字段
    if (!userData.id) {
      const { v4: uuidv4 } = require('uuid');
      userData.id = uuidv4();
    }
    
    const { data, error } = await this.client
      .from('users')
      .insert(userData)
      .select();
    
    if (error) {
      console.error('Supabase createUser error:', error);
      throw error;
    }
    
    // 返回第一个插入的用户
    return data && data.length > 0 ? data[0] : null;
  }

  async updateUser(id, userData) {
    const { data, error } = await this.client
      .from('users')
      .update(userData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async deleteUser(id) {
    const { error } = await this.client
      .from('users')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }

  // 用户设置相关操作
  async getUserSettings(userId) {
    const { data, error } = await this.client
      .from('user_settings')
      .select('*')
      .eq('user_id', userId);
    
    if (error) throw error;
    return data && data.length > 0 ? data[0] : null;
  }

  async updateUserSettings(userId, settingsData) {
    // 首先尝试更新
    const { data: updateData, error: updateError } = await this.client
      .from('user_settings')
      .update(settingsData)
      .eq('user_id', userId)
      .select();
    
    if (updateError) {
      // 如果更新失败，可能是因为记录不存在，尝试插入
      const { data: insertData, error: insertError } = await this.client
        .from('user_settings')
        .insert({ user_id: userId, ...settingsData })
        .select();
      
      if (insertError) throw insertError;
      return insertData[0];
    }
    
    return updateData && updateData.length > 0 ? updateData[0] : null;
  }

  // AI对话相关操作
  async getConversations(userId, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const { data, error, count } = await this.client
      .from('ai_conversations')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .range(offset, offset + limit - 1)
      .order('updated_at', { ascending: false });
    
    if (error) throw error;
    return { data, total: count };
  }

  async createConversation(conversationData) {
    const { data, error } = await this.client
      .from('ai_conversations')
      .insert(conversationData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async getConversationById(id) {
    const { data, error } = await this.client
      .from('ai_conversations')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      throw error;
    }
    return data;
  }

  async getMessages(conversationId) {
    const { data, error } = await this.client
      .from('ai_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data;
  }

  async createMessage(messageData) {
    const { data, error } = await this.client
      .from('ai_messages')
      .insert(messageData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // 内容生成相关操作
  async getContentGenerations(userId, page = 1, limit = 10, type = null) {
    const offset = (page - 1) * limit;
    let query = this.client
      .from('content_generations')
      .select('*', { count: 'exact' })
      .eq('user_id', userId);
    
    if (type) {
      query = query.eq('type', type);
    }
    
    const { data, error, count } = await query
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return { data, total: count };
  }

  async createContentGeneration(contentData) {
    const { data, error } = await this.client
      .from('content_generations')
      .insert(contentData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // 笔记相关操作
  async getNotes(userId, page = 1, limit = 10, folder = null) {
    const offset = (page - 1) * limit;
    let query = this.client
      .from('notes')
      .select('*', { count: 'exact' })
      .eq('user_id', userId);
    
    if (folder) {
      query = query.eq('folder', folder);
    }
    
    const { data, error, count } = await query
      .range(offset, offset + limit - 1)
      .order('updated_at', { ascending: false });
    
    if (error) throw error;
    return { data, total: count };
  }

  async createNote(noteData) {
    const { data, error } = await this.client
      .from('notes')
      .insert(noteData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateNote(id, noteData) {
    const { data, error } = await this.client
      .from('notes')
      .update(noteData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // 待办事项相关操作
  async getTodoLists(userId) {
    const { data, error } = await this.client
      .from('todo_lists')
      .select(`
        *,
        todo_items (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  async createTodoList(listData) {
    const { data, error } = await this.client
      .from('todo_lists')
      .insert(listData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async createTodoItem(itemData) {
    const { data, error } = await this.client
      .from('todo_items')
      .insert(itemData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateTodoItem(id, itemData) {
    const { data, error } = await this.client
      .from('todo_items')
      .update(itemData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // AI工具相关操作
  async getAITools(page = 1, limit = 20, category = null, featured = null) {
    const offset = (page - 1) * limit;
    let query = this.client
      .from('ai_tools')
      .select('*', { count: 'exact' });
    
    if (category) {
      query = query.eq('category', category);
    }
    
    if (featured !== null) {
      query = query.eq('is_featured', featured);
    }
    
    const { data, error, count } = await query
      .range(offset, offset + limit - 1)
      .order('rating', { ascending: false });
    
    if (error) throw error;
    return { data, total: count };
  }

  async getUserFavoriteTools(userId) {
    const { data, error } = await this.client
      .from('user_ai_tool_favorites')
      .select(`
        *,
        ai_tools (*)
      `)
      .eq('user_id', userId);
    
    if (error) throw error;
    return data;
  }

  async addToolToFavorites(userId, toolId) {
    const { data, error } = await this.client
      .from('user_ai_tool_favorites')
      .insert({ user_id: userId, tool_id: toolId })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // 系统日志
  async createSystemLog(logData) {
    const { data, error } = await this.client
      .from('system_logs')
      .insert(logData)
      .select();
    
    if (error) throw error;
    return data && data.length > 0 ? data[0] : null;
  }

  // 搜索功能
  async searchNotes(userId, searchTerm) {
    const { data, error } = await this.client
      .from('notes')
      .select('*')
      .eq('user_id', userId)
      .or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`)
      .order('updated_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  async searchAITools(searchTerm) {
    const { data, error } = await this.client
      .from('ai_tools')
      .select('*')
      .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
      .order('rating', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  // 统计信息
  async getStats() {
    try {
      const stats = {};
      
      // 获取各表的记录数
      const tables = [
        'users', 'ai_conversations', 'ai_messages', 'content_generations',
        'notes', 'todo_lists', 'todo_items', 'ai_tools'
      ];
      
      for (const table of tables) {
        const { count, error } = await this.client
          .from(table)
          .select('*', { count: 'exact', head: true });
        
        if (!error) {
          stats[table] = count;
        }
      }
      
      stats.timestamp = new Date().toISOString();
      return stats;
    } catch (error) {
      console.error('获取统计信息失败:', error);
      return null;
    }
  }
}

module.exports = new SupabaseService();