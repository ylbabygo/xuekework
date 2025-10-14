import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { settingsApi } from '../services/api';

// 语言类型定义
export type Language = 'zh' | 'en';

// 语言状态接口
interface LanguageState {
  language: Language;
  isLoading: boolean;
}

// 语言动作类型
type LanguageAction = 
  | { type: 'SET_LANGUAGE'; payload: Language }
  | { type: 'SET_LOADING'; payload: boolean };

// 语言上下文接口
interface LanguageContextType {
  language: Language;
  isLoading: boolean;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

// 翻译字典
const translations = {
  zh: {
    // 通用
    'common.save': '保存',
    'common.cancel': '取消',
    'common.confirm': '确认',
    'common.loading': '加载中...',
    'common.success': '成功',
    'common.error': '错误',
    
    // 导航
    'nav.dashboard': '仪表板',
    'nav.ai_assistant': 'AI助手',
    'nav.content_generator': '内容生成',
    'nav.data_analysis': '数据分析',
    'nav.learning_resources': '学习资源',
    'nav.asset_library': '素材库',
    'nav.notes': '笔记',
    'nav.todos': '待办事项',
    'nav.ai_tools': 'AI工具',
    'nav.settings': '设置',
    
    // 设置页面
    'settings.title': '设置中心',
    'settings.api_keys': 'API密钥配置',
    'settings.api_keys.description': '配置各种AI服务的API密钥',
    'settings.theme': '主题设置',
    'settings.theme_desc': '选择您偏好的界面主题',
    'settings.theme.dark': '深色模式',
    'settings.theme.light': '浅色模式',
    'settings.theme.auto': '跟随系统',
    'settings.theme.dark.description': '适合夜间使用',
    'settings.theme.light.description': '适合白天使用',
    'settings.theme.auto.description': '根据系统设置自动切换',
    'settings.language': '语言设置',
    'settings.language_desc': '选择您的首选语言',
    'settings.language.zh': '中文',
    'settings.language.en': 'English',
    'settings.language.zh.description': '简体中文界面',
    'settings.language.en.description': 'English interface',
    'settings.notifications': '通知设置',
    'settings.notifications.email': '邮件通知',
    'settings.notifications.push': '推送通知',
    'settings.notifications.reminders': '任务提醒',
    'settings.email_notifications': '邮件通知',
    'settings.email_notifications_desc': '接收重要更新的邮件通知',
    'settings.push_notifications': '推送通知',
    'settings.push_notifications_desc': '接收浏览器推送通知',
    'settings.task_reminders': '任务提醒',
    'settings.task_reminders_desc': '接收待办事项的提醒通知',
    'settings.save': '保存设置',
    'settings.saving': '保存中...',
    'settings.save_success': '设置已保存',
    'settings.save_error': '保存失败',
    'settings.chinese': '中文',
    'settings.english': 'English',
    'settings.dark': '深色模式',
    'settings.light': '浅色模式',
    'settings.auto': '跟随系统',
  },
  en: {
    // Common
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.confirm': 'Confirm',
    'common.loading': 'Loading...',
    'common.success': 'Success',
    'common.error': 'Error',
    
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.ai_assistant': 'AI Assistant',
    'nav.content_generator': 'Content Generator',
    'nav.data_analysis': 'Data Analysis',
    'nav.learning_resources': 'Learning Resources',
    'nav.asset_library': 'Asset Library',
    'nav.notes': 'Notes',
    'nav.todos': 'Todos',
    'nav.ai_tools': 'AI Tools',
    'nav.settings': 'Settings',
    
    // Settings page
    'settings.title': 'Settings Center',
    'settings.api_keys': 'API Keys Configuration',
    'settings.api_keys.description': 'Configure API keys for various AI services',
    'settings.theme': 'Theme Settings',
    'settings.theme_desc': 'Choose your preferred interface theme',
    'settings.theme.dark': 'Dark Mode',
    'settings.theme.light': 'Light Mode',
    'settings.theme.auto': 'Follow System',
    'settings.theme.dark.description': 'Suitable for night use',
    'settings.theme.light.description': 'Suitable for day use',
    'settings.theme.auto.description': 'Auto switch based on system settings',
    'settings.language': 'Language Settings',
    'settings.language_desc': 'Choose your preferred language',
    'settings.language.zh': '中文',
    'settings.language.en': 'English',
    'settings.language.zh.description': 'Simplified Chinese interface',
    'settings.language.en.description': 'English interface',
    'settings.notifications': 'Notification Settings',
    'settings.notifications.email': 'Email Notifications',
    'settings.notifications.push': 'Push Notifications',
    'settings.notifications.reminders': 'Task Reminders',
    'settings.email_notifications': 'Email Notifications',
    'settings.email_notifications_desc': 'Receive email notifications for important updates',
    'settings.push_notifications': 'Push Notifications',
    'settings.push_notifications_desc': 'Receive browser push notifications',
    'settings.task_reminders': 'Task Reminders',
    'settings.task_reminders_desc': 'Receive reminder notifications for todos',
    'settings.save': 'Save Settings',
    'settings.saving': 'Saving...',
    'settings.save_success': 'Settings saved',
    'settings.save_error': 'Save failed',
    'settings.chinese': '中文',
    'settings.english': 'English',
    'settings.dark': 'Dark Mode',
    'settings.light': 'Light Mode',
    'settings.auto': 'Follow System',
  }
};

// 语言状态reducer
const languageReducer = (state: LanguageState, action: LanguageAction): LanguageState => {
  switch (action.type) {
    case 'SET_LANGUAGE':
      return { ...state, language: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
};

// 创建语言上下文
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// 语言提供者组件
export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(languageReducer, {
    language: 'zh', // 默认中文
    isLoading: false,
  });

  // 翻译函数
  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = (translations as any)[state.language];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    return value || key;
  };

  // 设置语言
  const setLanguage = async (language: Language) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // 保存到本地存储
      localStorage.setItem('language', language);
      
      // 保存到服务器
      try {
        await settingsApi.updateUserSettings({ language });
      } catch (error) {
        console.warn('Failed to save language to server:', error);
      }
      
      dispatch({ type: 'SET_LANGUAGE', payload: language });
    } catch (error) {
      console.error('Failed to set language:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // 初始化语言设置
  useEffect(() => {
    const initializeLanguage = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        
        // 首先尝试从本地存储获取
        const savedLanguage = localStorage.getItem('language') as Language;
        if (savedLanguage && ['zh', 'en'].includes(savedLanguage)) {
          dispatch({ type: 'SET_LANGUAGE', payload: savedLanguage });
          return;
        }
        
        // 然后尝试从服务器获取
        try {
          const response = await settingsApi.getUserSettings();
          if (response.success && response.data && response.data.language) {
            const serverLanguage = response.data.language;
            // 确保服务器返回的语言是有效的Language类型
            if (serverLanguage === 'zh' || serverLanguage === 'en') {
              dispatch({ type: 'SET_LANGUAGE', payload: serverLanguage as Language });
              localStorage.setItem('language', serverLanguage);
              return;
            }
          }
        } catch (error) {
          console.warn('Failed to load language from server:', error);
        }
        
        // 最后使用浏览器语言或默认中文
        const browserLanguage = navigator.language.toLowerCase();
        const defaultLanguage: Language = browserLanguage.startsWith('zh') ? 'zh' : 'en';
        dispatch({ type: 'SET_LANGUAGE', payload: defaultLanguage });
        localStorage.setItem('language', defaultLanguage);
        
      } catch (error) {
        console.error('Failed to initialize language:', error);
        dispatch({ type: 'SET_LANGUAGE', payload: 'zh' });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    initializeLanguage();
  }, []);

  const value: LanguageContextType = {
    language: state.language,
    isLoading: state.isLoading,
    setLanguage,
    t,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

// 使用语言上下文的Hook
export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};