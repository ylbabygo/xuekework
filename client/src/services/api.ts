import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
  ApiResponse, 
  LoginRequest, 
  LoginResponse, 
  User,
  UserSettings,
  ContentGenerationRequest,
  ContentGenerationResponse,
  Asset,
  AssetUploadRequest,
  Note,
  TodoList,
  AITool,
  PaginatedResponse
} from '../types';
import { simpleAuthService } from './simpleAuth';

// 创建axios实例
const createApiInstance = (): AxiosInstance => {
  // 获取API基础URL，支持多种环境配置
  const getApiBaseUrl = () => {
    // 优先使用环境变量
    if (process.env.REACT_APP_API_URL) {
      return process.env.REACT_APP_API_URL;
    }
    
    // 根据当前域名自动判断环境
    const hostname = window.location.hostname;
    
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      // 本地开发环境
      return 'http://localhost:5000/api/v1';
    } else if (hostname.includes('vercel.app') || hostname.includes('netlify.app')) {
      // 生产环境 - 使用Vercel函数API路径
      return '/api/v1';
    } else {
      // 其他环境，使用相对路径
      return '/api/v1';
    }
  };

  const instance = axios.create({
    baseURL: getApiBaseUrl(),
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // 请求拦截器 - 添加认证token
  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // 响应拦截器 - 处理错误
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      return response;
    },
    (error) => {
      if (error.response?.status === 401) {
        // Token过期，清除本地存储并重定向到登录页
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

const api = createApiInstance();

// 通用API请求函数
async function apiRequest<T>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  url: string,
  data?: any
): Promise<ApiResponse<T>> {
  try {
    const response = await api.request({
      method,
      url,
      data,
    });
    return response.data;
  } catch (error: any) {
    console.error(`API请求失败 [${method} ${url}]:`, error);
    throw new Error(error.response?.data?.message || error.message || '网络请求失败');
  }
}

// 使用真正的后端认证API
const useSimpleAuth = false;

// 认证相关API
export const authApi = {
  login: async (credentials: LoginRequest) => {
    if (useSimpleAuth) {
      // 使用简单认证服务
      return await simpleAuthService.login(credentials.username, credentials.password);
    } else {
      // 使用后端API
      return apiRequest<LoginResponse>('POST', '/auth/login', credentials);
    }
  },
  
  logout: () => {
    if (useSimpleAuth) {
      // 使用简单认证服务
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      return Promise.resolve({ success: true, message: '退出成功' });
    } else {
      return apiRequest('POST', '/auth/logout');
    }
  },
  
  getCurrentUser: async () => {
    if (useSimpleAuth) {
      // 使用简单认证服务
      return await simpleAuthService.getCurrentUser();
    } else {
      return apiRequest<User>('GET', '/auth/me');
    }
  },
  
  changePassword: async (data: { currentPassword: string; newPassword: string }) => {
    if (useSimpleAuth) {
      // 使用简单认证服务
      return await simpleAuthService.changePassword(data.currentPassword, data.newPassword);
    } else {
      return apiRequest('PUT', '/auth/change-password', data);
    }
  },
};

// 用户管理API (管理员专用)
export const userApi = {
  getUsers: (params?: { page?: number; limit?: number; search?: string }) =>
    apiRequest<PaginatedResponse<User>>('GET', '/users', { params }),
  
  createUser: (userData: Partial<User> & { password: string }) =>
    apiRequest<User>('POST', '/users', userData),
  
  updateUser: (id: string, userData: Partial<User>) =>
    apiRequest<User>('PUT', `/users/${id}`, userData),
  
  deleteUser: (id: string) =>
    apiRequest('DELETE', `/users/${id}`),
  
  resetUserPassword: (id: string, newPassword: string) =>
    apiRequest('PUT', `/users/${id}/reset-password`, { newPassword }),
};

// AI功能API
export const aiApi = {
  getModels: () =>
    apiRequest('GET', '/ai/models'),
  
  getConversations: () =>
    apiRequest('GET', '/ai/conversations'),
  
  createConversation: (data: { title: string; model: string }) =>
    apiRequest('POST', '/ai/conversations', data),
  
  updateConversation: (id: string, data: { title?: string }) =>
    apiRequest('PUT', `/ai/conversations/${id}`, data),
  
  deleteConversation: (id: string) =>
    apiRequest('DELETE', `/ai/conversations/${id}`),
  
  getMessages: (conversationId: string) =>
    apiRequest('GET', `/ai/conversations/${conversationId}/messages`),
  
  sendMessage: (conversationId: string, data: { content: string; model: string }) =>
    apiRequest('POST', `/ai/conversations/${conversationId}/messages`, data),
  
  generateContent: (request: ContentGenerationRequest, apiKey?: string) =>
    apiRequest<ContentGenerationResponse>('POST', '/ai/generate-content', { ...request, apiKey }),
  
  analyzeData: (data: any, query: string, apiKey?: string) =>
    apiRequest('POST', '/ai/analyze-data', { data, query, apiKey }),
  
  testApiKey: (provider: string, apiKey: string) =>
    apiRequest('POST', '/ai/test-api-key', { provider, apiKey }),
};

// 物料库API
export const assetApi = {
  getAssets: (params?: { 
    page?: number; 
    limit?: number; 
    search?: string; 
    type?: string;
    tags?: string[];
    isPublic?: boolean;
  }) =>
    apiRequest<PaginatedResponse<Asset>>('GET', '/assets', { params }),
  
  uploadAsset: (request: AssetUploadRequest) => {
    const formData = new FormData();
    formData.append('file', request.file);
    if (request.tags) {
      formData.append('tags', JSON.stringify(request.tags));
    }
    if (request.description) {
      formData.append('description', request.description);
    }
    if (request.isPublic !== undefined) {
      formData.append('isPublic', String(request.isPublic));
    }
    
    return api.post('/assets/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }).then(response => response.data);
  },
  
  getAsset: (id: string) =>
    apiRequest<Asset>('GET', `/assets/${id}`),
  
  updateAsset: (id: string, data: Partial<Asset>) =>
    apiRequest<Asset>('PUT', `/assets/${id}`, data),
  
  deleteAsset: (id: string) =>
    apiRequest('DELETE', `/assets/${id}`),
  
  searchAssets: (query: string) =>
    apiRequest<Asset[]>('GET', `/assets/search?q=${encodeURIComponent(query)}`),
};

// 记事本API
export const noteApi = {
  getNotes: (params?: { page?: number; limit?: number; search?: string }) =>
    apiRequest<PaginatedResponse<Note>>('GET', '/notes', { params }),
  
  createNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) =>
    apiRequest<Note>('POST', '/notes', note),
  
  updateNote: (id: string, note: Partial<Note>) =>
    apiRequest<Note>('PUT', `/notes/${id}`, note),
  
  deleteNote: (id: string) =>
    apiRequest('DELETE', `/notes/${id}`),
  
  searchNotes: (query: string) =>
    apiRequest<Note[]>('GET', `/notes/search?q=${encodeURIComponent(query)}`),
};

// 待办清单API
export const todoApi = {
  getTodoLists: () =>
    apiRequest<TodoList[]>('GET', '/todos'),
  
  createTodoList: (list: Omit<TodoList, 'id' | 'createdAt' | 'updatedAt'>) =>
    apiRequest<TodoList>('POST', '/todos', list),
  
  updateTodoList: (id: string, list: Partial<TodoList>) =>
    apiRequest<TodoList>('PUT', `/todos/${id}`, list),
  
  deleteTodoList: (id: string) =>
    apiRequest('DELETE', `/todos/${id}`),
  
  addTodoItem: (listId: string, item: any) =>
    apiRequest('POST', `/todos/${listId}/items`, item),
  
  updateTodoItem: (listId: string, itemId: string, item: any) =>
    apiRequest('PUT', `/todos/${listId}/items/${itemId}`, item),
  
  deleteTodoItem: (listId: string, itemId: string) =>
    apiRequest('DELETE', `/todos/${listId}/items/${itemId}`),
};

// AI工具聚合API
export const aiToolsApi = {
  getAITools: (params?: { 
    category?: string; 
    subcategory?: string;
    search?: string; 
    tags?: string[]; 
    rating?: number; 
    pricing?: string;
    is_trending?: boolean;
    is_new?: boolean;
    api_available?: boolean;
    open_source?: boolean;
    free_tier?: boolean;
    trial_available?: boolean;
    mobile_app?: boolean;
    chrome_extension?: boolean;
    difficulty_level?: string;
    target_audience?: string;
    page?: number;
    limit?: number;
    sort?: string;
  }) =>
    apiRequest<PaginatedResponse<AITool>>('GET', '/ai-tools', { params }),
  
  getAITool: (id: string) =>
    apiRequest<AITool>('GET', `/ai-tools/${id}`),
  
  getAIToolCategories: () =>
    apiRequest<string[]>('GET', '/ai-tools/categories'),
  
  getAIToolSubcategories: (category?: string) =>
    apiRequest<string[]>('GET', '/ai-tools/subcategories', { params: { category } }),
  
  getAIToolTags: () =>
    apiRequest<string[]>('GET', '/ai-tools/tags'),
  
  getTrendingTools: (limit?: number) =>
    apiRequest<AITool[]>('GET', '/ai-tools/trending', { params: { limit } }),
  
  getNewTools: (limit?: number) =>
    apiRequest<AITool[]>('GET', '/ai-tools/new', { params: { limit } }),
  
  getSimilarTools: (id: string, limit?: number) =>
    apiRequest<AITool[]>('GET', `/ai-tools/${id}/similar`, { params: { limit } }),
  
  getAIToolStats: () =>
    apiRequest('GET', '/ai-tools/stats'),
  
  getUserFavorites: () =>
    apiRequest<AITool[]>('GET', '/ai-tools/user/favorites'),
  
  addFavorite: (toolId: string) =>
    apiRequest('POST', `/ai-tools/${toolId}/favorite`),
  
  removeFavorite: (toolId: string) =>
    apiRequest('DELETE', `/ai-tools/${toolId}/favorite`),
  
  likeAITool: (toolId: string) =>
    apiRequest('POST', `/ai-tools/like`, { toolId }),
  
  bookmarkAITool: (toolId: string) =>
    apiRequest('POST', `/ai-tools/bookmark`, { toolId }),
  
  addBookmark: (toolId: string) =>
    apiRequest('POST', `/ai-tools/${toolId}/bookmark`),
  
  removeBookmark: (toolId: string) =>
    apiRequest('DELETE', `/ai-tools/${toolId}/bookmark`),
  
  getUserBookmarks: (params?: { page?: number; limit?: number }) =>
    apiRequest<PaginatedResponse<AITool>>('GET', '/ai-tools/user/bookmarks', { params }),
  
  incrementViews: (toolId: string) =>
    apiRequest('POST', `/ai-tools/${toolId}/view`),
  
  syncAITools: () =>
    apiRequest('POST', '/ai-tools/sync'),
};

// 设置API
export const settingsApi = {
  getUserSettings: () =>
    apiRequest<UserSettings>('GET', '/auth/settings'),
  
  updateUserSettings: (settings: Partial<UserSettings>) =>
    apiRequest<UserSettings>('PUT', '/auth/settings', settings),
  
  updateApiKeys: (apiKeys: Record<string, string>) =>
    apiRequest<UserSettings>('PUT', '/auth/settings', { api_keys: apiKeys }),
  
  updateTheme: (theme: string) =>
    apiRequest<UserSettings>('PUT', '/auth/settings', { theme }),
  
  validateApiKey: (provider: string, apiKey: string, secretKey?: string) =>
    apiRequest('POST', '/settings/validate-api-key', { 
      provider, 
      api_key: apiKey,
      ...(secretKey && { secret_key: secretKey })
    }),

  validateAllApiKeys: () =>
    apiRequest('POST', '/settings/validate-all-api-keys', {}),
};

// 系统API
export const systemApi = {
  getHealth: () =>
    apiRequest('GET', '/health'),
  
  getStats: () =>
    apiRequest('GET', '/admin/stats'),
  
  getLogs: (params?: { page?: number; limit?: number; level?: string }) =>
    apiRequest('GET', '/admin/logs', { params }),
};

export default api;