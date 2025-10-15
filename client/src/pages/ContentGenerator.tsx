import React, { useState, useEffect, useCallback } from 'react';
import { 
  Wand2, 
  FileText, 
  Share2, 
  Mail, 
  Megaphone, 
  BookOpen, 
  ShoppingBag, 
  Newspaper, 
  Book,
  Settings,
  Copy,
  Trash2,
  History,
  Plus,
  Minus,
  Sparkles,
  RefreshCw,
  Edit3,
  Layers
} from 'lucide-react';
import { useAPIConfig } from '../contexts/APIConfigContext';
import { useAuth } from '../contexts/AuthContext';
import APIConfigGuard from '../components/APIConfigGuard';
import { aiApi, contentApi } from '../services/api';
import { ApiResponse, Template, Templates, ContentGenerateResponse, ContentOptimizeResponse } from '../types';
import './ContentGenerator.css';



interface Model {
  id: string;
  name: string;
  provider: string;
  description: string;
}

interface BatchResult {
  prompt: string;
  content: string;
}

function ContentGenerator() {
  const { hasValidAPI, isLoading: apiLoading } = useAPIConfig();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [contentType, setContentType] = useState('article');
  const [prompt, setPrompt] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [templates, setTemplates] = useState<Templates>({});
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [model, setModel] = useState('gpt-3.5-turbo');
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(2000);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationType, setOptimizationType] = useState('grammar');
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [batchPrompts, setBatchPrompts] = useState(['']);
  const [batchResults, setBatchResults] = useState<BatchResult[]>([]);
  const [batchOptimizing, setBatchOptimizing] = useState<{[key: number]: boolean}>({});
  const [history, setHistory] = useState<Array<{
    id: number;
    timestamp: string;
    contentType: string;
    template: string;
    prompt: string;
    content: string;
    model: string;
    temperature: number;
    maxTokens: number;
  }>>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [models, setModels] = useState<Model[]>([]);

  const contentTypes = [
    { value: 'article', label: '文章', icon: FileText },
    { value: 'social', label: '社交媒体', icon: Share2 },
    { value: 'email', label: '邮件', icon: Mail },
    { value: 'ad', label: '广告', icon: Megaphone },
    { value: 'blog', label: '博客', icon: BookOpen },
    { value: 'product', label: '产品', icon: ShoppingBag },
    { value: 'news', label: '新闻', icon: Newspaper },
    { value: 'story', label: '故事', icon: Book }
  ];

  const optimizationTypes = [
    { value: 'grammar', label: '语法检查' },
    { value: 'style', label: '风格优化' },
    { value: 'seo', label: 'SEO优化' },
    { value: 'length', label: '长度调整' },
    { value: 'tone', label: '语气调整' }
  ];

  const loadTemplates = async () => {
    try {
      const result = await contentApi.getTemplates() as ApiResponse<Templates>;
      if (result.success && result.data) {
        setTemplates(result.data);
      }
    } catch (error) {
      console.error('加载模板失败:', error);
    }
  };

  const loadModels = useCallback(async () => {
    try {
      const response = await aiApi.getModels();

      if (response.success) {
        // 将后端返回的模型数据转换为前端需要的格式
        const modelList: Model[] = [];

        // 处理每个提供商的模型
        for (const [provider, modelIds] of Object.entries(response.data as Record<string, string[]>)) {
          if (Array.isArray(modelIds)) {
            modelIds.forEach((modelId: string) => {
              const modelInfo = getModelInfo(modelId, provider);
              modelList.push(modelInfo);
            });
          }
        }

        setModels(modelList);
        if (modelList.length > 0 && !model) {
          setModel(modelList[0].id);
        }
      } else {
        throw new Error('获取模型列表失败');
      }
    } catch (error) {
      console.error('加载模型失败:', error);
      // 如果API调用失败，使用默认模型
      const defaultModels: Model[] = [
        { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'openai', description: '快速响应，适合日常对话' }
      ];
      setModels(defaultModels);
      if (!model) {
        setModel(defaultModels[0].id);
      }
    }
  }, [model]);

  useEffect(() => {
    // 只有在用户已认证且不在加载状态时才加载模板
    if (isAuthenticated && !authLoading) {
      loadTemplates();
    }
  }, [isAuthenticated, authLoading]);

  // 在API配置加载完成后加载模型
  useEffect(() => {
    if (!apiLoading && hasValidAPI) {
      loadModels();
    }
  }, [apiLoading, hasValidAPI, loadModels]);

  const getModelInfo = (modelId: string, provider: string): Model => {
    const modelMap: Record<string, { name: string; description: string }> = {
      // OpenAI 模型
      'gpt-3.5-turbo': { name: 'GPT-3.5 Turbo', description: '快速响应，适合日常对话' },
      'gpt-4': { name: 'GPT-4', description: '更强大的推理能力' },
      'gpt-4-turbo': { name: 'GPT-4 Turbo', description: '更快的GPT-4版本' },
      'gpt-4o': { name: 'GPT-4o', description: 'OpenAI最新多模态模型' },
      'gpt-4o-mini': { name: 'GPT-4o Mini', description: 'GPT-4o的轻量版本' },
      
      // Claude 模型
      'claude-3-haiku': { name: 'Claude 3 Haiku', description: 'Anthropic快速响应模型' },
      'claude-3-sonnet': { name: 'Claude 3 Sonnet', description: 'Anthropic平衡性能模型' },
      'claude-3-opus': { name: 'Claude 3 Opus', description: 'Anthropic最强推理模型' },
      'claude-3-5-sonnet': { name: 'Claude 3.5 Sonnet', description: 'Anthropic最新模型' },
      
      // Gemini 模型
      'gemini-pro': { name: 'Gemini Pro', description: 'Google AI专业模型' },
      'gemini-pro-vision': { name: 'Gemini Pro Vision', description: 'Google AI多模态模型' },
      'gemini-1.5-pro': { name: 'Gemini 1.5 Pro', description: 'Google AI最新模型' },
      'gemini-1.5-flash': { name: 'Gemini 1.5 Flash', description: 'Google AI快速模型' },
      
      // 百度模型
      'ERNIE-Bot': { name: '文心一言', description: '百度AI大模型' },
      'ERNIE-Bot-turbo': { name: '文心一言 Turbo', description: '百度AI大模型快速版' },
      'ERNIE-Bot-4': { name: '文心一言 4.0', description: '百度最新AI大模型' },
      
      // DeepSeek 模型
      'deepseek-chat': { name: 'DeepSeek Chat', description: 'DeepSeek对话模型' },
      'deepseek-coder': { name: 'DeepSeek Coder', description: 'DeepSeek代码模型' },
      
      // Kimi 模型
      'moonshot-v1-8k': { name: 'Kimi 8K', description: 'Kimi AI 8K上下文' },
      'moonshot-v1-32k': { name: 'Kimi 32K', description: 'Kimi AI 32K上下文' },
      'moonshot-v1-128k': { name: 'Kimi 128K', description: 'Kimi AI 128K上下文' },
      
      // 智谱AI 模型
      'glm-4': { name: 'GLM-4', description: '智谱AI最新模型' },
      'glm-4-air': { name: 'GLM-4 Air', description: '智谱AI轻量模型' },
      'glm-4-flash': { name: 'GLM-4 Flash', description: '智谱AI快速模型' },
      'glm-3-turbo': { name: 'GLM-3 Turbo', description: '智谱AI高效模型' }
    };
    
    const info = modelMap[modelId] || { name: modelId, description: '智能AI模型' };
    return {
      id: modelId,
      name: info.name,
      provider,
      description: info.description
    };
  };

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template);
    setPrompt(template.prompt);
  };

  const generateContent = async () => {
    if (!prompt.trim()) {
      alert('请输入内容提示词');
      return;
    }

    setIsGenerating(true);
    try {
      // 构建完整的提示词，包含内容类型和模板信息
      let fullPrompt = prompt;
      if (selectedTemplate) {
        fullPrompt = `${selectedTemplate.prompt}\n\n用户需求：${prompt}`;
      } else {
        // 根据内容类型添加上下文
        const typeContext: { [key: string]: string } = {
          'article': '请生成一篇文章：',
          'social': '请生成社交媒体内容：',
          'email': '请生成邮件内容：',
          'ad': '请生成广告文案：',
          'blog': '请生成一篇博客文章：',
          'product': '请生成产品描述：',
          'news': '请生成一篇新闻稿：',
          'story': '请生成一个故事：'
        };
        fullPrompt = `${typeContext[contentType] || '请生成内容：'}${prompt}`;
      }

      const result = await contentApi.generateContent({
        type: contentType,
        prompt: fullPrompt,
        model: model,
        options: {
          temperature: temperature,
          maxTokens: maxTokens
        }
      });

      if (result.success) {
        const response = result as ApiResponse<ContentGenerateResponse>;
        if (response.data) {
          setGeneratedContent(response.data.content);
          
          // 添加到历史记录
          const historyItem = {
            id: Date.now(),
            timestamp: new Date().toLocaleString(),
            contentType,
            template: selectedTemplate?.name || '自定义',
            prompt,
            content: response.data.content,
            model,
            temperature,
            maxTokens
          };
          setHistory(prev => [historyItem, ...prev.slice(0, 19)]); // 保留最近20条记录
        }
        } else {
          alert(result.message || '生成失败');
        }
    } catch (error) {
      console.error('生成内容失败:', error);
      alert('生成失败，请重试');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleBatchGenerate = async () => {
    if (!batchPrompts.some(p => p.trim())) {
      alert('请至少输入一个提示词');
      return;
    }

    setIsGenerating(true);
    setBatchResults([]);

    try {
      const results = [];
      for (const prompt of batchPrompts) {
        if (!prompt.trim()) continue;

        // 构建完整的提示词
        let fullPrompt = prompt.trim();
        if (selectedTemplate) {
          fullPrompt = `${selectedTemplate.prompt}\n\n用户需求：${prompt.trim()}`;
        } else {
          const typeContext: { [key: string]: string } = {
            'article': '请生成一篇文章：',
            'social': '请生成社交媒体内容：',
            'email': '请生成邮件内容：',
            'ad': '请生成广告文案：',
            'blog': '请生成一篇博客文章：',
            'product': '请生成产品描述：',
            'news': '请生成一篇新闻稿：',
            'story': '请生成一个故事：'
          };
          fullPrompt = `${typeContext[contentType] || '请生成内容：'}${prompt.trim()}`;
        }

        try {
          const result = await contentApi.generateContent({
            type: contentType,
            prompt: fullPrompt,
            model: model,
            options: {
              temperature: temperature,
              maxTokens: maxTokens
            }
          });

          if (result.success) {
            const response = result as ApiResponse<ContentGenerateResponse>;
            results.push({
              prompt: prompt.trim(),
              content: response.data?.content || '生成失败'
            });
          } else {
            results.push({
              prompt: prompt.trim(),
              content: '生成失败，请重试'
            });
          }
        } catch (error) {
          results.push({
            prompt: prompt.trim(),
            content: '生成失败，请重试'
          });
        }
      }
      setBatchResults(results);
    } catch (error) {
      console.error('批量生成失败:', error);
      alert('批量生成失败，请重试');
    } finally {
      setIsGenerating(false);
    }
  };

  const addBatchPrompt = () => {
    setBatchPrompts([...batchPrompts, '']);
  };

  const removeBatchPrompt = (index: number) => {
    setBatchPrompts(batchPrompts.filter((_, i) => i !== index));
  };

  const updateBatchPrompt = (index: number, value: string) => {
    const newPrompts = [...batchPrompts];
    newPrompts[index] = value;
    setBatchPrompts(newPrompts);
  };

  const optimizeContent = async () => {
    if (!generatedContent.trim()) {
      alert('请先生成内容');
      return;
    }

    setIsOptimizing(true);
    try {
      const result = await contentApi.optimizeContent({
        content: generatedContent,
        type: optimizationType
      });

      if (result.success) {
        const response = result as ApiResponse<ContentOptimizeResponse>;
        if (response.data) {
          setGeneratedContent(response.data.optimizedContent);
        }
      } else {
        alert(result.message || '优化失败');
      }
    } catch (error) {
      console.error('优化内容失败:', error);
      alert('优化失败，请重试');
    } finally {
      setIsOptimizing(false);
    }
  };

  const optimizeBatchContent = async (index: number, content: string, type: string = 'grammar') => {
    setBatchOptimizing(prev => ({ ...prev, [index]: true }));
    try {
      const result = await contentApi.optimizeContent({
        content: content,
        type: type
      });

      if (result.success) {
        const response = result as ApiResponse<ContentOptimizeResponse>;
        if (response.data) {
          setBatchResults(prev => 
            prev.map((item, i) => 
              i === index 
                ? { ...item, content: response.data!.optimizedContent }
                : item
            )
          );
        }
      } else {
        alert(result.message || '优化失败');
      }
    } catch (error) {
      console.error('优化内容失败:', error);
      alert('优化失败，请重试');
    } finally {
      setBatchOptimizing(prev => ({ ...prev, [index]: false }));
    }
  };

  const copyToClipboard = (content?: string) => {
    const textToCopy = content || generatedContent;
    navigator.clipboard.writeText(textToCopy);
    alert('内容已复制到剪贴板');
  };

  const clearContent = () => {
    setGeneratedContent('');
    setPrompt('');
    setSelectedTemplate(null);
  };

  return (
    <APIConfigGuard fallbackMessage="内容生成工具需要配置AI API密钥才能正常工作。请前往设置页面配置您的AI服务API密钥。">
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-0">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                  <Wand2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900">内容生成工具</h1>
                  <p className="text-gray-600 mt-1 text-sm sm:text-base">使用AI助手快速生成高质量的各类内容</p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button 
                    className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      !isBatchMode 
                        ? 'bg-white text-gray-900 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                    onClick={() => setIsBatchMode(false)}
                  >
                    单个生成
                  </button>
                  <button 
                    className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      isBatchMode 
                        ? 'bg-white text-gray-900 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                    onClick={() => setIsBatchMode(true)}
                  >
                    批量生成
                  </button>
                </div>
                <button 
                  className={`p-2 rounded-lg transition-all duration-200 flex items-center justify-center ${
                    showHistory 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  onClick={() => setShowHistory(!showHistory)}
                >
                  <History className="w-5 h-5" />
                  <span className="ml-2 text-sm sm:hidden">历史记录</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8 lg:items-start">
            {/* Left Sidebar - Configuration */}
            <div className="lg:col-span-1 space-y-4 lg:space-y-6 lg:h-full flex flex-col">
              {/* Content Type Selection */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">内容类型</h3>
                </div>
                <div className="p-4 sm:p-6">
                  <div className="grid grid-cols-1 gap-2 sm:gap-3">
                    {contentTypes.map(type => {
                      const IconComponent = type.icon;
                      return (
                        <button
                          key={type.value}
                          className={`flex items-center space-x-3 p-3 rounded-lg border transition-all duration-200 ${
                            contentType === type.value
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                          onClick={() => setContentType(type.value)}
                        >
                          <IconComponent className="w-5 h-5" />
                          <span className="text-sm font-medium">{type.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Templates */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex-1 flex flex-col">
                <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">模板选择</h3>
                    {selectedTemplate && (
                      <button
                        onClick={() => {
                          setSelectedTemplate(null);
                          setPrompt('');
                        }}
                        className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        清除
                      </button>
                    )}
                  </div>
                </div>
                <div className="p-4 sm:p-6 flex-1 flex flex-col">
                  {selectedTemplate && (
                    <div className="mb-4 p-4 bg-gradient-to-r from-blue-500 to-purple-600 border-2 border-blue-400 rounded-xl flex-shrink-0 shadow-lg shadow-blue-500/25 relative overflow-hidden">
                      {/* 装饰性背景元素 */}
                      <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10"></div>
                      <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full translate-y-8 -translate-x-8"></div>
                      
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                              <Sparkles className="w-3 h-3 text-yellow-800 animate-pulse" />
                            </div>
                            <span className="text-sm font-semibold text-white">已选择模板</span>
                          </div>
                          <div className="px-2 py-1 bg-white/20 rounded-full">
                            <span className="text-xs text-white font-medium">✓ 已应用</span>
                          </div>
                        </div>
                        <h4 className="text-white font-bold text-base mb-1">{selectedTemplate.name}</h4>
                        <p className="text-blue-100 text-xs leading-relaxed">{selectedTemplate.description}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-3 flex-1 overflow-y-auto min-h-0">
                    {templates[contentType]?.length > 0 ? (
                      templates[contentType].map(template => (
                        <button
                          key={template.id}
                          className={`group w-full p-4 rounded-xl text-left transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1 ${
                            selectedTemplate?.id === template.id
                              ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25 border-2 border-blue-400'
                              : 'bg-gradient-to-r from-white to-gray-50 hover:from-blue-50 hover:to-purple-50 border border-gray-200 hover:border-blue-300 shadow-sm hover:shadow-md text-gray-900'
                          }`}
                          onClick={() => handleTemplateSelect(template)}
                        >
                          <div className={`flex items-center space-x-2 mb-2 ${
                            selectedTemplate?.id === template.id ? 'text-white' : 'text-gray-900'
                          }`}>
                            <Sparkles className={`w-4 h-4 transition-all duration-300 ${
                              selectedTemplate?.id === template.id 
                                ? 'text-yellow-300 animate-pulse' 
                                : 'text-blue-500 group-hover:text-purple-500'
                            }`} />
                            <div className="font-semibold text-sm">{template.name}</div>
                          </div>
                          <div className={`text-xs leading-relaxed ${
                            selectedTemplate?.id === template.id 
                              ? 'text-blue-100' 
                              : 'text-gray-600 group-hover:text-gray-700'
                          }`}>
                            {template.description}
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="text-center py-12 flex-1 flex flex-col justify-center relative">
                        {/* 装饰性背景 */}
                        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg opacity-50"></div>
                        <div className="absolute top-4 left-4 w-8 h-8 bg-blue-200 rounded-full opacity-20"></div>
                        <div className="absolute bottom-6 right-6 w-6 h-6 bg-purple-200 rounded-full opacity-30"></div>
                        <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full opacity-10 -translate-x-1/2 -translate-y-1/2"></div>
                        
                        <div className="relative z-10">
                          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                            <FileText className="w-8 h-8 text-white" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-700 mb-2">
                            暂无{contentTypes.find(t => t.value === contentType)?.label}模板
                          </h3>
                          <p className="text-sm text-gray-500 mb-4 max-w-xs mx-auto leading-relaxed">
                            还没有为此内容类型创建模板，但您可以直接输入提示词开始创作
                          </p>
                          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-200">
                            <Sparkles className="w-4 h-4 text-blue-500" />
                            <span className="text-xs text-gray-600 font-medium">直接输入提示词试试吧</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Content Area */}
            <div className="lg:col-span-3 space-y-4 lg:space-y-6 lg:h-full flex flex-col">
              {/* Model Settings */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-pink-50">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Settings className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600" />
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-black">模型设置</h3>
                  </div>
                </div>
                <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                  {/* Model Selection */}
                  <div>
                    <label className="block text-sm sm:text-base font-medium text-black mb-2 sm:mb-3">选择模型</label>
                    <select
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      className="w-full p-3 sm:p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-gray-50 focus:bg-white text-black text-sm sm:text-base"
                    >
                      {models.length > 0 ? (
                        models.map(modelOption => (
                          <option key={modelOption.id} value={modelOption.id}>
                            {modelOption.name} - {modelOption.description}
                          </option>
                        ))
                      ) : (
                        <option value="gpt-3.5-turbo">GPT-3.5 Turbo - 快速响应，适合日常对话</option>
                      )}
                    </select>
                  </div>

                  {/* Creativity/Temperature Slider */}
                  <div>
                    <div className="flex justify-between items-center mb-2 sm:mb-3">
                      <label className="text-sm sm:text-base font-medium text-black">创意程度</label>
                      <span className="text-xs sm:text-sm text-black bg-gray-100 px-2 py-1 rounded-full">
                        {temperature === 0.3 ? '保守' : temperature === 0.7 ? '平衡' : '创新'}
                      </span>
                    </div>
                    <div className="relative">
                      <input
                        type="range"
                        min="0.1"
                        max="1.0"
                        step="0.1"
                        value={temperature}
                        onChange={(e) => setTemperature(parseFloat(e.target.value))}
                        className="w-full h-2 bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 rounded-lg appearance-none cursor-pointer slider"
                      />
                      <div className="flex justify-between text-xs text-gray-400 mt-1">
                        <span>保守</span>
                        <span>平衡</span>
                        <span>创新</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Input Section */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex-shrink-0">
                <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Edit3 className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                      </div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                        {isBatchMode ? '批量提示词输入' : '内容提示词输入'}
                      </h3>
                    </div>
                    {!isBatchMode && (
                      <button
                        onClick={clearContent}
                        className="px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base"
                      >
                        <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="hidden sm:inline">清空</span>
                      </button>
                    )}
                  </div>
                </div>
                <div className="p-4 sm:p-6">
                  {!isBatchMode ? (
                    <div className="space-y-4 sm:space-y-6">
                      <div className="relative">
                        <textarea
                          value={prompt}
                          onChange={(e) => setPrompt(e.target.value)}
                          placeholder="请详细描述您想要生成的内容，越具体效果越好..."
                          className="w-full h-32 sm:h-40 p-3 sm:p-4 border-2 border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white text-sm sm:text-base"
                        />
                        <div className="absolute bottom-2 sm:bottom-3 right-2 sm:right-3 text-xs text-gray-400">
                          {prompt.length}/2000
                        </div>
                      </div>
                      <div>
                        <button
                          onClick={generateContent}
                          disabled={isGenerating || !prompt.trim()}
                          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 transform hover:scale-[1.02] text-sm sm:text-base"
                        >
                          {isGenerating ? (
                            <>
                              <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                              生成中...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                              开始生成
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {batchPrompts.map((prompt, index) => (
                        <div key={index} className="flex gap-3">
                          <div className="flex-1 relative">
                            <textarea
                              value={prompt}
                              onChange={(e) => updateBatchPrompt(index, e.target.value)}
                              placeholder={`提示词 ${index + 1}...`}
                              className="w-full h-20 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            />
                            <div className="absolute top-2 right-2 text-xs text-gray-400 bg-white px-2 py-1 rounded">
                              {index + 1}
                            </div>
                          </div>
                          <button
                            onClick={() => removeBatchPrompt(index)}
                            className="p-3 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                          >
                            <Minus className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                      <div className="flex gap-3">
                        <button
                          onClick={addBatchPrompt}
                          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 flex items-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          添加提示词
                        </button>
                        <button
                          onClick={handleBatchGenerate}
                          disabled={isGenerating || batchPrompts.every(p => !p.trim())}
                          className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25"
                        >
                          {isGenerating ? (
                            <>
                              <RefreshCw className="w-5 h-5 animate-spin" />
                              批量生成中...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-5 h-5" />
                              批量生成
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Output Section */}
              {!isBatchMode ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex-1 flex flex-col">
                  <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                          <FileText className="w-4 h-4 text-green-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">生成结果</h3>
                      </div>
                      {generatedContent && (
                        <div className="flex items-center gap-3">
                          <select
                            value={optimizationType}
                            onChange={(e) => setOptimizationType(e.target.value)}
                            className="px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                          >
                            {optimizationTypes.map(type => (
                              <option key={type.value} value={type.value}>{type.label}</option>
                            ))}
                          </select>
                          <button
                            onClick={optimizeContent}
                            disabled={isOptimizing}
                            className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 disabled:opacity-50 transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105"
                          >
                            {isOptimizing ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <Sparkles className="w-4 h-4" />
                            )}
                            优化
                          </button>
                          <button
                            onClick={() => copyToClipboard()}
                            className="px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105"
                          >
                            <Copy className="w-4 h-4" />
                            复制
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex-1 min-h-80 p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-gray-200 flex flex-col">
                      {generatedContent ? (
                        <div className="prose max-w-none">
                          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                            {generatedContent.split('\n').map((line, index) => (
                              <p key={index} className="mb-4 text-gray-800 leading-relaxed text-base">
                                {line}
                              </p>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center flex-1 text-gray-500">
                          <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                            <FileText className="w-10 h-10 text-blue-600" />
                          </div>
                          <p className="text-xl font-medium mb-3 text-gray-700">等待生成内容</p>
                          <p className="text-sm text-gray-500 text-center max-w-md">
                            请在上方输入提示词，点击"开始生成"按钮，AI将为您创建精彩的内容
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex-1 flex flex-col">
                  <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-pink-50">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Layers className="w-4 h-4 text-purple-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">批量生成结果</h3>
                      {batchResults.length > 0 && (
                        <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full font-medium">
                          {batchResults.length} 条结果
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="p-6">
                    {batchResults.length > 0 ? (
                      <div className="space-y-6 max-h-96 overflow-y-auto">
                        {batchResults.map((result, index) => (
                          <div key={index} className="border-2 border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200">
                            <div className="px-5 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <span className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg flex items-center justify-center text-sm font-bold shadow-md">
                                    {index + 1}
                                  </span>
                                  <span className="font-semibold text-gray-900">内容 {index + 1}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <select
                                    className="text-sm bg-white border-2 border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                    defaultValue="grammar"
                                    onChange={(e) => {
                                      const selectElement = e.target as HTMLSelectElement;
                                      selectElement.dataset.optimizationType = e.target.value;
                                    }}
                                  >
                                    {optimizationTypes.map(type => (
                                      <option key={type.value} value={type.value}>{type.label}</option>
                                    ))}
                                  </select>
                                  <button 
                                    onClick={(e) => {
                                      const selectElement = e.currentTarget.parentElement?.querySelector('select') as HTMLSelectElement;
                                      const optimizationType = selectElement?.value || 'grammar';
                                      optimizeBatchContent(index, result.content, optimizationType);
                                    }}
                                    disabled={batchOptimizing[index]}
                                    className="p-2 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded-lg transition-all duration-200 disabled:opacity-50 shadow-sm hover:shadow-md transform hover:scale-105"
                                  >
                                    {batchOptimizing[index] ? (
                                      <RefreshCw className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <Sparkles className="w-4 h-4" />
                                    )}
                                  </button>
                                  <button 
                                    onClick={() => copyToClipboard(result.content)}
                                    className="p-2 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105"
                                  >
                                    <Copy className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                            <div className="p-5">
                              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-sm text-blue-800 font-medium">提示词：</p>
                                <p className="text-sm text-blue-700 mt-1">{result.prompt}</p>
                              </div>
                              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                                <div className="text-gray-800 leading-relaxed text-base">
                                  {result.content}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-80 text-gray-500">
                        <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                          <Layers className="w-10 h-10 text-purple-600" />
                        </div>
                        <p className="text-xl font-medium mb-3 text-gray-700">等待批量生成</p>
                        <p className="text-sm text-gray-500 text-center max-w-md">
                          请在上方添加多个提示词，点击"批量生成"按钮，AI将为您批量创建内容
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* History Section */}
              {showHistory && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">生成历史</h3>
                      <span className="text-sm text-gray-500">{history.length} 条记录</span>
                    </div>
                  </div>
                  <div className="p-6">
                    {history.length > 0 ? (
                      <div className="space-y-4 max-h-96 overflow-y-auto">
                        {history.map((item) => (
                          <div key={item.id} className="border border-gray-200 rounded-lg overflow-hidden">
                            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                                    {item.template}
                                  </span>
                                  <span className="text-sm text-gray-500">{item.timestamp}</span>
                                </div>
                                <div className="flex gap-2">
                                  <button 
                                    onClick={() => {
                                      setPrompt(item.prompt);
                                      setContentType(item.contentType);
                                      setModel(item.model);
                                      setTemperature(item.temperature);
                                      setMaxTokens(item.maxTokens);
                                    }}
                                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-all duration-200"
                                  >
                                    重新使用
                                  </button>
                                  <button 
                                    onClick={() => navigator.clipboard.writeText(item.content)}
                                    className="p-1 text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
                                  >
                                    <Copy className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                            <div className="p-4">
                              <p className="text-sm text-gray-600 mb-3">
                                <strong>提示词：</strong> {item.prompt}
                              </p>
                              <div className="text-gray-800 text-sm leading-relaxed">
                                {item.content}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-32 text-gray-500">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mb-3">
                          <History className="w-6 h-6 text-gray-400" />
                        </div>
                        <p className="text-lg font-medium mb-1">暂无历史记录</p>
                        <p className="text-sm text-gray-400">生成的内容会自动保存在这里</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </APIConfigGuard>
  );
}

export default ContentGenerator;