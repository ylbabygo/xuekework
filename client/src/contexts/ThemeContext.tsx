import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { settingsApi } from '../services/api';

// 主题类型
export type Theme = 'light' | 'dark' | 'auto';

// 主题状态类型
interface ThemeState {
  theme: Theme;
  actualTheme: 'light' | 'dark'; // 实际应用的主题（auto模式下根据系统设置确定）
  isLoading: boolean;
}

// 主题动作类型
type ThemeAction = 
  | { type: 'SET_THEME'; payload: Theme }
  | { type: 'SET_ACTUAL_THEME'; payload: 'light' | 'dark' }
  | { type: 'SET_LOADING'; payload: boolean };

// 主题上下文类型
interface ThemeContextType {
  theme: Theme;
  actualTheme: 'light' | 'dark';
  isLoading: boolean;
  setTheme: (theme: Theme) => Promise<void>;
  toggleTheme: () => Promise<void>;
}

// 初始状态
const initialState: ThemeState = {
  theme: 'dark',
  actualTheme: 'dark',
  isLoading: true,
};

// 主题状态管理器
function themeReducer(state: ThemeState, action: ThemeAction): ThemeState {
  switch (action.type) {
    case 'SET_THEME':
      return {
        ...state,
        theme: action.payload,
      };
    case 'SET_ACTUAL_THEME':
      return {
        ...state,
        actualTheme: action.payload,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    default:
      return state;
  }
}

// 创建主题上下文
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// 获取系统主题偏好
function getSystemTheme(): 'light' | 'dark' {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'dark';
}

// 应用主题到DOM
function applyTheme(theme: 'light' | 'dark') {
  const root = document.documentElement;
  
  // 使用data-theme属性而不是CSS类
  root.setAttribute('data-theme', theme);
  
  // 更新meta标签以支持移动端状态栏
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.setAttribute('content', theme === 'dark' ? '#000000' : '#ffffff');
  }
}

// 主题提供者组件
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(themeReducer, initialState);

  // 设置主题
  const setTheme = async (newTheme: Theme): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // 更新本地状态
      dispatch({ type: 'SET_THEME', payload: newTheme });
      
      // 计算实际主题
      let actualTheme: 'light' | 'dark';
      if (newTheme === 'auto') {
        actualTheme = getSystemTheme();
      } else {
        actualTheme = newTheme;
      }
      
      dispatch({ type: 'SET_ACTUAL_THEME', payload: actualTheme });
      applyTheme(actualTheme);
      
      // 保存到本地存储
      localStorage.setItem('theme', newTheme);
      
      // 保存到服务器
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          await settingsApi.updateTheme(newTheme);
        } catch (error) {
          console.warn('保存主题设置到服务器失败:', error);
        }
      }
    } catch (error) {
      console.error('设置主题失败:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // 切换主题（在light和dark之间切换）
  const toggleTheme = async (): Promise<void> => {
    const newTheme = state.actualTheme === 'dark' ? 'light' : 'dark';
    await setTheme(newTheme);
  };

  // 监听系统主题变化
  useEffect(() => {
    if (state.theme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const handleChange = (e: MediaQueryListEvent) => {
        const systemTheme = e.matches ? 'dark' : 'light';
        dispatch({ type: 'SET_ACTUAL_THEME', payload: systemTheme });
        applyTheme(systemTheme);
      };
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [state.theme]);

  // 初始化主题
  useEffect(() => {
    const initTheme = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        
        // 首先从本地存储获取主题
        const savedTheme = localStorage.getItem('theme') as Theme;
        let initialTheme: Theme = savedTheme || 'dark';
        
        // 尝试从服务器获取用户设置
        const token = localStorage.getItem('auth_token');
        if (token) {
          try {
            const response = await settingsApi.getUserSettings();
            if (response.success && (response.data as any)?.theme) {
              const serverTheme = (response.data as any).theme;
              // 确保服务器返回的主题是有效的Theme类型
              if (serverTheme === 'light' || serverTheme === 'dark' || serverTheme === 'auto') {
                initialTheme = serverTheme as Theme;
              }
            }
          } catch (error) {
            console.warn('获取服务器主题设置失败，使用本地设置:', error);
          }
        }
        
        // 设置主题
        dispatch({ type: 'SET_THEME', payload: initialTheme });
        
        // 计算实际主题
        let actualTheme: 'light' | 'dark';
        if (initialTheme === 'auto') {
          actualTheme = getSystemTheme();
        } else {
          actualTheme = initialTheme;
        }
        
        dispatch({ type: 'SET_ACTUAL_THEME', payload: actualTheme });
        applyTheme(actualTheme);
        
        // 保存到本地存储
        localStorage.setItem('theme', initialTheme);
      } catch (error) {
        console.error('初始化主题失败:', error);
        // 使用默认主题
        dispatch({ type: 'SET_THEME', payload: 'dark' });
        dispatch({ type: 'SET_ACTUAL_THEME', payload: 'dark' });
        applyTheme('dark');
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    initTheme();
  }, []);

  const value: ThemeContextType = {
    theme: state.theme,
    actualTheme: state.actualTheme,
    isLoading: state.isLoading,
    setTheme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// 使用主题上下文的Hook
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}