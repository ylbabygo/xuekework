import React, { ReactNode } from 'react';
import { useAPIConfig } from '../contexts/APIConfigContext';
import { AlertTriangle, Settings, Key, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface APIConfigGuardProps {
  children: ReactNode;
  requiredProviders?: string[];
  fallbackMessage?: string;
}

const APIConfigGuard: React.FC<APIConfigGuardProps> = ({ 
  children, 
  requiredProviders = [],
  fallbackMessage 
}) => {
  const { 
    hasValidAPI, 
    isLoading, 
    apiStatus, 
    getAvailableProviders,
    refreshConfig 
  } = useAPIConfig();
  const navigate = useNavigate();

  // 如果正在加载，显示加载状态
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">正在加载API配置...</p>
        </div>
      </div>
    );
  }

  // 检查是否有必需的提供商
  const availableProviders = getAvailableProviders();
  const hasRequiredProviders = requiredProviders.length === 0 || 
    requiredProviders.some(provider => availableProviders.includes(provider));

  // 如果没有有效的API配置或缺少必需的提供商，显示配置引导
  if (!hasValidAPI || !hasRequiredProviders) {
    return (
      <div className="min-h-[400px] flex items-center justify-center p-6">
        <div className="max-w-md mx-auto text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-8 h-8 text-yellow-600" />
          </div>
          
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            需要配置AI API密钥
          </h3>
          
          <p className="text-gray-600 mb-6">
            {fallbackMessage || 
              (requiredProviders.length > 0 
                ? `此功能需要配置以下AI服务的API密钥：${requiredProviders.join('、')}`
                : '请先配置至少一个AI服务的API密钥才能使用AI功能'
              )
            }
          </p>

          {/* 显示当前API状态 */}
          {Object.keys(apiStatus).length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3">当前API状态：</h4>
              <div className="space-y-2">
                {Object.entries(apiStatus).map(([provider, status]) => (
                  <div key={provider} className="flex items-center justify-between text-sm">
                    <span className="capitalize text-gray-700">{provider}</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      status.isValid 
                        ? 'bg-green-100 text-green-800' 
                        : status.isChecking
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {status.isChecking ? '验证中...' : status.isValid ? '已配置' : '未配置'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate('/settings')}
              className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Settings className="w-4 h-4" />
              前往设置
            </button>
            
            <button
              onClick={refreshConfig}
              className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              刷新状态
            </button>
          </div>

          {/* 快速配置提示 */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-start gap-3">
              <Key className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-left">
                <h5 className="text-sm font-medium text-blue-900 mb-1">
                  快速开始
                </h5>
                <p className="text-sm text-blue-700">
                  推荐配置 DeepSeek API（性价比高）或 OpenAI API（功能强大）。
                  配置完成后，所有AI功能将自动可用。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 如果有有效的API配置，渲染子组件
  return <>{children}</>;
};

export default APIConfigGuard;