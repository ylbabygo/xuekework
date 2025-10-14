import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { settingsApi } from '../services/api';
import { useAuth } from './AuthContext';

interface APIConfig {
  openai: string;
  claude: string;
  gemini: string;
  deepseek: string;
  kimi: string;
  baidu: string;
  zhipu: string;
}

interface APIStatus {
  [key: string]: {
    isValid: boolean;
    isChecking: boolean;
    lastChecked?: Date;
    error?: string;
  };
}

interface APIConfigContextType {
  apiConfig: APIConfig;
  apiStatus: APIStatus;
  isLoading: boolean;
  hasValidAPI: boolean;
  updateAPIKey: (provider: keyof APIConfig, key: string) => Promise<boolean>;
  updateAPIConfig: (config: Partial<APIConfig>) => Promise<boolean>;
  validateAPIKey: (provider: keyof APIConfig, key: string) => Promise<boolean>;
  validateAllKeys: () => Promise<void>;
  refreshConfig: () => Promise<void>;
  getAvailableProviders: () => string[];
  isProviderConfigured: (provider: keyof APIConfig) => boolean;
}

const APIConfigContext = createContext<APIConfigContextType | undefined>(undefined);

export const useAPIConfig = () => {
  const context = useContext(APIConfigContext);
  if (context === undefined) {
    throw new Error('useAPIConfig must be used within an APIConfigProvider');
  }
  return context;
};

interface APIConfigProviderProps {
  children: ReactNode;
}

// 简化的API配置提供者
export function APIConfigProvider({ children }: APIConfigProviderProps) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [apiConfig, setApiConfig] = useState<APIConfig>({
    openai: '',
    claude: '',
    gemini: '',
    deepseek: '',
    kimi: '',
    baidu: '',
    zhipu: ''
  });

  const [apiStatus, setApiStatus] = useState<APIStatus>({});
  const [isLoading, setIsLoading] = useState(false);

  // 计算是否有有效的API
  const hasValidAPI = Object.values(apiStatus).some(status => status.isValid);

  // 更新单个API密钥
  const updateAPIKey = async (provider: keyof APIConfig, key: string): Promise<boolean> => {
    try {
      const response = await settingsApi.updateApiKeys({ [provider]: key });
      if (response.success) {
        setApiConfig(prev => ({ ...prev, [provider]: key }));
        return true;
      }
      return false;
    } catch (error) {
      console.error('更新API密钥失败:', error);
      return false;
    }
  };

  // 批量更新API配置
  const updateAPIConfig = async (config: Partial<APIConfig>): Promise<boolean> => {
    try {
      const response = await settingsApi.updateApiKeys(config);
      if (response.success) {
        setApiConfig(prev => ({ ...prev, ...config }));
        return true;
      }
      return false;
    } catch (error) {
      console.error('更新API配置失败:', error);
      return false;
    }
  };

  // 验证单个API密钥（需要登录）
  const validateAPIKey = async (provider: keyof APIConfig, key: string): Promise<boolean> => {
    if (!key.trim()) return false;
    
    // 检查用户是否已登录
    if (!isAuthenticated) {
      console.error('用户未登录，无法验证API密钥');
      return false;
    }

    try {
      setApiStatus(prev => ({
        ...prev,
        [provider]: { ...prev[provider], isChecking: true }
      }));

      const response = await settingsApi.validateApiKey(provider, key);

      setApiStatus(prev => ({
        ...prev,
        [provider]: {
          isValid: response.success,
          isChecking: false,
          lastChecked: new Date(),
          error: response.success ? undefined : response.message
        }
      }));

      return response.success;
    } catch (error) {
      setApiStatus(prev => ({
        ...prev,
        [provider]: {
          isValid: false,
          isChecking: false,
          lastChecked: new Date(),
          error: '验证失败'
        }
      }));
      return false;
    }
  };

  // 验证所有密钥（需要登录）
  const validateAllKeys = async () => {
    // 检查用户是否已登录
    if (!isAuthenticated) {
      console.error('用户未登录，无法验证API密钥');
      return;
    }

    const providers = Object.keys(apiConfig) as (keyof APIConfig)[];
    const promises = providers.map(provider => {
      if (apiConfig[provider]) {
        return validateAPIKey(provider, apiConfig[provider]);
      }
      return Promise.resolve(false);
    });
    await Promise.all(promises);
  };

  // 刷新配置
  const refreshConfig = async () => {
    try {
      setIsLoading(true);
      const response = await settingsApi.getUserSettings();
      if (response.success && response.data?.api_keys) {
        const apiKeys = response.data.api_keys;
        // 确保所有属性都有默认值
        const fullConfig: APIConfig = {
          openai: apiKeys.openai || '',
          claude: apiKeys.claude || '',
          gemini: apiKeys.gemini || '',
          deepseek: apiKeys.deepseek || '',
          kimi: apiKeys.kimi || '',
          baidu: apiKeys.baidu || '',
          zhipu: apiKeys.zhipu || ''
        };
        setApiConfig(fullConfig);

        // 验证所有已配置的密钥
        Object.entries(apiKeys).forEach(([provider, key]) => {
          if (key) {
            validateAPIKey(provider as keyof APIConfig, key);
          }
        });
      }
    } catch (error) {
      console.error('刷新API配置失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 获取可用提供商列表
  const getAvailableProviders = (): string[] => {
    return ['openai', 'claude', 'gemini', 'deepseek', 'kimi', 'baidu', 'zhipu'];
  };

  // 检查提供商是否已配置
  const isProviderConfigured = (provider: keyof APIConfig): boolean => {
    return Boolean(apiConfig[provider]);
  };

  // 初始化时加载配置 - 只在用户已认证时执行
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      refreshConfig();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, authLoading]);

  const value: APIConfigContextType = {
    apiConfig,
    apiStatus,
    isLoading,
    hasValidAPI,
    updateAPIKey,
    updateAPIConfig,
    validateAPIKey,
    validateAllKeys,
    refreshConfig,
    getAvailableProviders,
    isProviderConfigured
  };

  return (
    <APIConfigContext.Provider value={value}>
      {children}
    </APIConfigContext.Provider>
  );
}