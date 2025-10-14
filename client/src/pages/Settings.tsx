import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Key,
  Palette,
  Globe,
  Bell,
  Save,
  Check,
  X
} from 'lucide-react';
import { settingsApi } from '../services/api';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import toast from 'react-hot-toast';

interface UserSettings {
  theme: 'light' | 'dark' | 'auto';
  language: 'zh' | 'en';
  api_keys: {
    openai?: string;
    claude?: string;
    gemini?: string;
    deepseek?: string;
    kimi?: string;
    baidu?: string;
    zhipu?: string;
  };
  notification_settings: {
    email_notifications: boolean;
    push_notifications: boolean;
    task_reminders: boolean;
  };
}

const Settings: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  const [settings, setSettings] = useState<UserSettings>({
    theme: theme,
    language: language,
    api_keys: {
      openai: '',
      claude: '',
      gemini: '',
      deepseek: '',
      kimi: '',
      baidu: '',
      zhipu: ''
    },
    notification_settings: {
      email_notifications: true,
      push_notifications: true,
      task_reminders: true
    }
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [validationStatus, setValidationStatus] = useState<Record<string, 'valid' | 'invalid' | 'checking' | 'empty'>>({});

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await settingsApi.getUserSettings();
      if (response.success && response.data) {
        const safeSettings = {
          ...response.data,
          api_keys: response.data.api_keys || {
            openai: '',
            claude: '',
            gemini: '',
            deepseek: '',
            kimi: '',
            baidu: '',
            zhipu: ''
          },
          notification_settings: response.data.notification_settings || {
            email_notifications: true,
            push_notifications: true,
            task_reminders: true
          }
        };
        setSettings(safeSettings);
      }
    } catch (error) {
      console.error('加载设置失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      setSaveStatus('idle');

      const response = await settingsApi.updateUserSettings(settings);
      if (response.success) {
        setSaveStatus('success');
        setTimeout(() => setSaveStatus('idle'), 3000);
      } else {
        setSaveStatus('error');
      }
    } catch (error) {
      console.error('保存设置失败:', error);
      setSaveStatus('error');
    } finally {
      setSaving(false);
    }
  };

  const updateNotificationSetting = (key: keyof UserSettings['notification_settings'], value: boolean) => {
    setSettings(prev => ({
      ...prev,
      notification_settings: {
        ...prev.notification_settings,
        [key]: value
      }
    }));
  };

  const updateAPIKey = (provider: 'openai' | 'claude' | 'gemini' | 'deepseek' | 'kimi' | 'baidu' | 'baidu_secret' | 'zhipu', value: string) => {
    setSettings(prev => ({
      ...prev,
      api_keys: {
        ...prev.api_keys,
        [provider]: value
      }
    }));
    // 清除验证状态
    setValidationStatus(prev => ({
      ...prev,
      [provider]: value.trim() ? 'empty' : 'empty'
    }));
  };

  const validateBaiduSecretKey = async () => {
    const apiKey = settings.api_keys.baidu;
    const secretKey = (settings.api_keys as any).baidu_secret;
    
    if (!apiKey?.trim() || !secretKey?.trim()) {
      toast.error('百度API需要同时配置API Key和Secret Key');
      return;
    }

    try {
      setValidationStatus(prev => ({
        ...prev,
        baidu_secret: 'checking'
      }));

      const response = await settingsApi.validateApiKey('baidu', apiKey, secretKey);
      if (response.success) {
        setValidationStatus(prev => ({
          ...prev,
          baidu: 'valid',
          baidu_secret: 'valid'
        }));
        toast.success('百度API密钥验证成功');
      } else {
        setValidationStatus(prev => ({
          ...prev,
          baidu: 'invalid',
          baidu_secret: 'invalid'
        }));
        toast.error(`百度API密钥验证失败: ${response.message}`);
      }
    } catch (error) {
      setValidationStatus(prev => ({
        ...prev,
        baidu: 'invalid',
        baidu_secret: 'invalid'
      }));
      toast.error('验证失败，请重试');
    }
  };

  const validateAPIKey = async (provider: keyof UserSettings['api_keys'], apiKey: string) => {
    if (!apiKey.trim()) {
      toast.error('请输入API密钥');
      return;
    }

    // 百度API需要特殊处理，需要两个密钥
    if (provider === 'baidu') {
      const baiduSecret = (settings.api_keys as any).baidu_secret;
      if (!baiduSecret?.trim()) {
        toast.error('百度API需要同时配置API Key和Secret Key');
        return;
      }
    }

    try {
      setValidationStatus(prev => ({
        ...prev,
        [provider]: 'checking'
      }));

      // 为百度API传递两个密钥
      const response = provider === 'baidu' 
        ? await settingsApi.validateApiKey(provider, apiKey, (settings.api_keys as any).baidu_secret)
        : await settingsApi.validateApiKey(provider, apiKey);
      if (response.success) {
        setValidationStatus(prev => ({
          ...prev,
          [provider]: 'valid'
        }));
        toast.success(`${provider} API密钥验证成功`);
      } else {
        setValidationStatus(prev => ({
          ...prev,
          [provider]: 'invalid'
        }));
        toast.error(`${provider} API密钥验证失败: ${response.message}`);
      }
    } catch (error) {
      setValidationStatus(prev => ({
        ...prev,
        [provider]: 'invalid'
      }));
      toast.error('验证失败，请重试');
    }
  };

  const getValidationIcon = (status: string | undefined) => {
    switch (status) {
      case 'valid':
        return '✅';
      case 'invalid':
        return '❌';
      case 'checking':
        return '⏳';
      default:
        return null;
    }
  };

  const getValidationColor = (status: string | undefined) => {
    switch (status) {
      case 'valid':
        return 'border-green-500 focus:ring-green-500';
      case 'invalid':
        return 'border-red-500 focus:ring-red-500';
      case 'checking':
        return 'border-yellow-500 focus:ring-yellow-500';
      default:
        return 'border-gray-300 focus:ring-blue-500';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded-lg w-1/4 mb-6"></div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <SettingsIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t('settings.title')}</h1>
              <p className="text-gray-600 mt-1">管理您的账户设置和偏好</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <Key className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">AI服务配置</h2>
              <p className="text-gray-600 text-sm">配置AI服务提供商的API密钥</p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {[
              { id: 'openai', name: 'OpenAI', placeholder: 'sk-...' },
              { id: 'claude', name: 'Claude', placeholder: 'sk-ant-...' },
              { id: 'deepseek', name: 'DeepSeek', placeholder: 'sk-...' },
              { id: 'kimi', name: 'Kimi', placeholder: 'sk-...' },
              { id: 'gemini', name: 'Gemini', placeholder: 'AIza...' },
              { id: 'zhipu', name: '智谱AI', placeholder: 'Bearer ...' }
            ].map((provider) => {
              const providerId = provider.id as keyof UserSettings['api_keys'];
              const apiKey = settings.api_keys[providerId] || '';

              return (
                <div key={provider.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        {provider.name}
                      </label>
                      {getValidationIcon(validationStatus[providerId])}
                    </div>
                    <div className="relative">
                      <input
                        type="password"
                        value={apiKey}
                        onChange={(e) => updateAPIKey(providerId, e.target.value)}
                        placeholder={provider.placeholder}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent ${getValidationColor(validationStatus[providerId])}`}
                      />
                      {validationStatus[providerId] === 'checking' && (
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => validateAPIKey(providerId, apiKey)}
                      disabled={!apiKey.trim() || validationStatus[providerId] === 'checking'}
                      className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                    >
                      {validationStatus[providerId] === 'checking' ? (
                        <>
                          <div className="animate-spin rounded-full h-3 w-3 border-b border-white"></div>
                          验证中
                        </>
                      ) : (
                        '验证'
                      )}
                    </button>
                    {apiKey.trim() && (
                      <button
                        onClick={() => updateAPIKey(providerId, '')}
                        className="px-3 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                      >
                        清除
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
            
            {/* 百度文心一言特殊配置 - 需要API Key和Secret Key */}
            <div className="border border-gray-200 rounded-lg p-4 md:col-span-2">
              <div className="mb-3">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    百度文心一言
                  </label>
                  {getValidationIcon(validationStatus['baidu'])}
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="relative">
                    <label className="block text-xs text-gray-500 mb-1">API Key</label>
                    <input
                      type="password"
                      value={settings.api_keys.baidu || ''}
                      onChange={(e) => updateAPIKey('baidu', e.target.value)}
                      placeholder="输入百度API Key"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent ${getValidationColor(validationStatus['baidu'])}`}
                    />
                  </div>
                  <div className="relative">
                    <label className="block text-xs text-gray-500 mb-1">Secret Key</label>
                    <input
                      type="password"
                      value={(settings.api_keys as any).baidu_secret || ''}
                      onChange={(e) => updateAPIKey('baidu_secret', e.target.value)}
                      placeholder="输入百度Secret Key"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent ${getValidationColor(validationStatus['baidu'])}`}
                    />
                  </div>
                </div>
                {validationStatus['baidu'] === 'checking' && (
                  <div className="flex items-center justify-center mt-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={validateBaiduSecretKey}
                  disabled={!settings.api_keys.baidu?.trim() || !(settings.api_keys as any).baidu_secret?.trim() || validationStatus['baidu'] === 'checking'}
                  className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                >
                  {validationStatus['baidu'] === 'checking' ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-b border-white"></div>
                      验证中
                    </>
                  ) : (
                    '验证'
                  )}
                </button>
                {(settings.api_keys.baidu?.trim() || (settings.api_keys as any).baidu_secret?.trim()) && (
                  <button
                    onClick={() => {
                      updateAPIKey('baidu', '');
                      updateAPIKey('baidu_secret', '');
                    }}
                    className="px-3 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                  >
                    清除
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
              <Palette className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">主题设置</h2>
              <p className="text-gray-600 text-sm">选择您喜欢的界面主题</p>
            </div>
          </div>

          <div className="grid gap-4">
            {[
              { value: 'dark', label: '深色主题', description: '适合夜间使用，减少眼部疲劳' },
              { value: 'light', label: '浅色主题', description: '适合白天使用，清晰明亮' },
              { value: 'auto', label: '自动切换', description: '根据系统设置自动切换主题' }
            ].map((theme) => (
              <label key={theme.value} className="flex items-start gap-4 p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-all group">
                <input
                  type="radio"
                  name="theme"
                  value={theme.value}
                  checked={settings.theme === theme.value}
                  onChange={(e) => {
                    const newTheme = e.target.value as 'light' | 'dark' | 'auto';
                    setTheme(newTheme);
                    setSettings(prev => ({ ...prev, theme: newTheme }));
                  }}
                  className="w-5 h-5 text-blue-600 mt-0.5 focus:ring-blue-500"
                />
                <div className="flex-1">
                  <div className="text-gray-900 font-medium group-hover:text-blue-900">{theme.label}</div>
                  <div className="text-gray-600 text-sm mt-1">{theme.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <Globe className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{t('settings.language')}</h2>
              <p className="text-gray-600 text-sm">选择您的首选语言</p>
            </div>
          </div>

          <div className="grid gap-4">
            {[
              { value: 'zh', label: '简体中文', description: '界面将显示为简体中文' },
              { value: 'en', label: 'English', description: 'Interface will be displayed in English' }
            ].map((lang) => (
              <label key={lang.value} className="flex items-start gap-4 p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-all group">
                <input
                  type="radio"
                  name="language"
                  value={lang.value}
                  checked={settings.language === lang.value}
                  onChange={(e) => {
                    const newLanguage = e.target.value as 'zh' | 'en';
                    setLanguage(newLanguage);
                    setSettings(prev => ({ ...prev, language: newLanguage }));
                  }}
                  className="w-5 h-5 text-blue-600 mt-0.5 focus:ring-blue-500"
                />
                <div className="flex-1">
                  <div className="text-gray-900 font-medium group-hover:text-blue-900">{lang.label}</div>
                  <div className="text-gray-600 text-sm mt-1">{lang.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center">
              <Bell className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">通知设置</h2>
              <p className="text-gray-600 text-sm">管理您的通知偏好</p>
            </div>
          </div>

          <div className="space-y-6">
            {([
              { key: 'email_notifications' as keyof UserSettings['notification_settings'], label: '邮件通知', description: '接收重要更新和提醒邮件' },
              { key: 'push_notifications' as keyof UserSettings['notification_settings'], label: '推送通知', description: '在浏览器中接收实时通知' },
              { key: 'task_reminders' as keyof UserSettings['notification_settings'], label: '任务提醒', description: '接收任务截止日期提醒' }
            ] as const).map((notification) => (
              <div key={notification.key} className="flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
                <div className="flex-1">
                  <div className="text-gray-900 font-medium">{notification.label}</div>
                  <div className="text-gray-600 text-sm mt-1">{notification.description}</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer ml-4">
                  <input
                    type="checkbox"
                    checked={settings.notification_settings[notification.key]}
                    onChange={(e) => updateNotificationSetting(notification.key, e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 shadow-sm"></div>
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {saveStatus === 'success' && (
                <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg">
                  <Check className="w-5 h-5" />
                  <span className="font-medium">保存成功</span>
                </div>
              )}
              {saveStatus === 'error' && (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-2 rounded-lg">
                  <X className="w-5 h-5" />
                  <span className="font-medium">保存失败</span>
                </div>
              )}
            </div>

            <button
              onClick={saveSettings}
              disabled={saving}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-medium transition-all transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
            >
              <Save className="w-5 h-5" />
              {saving ? '保存中...' : '保存设置'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;