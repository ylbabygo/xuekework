// 用户相关类型
export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  STANDARD_USER = 'standard_user'
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  status?: string;
  avatar?: string;
  realName?: string;
  department?: string;
  position?: string;
  phone?: string;
  lastLogin?: string;
  createdAt: string;
  updatedAt?: string;
  settings?: UserSettings;
}

export interface UserSettings {
  id?: string;
  user_id?: string;
  theme: 'light' | 'dark' | 'auto';
  language: 'zh' | 'en';
  api_keys: {
    openai?: string;
    claude?: string;
    gemini?: string;
    deepseek?: string;
    kimi?: string;
    baidu?: string;
    baidu_secret?: string;
    zhipu?: string;
  };
  notification_settings: {
    email_notifications: boolean;
    push_notifications: boolean;
    task_reminders: boolean;
  };
  created_at?: string;
  updated_at?: string;
}

// 认证相关类型
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  expiresIn: string;
}

// AI相关类型
export interface AIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  metadata?: {
    model?: string;
    tokens?: number;
    cost?: number;
  };
}

export interface AIConversation {
  id: string;
  title: string;
  messages: AIMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface ContentGenerationRequest {
  type: 'wechat_article' | 'moments_post' | 'course_intro' | 'activity_notice' | 'custom';
  keywords: string[];
  targetAudience: string;
  requirements: string;
  style?: 'professional' | 'casual' | 'humorous' | 'formal';
}

export interface ContentGenerationResponse {
  id: string;
  content: string[];
  metadata: {
    model: string;
    generatedAt: string;
    tokens: number;
  };
}

// 内容生成API响应类型
export interface ContentGenerateResponse {
  content: string;
}

export interface ContentOptimizeResponse {
  optimizedContent: string;
}

// 模板相关类型
export interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  prompt: string;
  variables?: string[];
}

export interface Templates {
  [category: string]: Template[];
}

// 物料库相关类型
export interface Asset {
  id: string;
  name: string;
  type: 'image' | 'document' | 'video' | 'audio' | 'other';
  url: string;
  size: number;
  mimeType: string;
  tags: string[];
  description?: string;
  aiAnalysis?: {
    summary: string;
    keywords: string[];
    ocrText?: string;
  };
  uploadedBy: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AssetUploadRequest {
  file: File;
  tags?: string[];
  description?: string;
  isPublic?: boolean;
}

// 个人效率工具类型
export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TodoList {
  id: string;
  name: string;
  description?: string;
  items: TodoItem[];
  createdAt: string;
  updatedAt: string;
}

export interface TodoItem {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

// AI工具聚合类型
export interface AITool {
  id: string;
  name: string;
  description: string;
  short_description?: string;
  category: string;
  subcategory?: string;
  url: string;
  logo_url?: string;
  screenshot_url?: string;
  rating: number;
  rating_count?: number;
  pricing: string;
  pricing_details?: string;
  features: string[];
  tags: string[];
  is_featured: boolean;
  is_trending?: boolean;
  is_new?: boolean;
  view_count?: number;
  like_count?: number;
  bookmark_count?: number;
  monthly_visits?: number;
  launch_date?: string;
  company?: string;
  country?: string;
  languages?: string[];
  platforms?: string[];
  api_available?: boolean;
  open_source?: boolean;
  free_tier?: boolean;
  trial_available?: boolean;
  mobile_app?: boolean;
  chrome_extension?: boolean;
  integrations?: string[];
  use_cases?: string[];
  target_audience?: string[];
  difficulty_level?: 'beginner' | 'intermediate' | 'advanced';
  last_synced_at?: string;
  created_at: string;
  updated_at: string;
}

export interface AIToolCategory {
  id: string;
  name: string;
  description: string;
  tools: AITool[];
}

// API响应类型
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// 通用类型
export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface Theme {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
  };
}

// 错误类型
export interface AppError {
  code: string;
  message: string;
  details?: any;
}