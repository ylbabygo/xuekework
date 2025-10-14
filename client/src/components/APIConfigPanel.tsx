import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { EyeIcon, EyeSlashIcon, CheckCircleIcon, XCircleIcon, KeyIcon } from '@heroicons/react/24/outline';

interface APIProvider {
  id: string;
  name: string;
  description: string;
  placeholder: string;
  helpUrl: string;
}

const API_PROVIDERS: APIProvider[] = [
  {
    id: 'deepseek',
    name: 'DeepSeek',
    description: 'DeepSeek Chat, DeepSeek Coder等模型',
    placeholder: 'sk-...',
    helpUrl: 'https://platform.deepseek.com/api_keys'
  },
  {
    id: 'kimi',
    name: 'Kimi (月之暗面)',
    description: 'Kimi Chat等模型',
    placeholder: 'sk-...',
    helpUrl: 'https://platform.moonshot.cn/console/api-keys'
  }
];

interface APIConfigPanelProps {
  onConfigComplete?: () => void;
}

export default function APIConfigPanel({ onConfigComplete }: APIConfigPanelProps) {
  const [apiKeys, setApiKeys] = useState<{[key: string]: {value: string, isValid: boolean | null, isValidating: boolean, error?: string}}>({});
  const [showKeys, setShowKeys] = useState<{[key: string]: boolean}>({});
  const [isLoading, setIsLoading] = useState(false);
  const [hasValidKey, setHasValidKey] = useState(false);

  // 加载现有的API配置
  useEffect(() => {
    loadExistingConfig();
  }, []);

  // 检查是否有有效的API密钥
  useEffect(() => {
    const hasValid = Object.values(apiKeys).some(config => config.isValid === true);
    setHasValidKey(hasValid);
  }, [apiKeys]);

  const loadExistingConfig = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/v1/api-config/config', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        const existingConfig: any = {};

        API_PROVIDERS.forEach(provider => {
          const config = result.data.configStatus[provider.id];
          existingConfig[provider.id] = {
            value: config?.keyPreview ? '***' : '',
            isValid: config?.configured || null,
            isValidating: false
          };
        });

        setApiKeys(existingConfig);
      }
    } catch (error) {
      console.error('加载配置失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const validateAPIKey = async (providerId: string, apiKey: string) => {
    if (!apiKey.trim() || apiKey === '***') {
      toast.error('请输入完整的API密钥');
      return;
    }

    setApiKeys(prev => ({
      ...prev,
      [providerId]: {
        ...prev[providerId],
        isValidating: true,
        error: undefined
      }
    }));

    try {
      const response = await fetch('/api/v1/api-config/validate-realtime', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          provider: providerId,
          apiKey: apiKey
        })
      });

      const result = await response.json();

      setApiKeys(prev => ({
        ...prev,
        [providerId]: {
          ...prev[providerId],
          isValid: result.data.valid,
          isValidating: false,
          error: result.data.valid ? undefined : result.data.message
        }
      }));

      if (result.data.valid) {
        toast.success(`${API_PROVIDERS.find(p => p.id === providerId)?.name} API密钥验证成功`);

        // 自动保存到服务器
        await saveAPIKey(providerId, apiKey);
      } else {
        toast.error(result.data.message || 'API密钥验证失败');
      }
    } catch (error) {
      setApiKeys(prev => ({
        ...prev,
        [providerId]: {
          ...prev[providerId],
          isValid: false,
          isValidating: false,
          error: '网络错误，请检查连接'
        }
      }));
      toast.error('验证失败，请检查网络连接');
    }
  };

  const saveAPIKey = async (providerId: string, apiKey: string) => {
    try {
      const response = await fetch('/api/v1/api-config/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          provider: providerId,
          apiKey: apiKey
        })
      });

      const result = await response.json();

      if (result.success) {
        toast.success('API密钥已保存到服务器');
        if (onConfigComplete) {
          onConfigComplete();
        }
      } else {
        toast.error('保存失败: ' + result.message);
      }
    } catch (error) {
      toast.error('保存失败，请检查网络连接');
    }
  };

  const updateAPIKey = (providerId: string, value: string) => {
    setApiKeys(prev => ({
      ...prev,
      [providerId]: {
        ...prev[providerId],
        value,
        isValid: null,
        error: undefined
      }
    }));
  };

  const toggleKeyVisibility = (providerId: string) => {
    setShowKeys(prev => ({
      ...prev,
      [providerId]: !prev[providerId]
    }));
  };

  const removeAPIKey = async (providerId: string) => {
    try {
      const response = await fetch(`/api/v1/api-config/${providerId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (response.ok) {
        toast.success('API密钥已删除');
        setApiKeys(prev => ({
          ...prev,
          [providerId]: {
            value: '',
            isValid: null,
            isValidating: false
          }
        }));
      } else {
        toast.error('删除失败');
      }
    } catch (error) {
      toast.error('删除失败，请检查网络连接');
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">加载配置中...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-blue-100 rounded-lg items-center justify-center">
          <KeyIcon className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-black">AI服务配置</h3>
        <p className="text-sm text-black">配置AI服务提供商的API密钥</p>
        </div>
      </div>

      {hasValidKey && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="items-center">
            <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
            <span className="text-green-800">AI服务已配置，可以正常使用</span>
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {API_PROVIDERS.map((provider) => {
          const config = apiKeys[provider.id] || { value: '', isValid: null, isValidating: false };
          const isValidating = config.isValidating || false;
          const isValid = config.isValid || false;
          const hasError = config.error || false;
          const hasExistingKey = config.value === '***';

          return (
            <div
              key={provider.id}
              className={`border rounded-lg p-4 transition-all duration-200 ${
                isValid
                  ? 'border-green-200 bg-green-50'
                  : hasError
                  ? 'border-red-200 bg-red-50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <div className="items-start justify-between mb-3">
                <div>
                  <h4 className="font-medium text-black">{provider.name}</h4>
                <p className="text-sm text-black">{provider.description}</p>
                </div>
                <div className="items-center space-x-2">
                  {isValidating && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  )}
                  {isValid && (
                    <CheckCircleIcon className="h-5 w-5 text-green-500" />
                  )}
                  {hasError && (
                    <XCircleIcon className="h-5 w-5 text-red-500" />
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <div className="relative">
                  <input
                    type={showKeys[provider.id] ? 'text' : 'password'}
                    value={config.value}
                    onChange={(e) => updateAPIKey(provider.id, e.target.value)}
                    placeholder={hasExistingKey ? '已配置密钥' : provider.placeholder}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-20 text-black"
                  />
                  <div className="absolute inset-y-0 right-0 space-x-1 pr-3">
                    <button
                      type="button"
                      onClick={() => toggleKeyVisibility(provider.id)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {showKeys[provider.id] ? (
                        <EyeSlashIcon className="h-4 w-4" />
                      ) : (
                        <EyeIcon className="h-4 w-4" />
                      )}
                    </button>
                    {isValid && (
                      <CheckCircleIcon className="h-4 w-4 text-green-500" />
                    )}
                    {hasError && (
                      <XCircleIcon className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                </div>

                {config.error && (
                  <p className="text-sm text-red-600">{config.error}</p>
                )}

                <div className="space-x-2">
                  <button
                    onClick={() => validateAPIKey(provider.id, config.value)}
                    disabled={isValidating || (!config.value.trim() && !hasExistingKey)}
                    className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm"
                  >
                    {isValidating ? '验证中...' : '验证并保存'}
                  </button>
                  {hasExistingKey && (
                    <button
                      onClick={() => removeAPIKey(provider.id)}
                      className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
                    >
                      删除
                    </button>
                  )}
                </div>

                <a
                  href={provider.helpUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 text-xs font-medium"
                >
                  获取API密钥 →
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {!hasValidKey && (
        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="items-center">
            <svg className="h-5 w-5 text-amber-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <span className="text-black text-sm">
              请配置至少一个AI服务的API密钥以使用AI功能
            </span>
          </div>
        </div>
      )}
    </div>
  );
}