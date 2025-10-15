import React, { createContext, useContext, useReducer, useEffect } from 'react';
import toast from 'react-hot-toast';
import { simpleAuthService } from '../services/simpleAuth';
import { authApi } from '../services/api';
import { User, UserRole } from '../types';

// 认证状态类型
interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// 认证动作类型
type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User } }
  | { type: 'AUTH_FAILURE' }
  | { type: 'LOGOUT' };

// 认证上下文类型
interface AuthContextType extends AuthState {
  signIn: (username: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
}

// 初始状态
const initialState: AuthState = {
  user: null,
  isLoading: true,
  isAuthenticated: false,
};

// 认证状态管理器
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        isLoading: false,
        isAuthenticated: true,
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        isLoading: false,
        isAuthenticated: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
      };
    default:
      return state;
  }
}



// 创建认证上下文
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 认证提供者组件
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // 登录函数
  const signIn = async (username: string, password: string): Promise<boolean> => {
    dispatch({ type: 'AUTH_START' });
    
    try {
      const response = await authApi.login({ username, password });
      console.log('登录响应:', response);
      
      if (response.success && response.data) {
        const { token, user } = response.data;
        localStorage.setItem('auth_token', token);
        localStorage.setItem('user', JSON.stringify(user));
        dispatch({ type: 'AUTH_SUCCESS', payload: { user } });
        toast.success('登录成功');
        return true;
      } else {
        console.error('登录失败:', response);
        dispatch({ type: 'AUTH_FAILURE' });
        toast.error('用户名或密码错误');
        return false;
      }
    } catch (error: any) {
      console.error('登录请求失败:', error);
      dispatch({ type: 'AUTH_FAILURE' });
      toast.error(error.message || '网络连接失败');
      return false;
    }
  };

  // 登出函数
  const signOut = async (): Promise<void> => {
    try {
      // 调用后端退出API
      await authApi.logout();
    } catch (error) {
      console.error('退出登录API调用失败:', error);
    } finally {
      // 无论API调用是否成功，都清除本地状态
      localStorage.removeItem('user');
      localStorage.removeItem('auth_token');
      dispatch({ type: 'LOGOUT' });
      toast.success('已退出登录');
    }
  };

  // 初始化认证状态
  useEffect(() => {
    const initAuth = async () => {
      try {
        console.log('开始初始化认证状态...');
        
        // 从localStorage获取用户信息和token
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('auth_token');
        
        console.log('存储的用户信息:', storedUser ? '存在' : '不存在');
        console.log('存储的token:', storedToken ? '存在' : '不存在');
        
        if (storedUser && storedToken) {
          try {
            const user = JSON.parse(storedUser);
            
            // 对于简单认证，直接使用存储的用户信息，不进行网络验证
            // 这避免了在页面加载时的网络请求导致的ERR_ABORTED错误
            dispatch({ type: 'AUTH_SUCCESS', payload: { user } });
            console.log('认证状态初始化成功（使用本地存储）');
            
            // 可选：在后台验证token（不阻塞UI）
            setTimeout(async () => {
              try {
                const response = await authApi.getCurrentUser();
                if (!response.success) {
                  console.log('后台验证失败，清除存储');
                  localStorage.removeItem('user');
                  localStorage.removeItem('auth_token');
                  dispatch({ type: 'AUTH_FAILURE' });
                }
              } catch (error) {
                console.log('后台验证出错，但不影响当前状态');
              }
            }, 1000);
            
          } catch (error) {
            console.error('解析用户信息失败:', error);
            localStorage.removeItem('user');
            localStorage.removeItem('auth_token');
            dispatch({ type: 'AUTH_FAILURE' });
          }
        } else {
          console.log('没有存储的认证信息');
          dispatch({ type: 'AUTH_FAILURE' });
        }
      } catch (error) {
        console.error('初始化认证状态失败:', error);
        dispatch({ type: 'AUTH_FAILURE' });
      }
    };

    // 立即执行，不需要延迟
    initAuth();
  }, []);

  const value: AuthContextType = {
    ...state,
    signIn,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// 使用认证上下文的Hook
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}