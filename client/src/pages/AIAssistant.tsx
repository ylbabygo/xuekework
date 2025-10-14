import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Plus, 
  MessageSquare, 
  Archive, 
  Trash2, 
  Edit3, 
  Settings,
  Bot,
  User,
  Copy,
  RefreshCw,
  FileText,
  BarChart3,
  Search,
  ChevronDown,
  Edit2,
  Check,
  X
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { useAPIConfig } from '../contexts/APIConfigContext';
import APIConfigGuard from '../components/APIConfigGuard';
import { aiApi } from '../services/api';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  tokens?: number;
  moduleUsed?: string;
}

interface Conversation {
  id: string;
  title: string;
  model: string;
  created_at: string;
  updated_at: string;
  message_count: number;
  is_archived: boolean;
}

interface Model {
  id: string;
  name: string;
  provider: string;
  description: string;
}

const AIAssistant: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [models, setModels] = useState<Model[]>([]);
  const [selectedModel, setSelectedModel] = useState('gpt-3.5-turbo');
  const [showSettings, setShowSettings] = useState(false);
  const [editingTitle, setEditingTitle] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // 滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 加载对话列表
  const loadConversations = async () => {
    try {
      const response = await aiApi.getConversations();
      setConversations((response.data as Conversation[]) || []);
    } catch (error) {
      console.error('加载对话列表失败:', error);
    }
  };

  // 获取模型信息的辅助函数
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

  // 加载模型列表
  const loadModels = async () => {
    try {
      console.log('正在加载AI模型列表...');
      
      const response = await aiApi.getModels();
      
      console.log('API响应数据:', response);
      
      if (response.success) {
        // 将后端返回的模型数据转换为前端需要的格式
        const modelList: Model[] = [];
        
        // 支持的所有AI提供商
        const providers = ['openai', 'claude', 'gemini', 'deepseek', 'kimi', 'baidu', 'zhipu'];
        
        providers.forEach(provider => {
          const data = response.data as Record<string, string[]>;
          if (data[provider] && Array.isArray(data[provider])) {
            console.log(`发现 ${provider} 的模型:`, data[provider]);
            data[provider].forEach((modelId: string) => {
              const modelInfo = getModelInfo(modelId, provider);
              modelList.push(modelInfo);
            });
          }
        });
        
        console.log('转换后的模型列表:', modelList);
        setModels(modelList);
        
        if (modelList.length > 0) {
          setSelectedModel(modelList[0].id);
          console.log('设置默认模型:', modelList[0].id);
        } else {
          console.warn('没有可用的AI模型，请检查API配置');
        }
      } else {
        console.error('API返回失败:', response.message);
      }
    } catch (error) {
      console.error('加载模型失败:', error);
      // 如果API调用失败，显示空列表，提示用户配置API
      setModels([]);
      setSelectedModel('');
    }
  };

  // 创建新对话
  const createNewConversation = async () => {
    try {
      const response = await aiApi.createConversation({
        title: '新对话',
        model: selectedModel
      });
      
      if (response.success) {
        const newConversation = response.data as Conversation;
        setConversations(prev => [newConversation, ...prev]);
        setCurrentConversation(newConversation);
        setMessages([]);
      }
    } catch (error) {
      console.error('创建对话失败:', error);
    }
  };

  // 保存设置
  const saveSettings = async () => {
    try {
      // 保存对话标题
      if (currentConversation) {
        const response = await aiApi.updateConversation(currentConversation.id, {
          title: currentConversation.title
        });
        
        if (response.success) {
          // 更新本地对话列表
          setConversations(prev => 
            prev.map(conv => 
              conv.id === currentConversation.id 
                ? { ...conv, title: currentConversation.title }
                : conv
            )
          );
          setShowSettings(false);
          alert('设置保存成功');
        } else {
          alert('保存设置失败');
        }
      }
    } catch (error) {
      console.error('保存设置失败:', error);
      alert('保存设置失败，请检查网络连接');
    }
  };

  // 选择对话
  const selectConversation = async (conversation: Conversation) => {
    setCurrentConversation(conversation);
    
    try {
      const response = await aiApi.getMessages(conversation.id);
      
      if (response.success) {
        setMessages((response.data as Message[]) || []);
      }
    } catch (error) {
      console.error('加载消息失败:', error);
    }
  };

  // 发送消息
  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    // 如果没有当前对话，先创建一个新对话
    let conversation = currentConversation;
    if (!conversation) {
      try {
        const response = await aiApi.createConversation({
          title: '新对话',
          model: selectedModel
        });
        
        if (response.success) {
          conversation = response.data as Conversation;
          setConversations(prev => [conversation!, ...prev]);
          setCurrentConversation(conversation);
          setMessages([]);
        } else {
          alert('创建对话失败');
          return;
        }
      } catch (error) {
        console.error('创建对话失败:', error);
        alert('创建对话失败，请检查网络连接');
        return;
      }
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await aiApi.sendMessage(conversation!.id, {
        content: inputMessage,
        model: selectedModel
      });

      if (response.success) {
        const data = response.data as any;
        const assistantMessage: Message = {
          id: data.assistantMessage.id,
          role: 'assistant',
          content: data.assistantMessage.content,
          timestamp: data.assistantMessage.timestamp,
          tokens: data.assistantMessage.tokens,
          moduleUsed: data.assistantMessage.module_used
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        loadConversations();
      } else {
        setMessages(prev => prev.slice(0, -1));
        alert(response.message || '发送消息失败');
      }
    } catch (error) {
      console.error('发送消息失败:', error);
      setMessages(prev => prev.slice(0, -1));
      alert('发送消息失败，请检查网络连接');
    } finally {
      setIsLoading(false);
    }
  };

  // 更新对话标题
  const updateConversationTitle = async (conversationId: string, title: string) => {
    try {
      const response = await aiApi.updateConversation(conversationId, { title });
      
      if (response.success) {
        loadConversations();
        if (currentConversation?.id === conversationId) {
          setCurrentConversation(prev => prev ? { ...prev, title } : null);
        }
      }
    } catch (error) {
      console.error('更新标题失败:', error);
    }
  };

  // 显示删除确认对话框
  const showDeleteConfirmDialog = (conversationId: string) => {
    setConversationToDelete(conversationId);
    setShowDeleteConfirm(true);
  };

  // 取消删除
  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setConversationToDelete(null);
  };

  // 确认删除对话
  const confirmDeleteConversation = async () => {
    if (!conversationToDelete) return;

    try {
      const response = await aiApi.deleteConversation(conversationToDelete);
      
      if (response.success) {
        setConversations(prev => prev.filter(conv => conv.id !== conversationToDelete));
        if (currentConversation?.id === conversationToDelete) {
          setCurrentConversation(null);
          setMessages([]);
        }
      }
    } catch (error) {
      console.error('删除对话失败:', error);
    } finally {
      setShowDeleteConfirm(false);
      setConversationToDelete(null);
    }
  };

  // 复制消息内容
  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  // 处理键盘事件
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  useEffect(() => {
    loadConversations();
    loadModels();
  }, []);

  return (
    <APIConfigGuard fallbackMessage="AI助手需要配置API密钥才能正常工作。请前往设置页面配置您的AI服务API密钥。">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex">
      {/* 侧边栏 */}
      <div className="w-80 bg-white/80 backdrop-blur-xl border-r border-white/20 shadow-xl flex flex-col">
        {/* 侧边栏头部 */}
        <div className="p-6 border-b border-gray-100">
          <button 
            className={`w-full px-4 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-2xl flex items-center justify-center gap-2 ${
              models.length === 0 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
            }`}
            onClick={models.length > 0 ? createNewConversation : undefined}
            disabled={models.length === 0}
          >
            <Plus size={18} />
            新建对话
          </button>
        </div>

        {/* 模型选择 */}
        <div className="p-4 border-b border-gray-100">
          <label className="block text-sm font-medium text-black mb-2">AI模型</label>
          {models.length > 0 ? (
            <div className="relative">
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
              >
                {models.map(model => (
                  <option key={model.id} value={model.id}>
                    {model.name} ({model.provider})
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                暂无可用的AI模型，请先在设置中配置API密钥
              </p>
            </div>
          )}
        </div>

        {/* 对话列表 */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-500 mb-3">最近对话</h3>
            <div className="space-y-2">
              {conversations.map(conversation => (
                <div
                  key={conversation.id}
                  className={`group p-4 rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-[1.02] ${
                    currentConversation?.id === conversation.id
                      ? 'bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 shadow-md'
                      : 'hover:bg-white/60 hover:shadow-lg border border-transparent backdrop-blur-sm'
                  }`}
                  onClick={() => selectConversation(conversation)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      {editingTitle === conversation.id ? (
                        <input
                          type="text"
                          value={newTitle}
                          onChange={(e) => setNewTitle(e.target.value)}
                          onBlur={() => {
                            updateConversationTitle(conversation.id, newTitle);
                            setEditingTitle(null);
                          }}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              updateConversationTitle(conversation.id, newTitle);
                              setEditingTitle(null);
                            }
                          }}
                          className="w-full bg-white border border-gray-300 rounded px-2 py-1 text-sm"
                          autoFocus
                        />
                      ) : (
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {conversation.title}
                        </h4>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        {conversation.message_count} 条消息 · {new Date(conversation.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingTitle(conversation.id);
                          setNewTitle(conversation.title);
                        }}
                        className="p-1 text-gray-400 hover:text-gray-600 rounded"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          showDeleteConfirmDialog(conversation.id);
                        }}
                        className="p-1 text-gray-400 hover:text-red-600 rounded"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 主聊天区域 */}
      <div className="flex-1 flex flex-col">
        {currentConversation ? (
          <>
            {/* 聊天头部 */}
            <div className="bg-white/80 backdrop-blur-xl border-b border-white/20 p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">{currentConversation.title}</h1>
                  <p className="text-sm text-gray-500 mt-1">使用 {models.find(m => m.id === selectedModel)?.name || selectedModel} 模型</p>
                </div>
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-3 text-gray-400 hover:text-blue-600 rounded-xl hover:bg-blue-50 transition-all duration-300 transform hover:scale-110 hover:rotate-90"
                >
                  <Settings size={20} />
                </button>
              </div>
            </div>

            {/* 设置面板 */}
            {showSettings && (
              <div className="bg-gradient-to-r from-blue-50/80 to-purple-50/80 backdrop-blur-xl border-b border-white/20 p-6 shadow-inner">
                <div className="max-w-2xl">
                  <h3 className="text-lg font-medium text-black mb-4">对话设置</h3>
                  
                  <div className="space-y-4">
                    {/* 模型选择 */}
                    <div>
                      <label className="block text-sm font-medium text-black mb-2">
                        AI 模型
                      </label>
                      <select
                        value={selectedModel}
                        onChange={(e) => setSelectedModel(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                      >
                        {models.map(model => (
                          <option key={model.id} value={model.id}>
                            {model.name} - {model.description}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        选择不同的AI模型来获得不同的对话体验
                      </p>
                    </div>

                    {/* 对话标题编辑 */}
                    <div>
                      <label className="block text-sm font-medium text-black mb-2">
                        对话标题
                      </label>
                      <input
                        type="text"
                        value={currentConversation?.title || ''}
                        onChange={(e) => {
                          if (currentConversation) {
                            setCurrentConversation({
                              ...currentConversation,
                              title: e.target.value
                            });
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                        placeholder="输入对话标题"
                      />
                    </div>

                    {/* 操作按钮 */}
                    <div className="flex space-x-3 pt-2">
                      <button
                        onClick={saveSettings}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                      >
                        保存设置
                      </button>
                      <button
                        onClick={() => setShowSettings(false)}
                        className="px-6 py-3 bg-white/80 text-gray-700 rounded-xl hover:bg-white transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg backdrop-blur-sm"
                      >
                        取消
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 消息区域 */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {messages.length === 0 ? (
                <div className="text-center py-6">
                  <div className="w-14 h-14 bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                    <Bot className="w-7 h-7 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">开始新对话</h2>
                  <p className="text-gray-600 mb-6">我可以帮助您进行内容创作、数据分析和资源搜索</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto mb-6">
                    <div className="group relative bg-gradient-to-br from-green-50/90 to-emerald-50/90 backdrop-blur-xl rounded-2xl p-4 border border-green-200/50 hover:border-green-300 hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:scale-[1.02] hover:-translate-y-2 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-green-400/5 to-emerald-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <div className="relative z-10 flex items-start justify-between gap-3">
                        <div className="flex-1 pt-1">
                          <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-green-700 transition-colors">内容生成</h3>
                          <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors leading-relaxed">创作文章、报告和各类文档内容</p>
                        </div>
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:rotate-3 flex-shrink-0">
                           <FileText className="w-5 h-5 text-white" />
                         </div>
                      </div>
                      <div className="absolute bottom-3 right-3 w-2 h-2 bg-green-400 rounded-full opacity-60 group-hover:opacity-100 transition-opacity"></div>
                    </div>
                    <div className="group relative bg-gradient-to-br from-purple-50/90 to-violet-50/90 backdrop-blur-xl rounded-2xl p-4 border border-purple-200/50 hover:border-purple-300 hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:scale-[1.02] hover:-translate-y-2 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-400/5 to-violet-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <div className="relative z-10 flex items-start justify-between gap-3">
                        <div className="flex-1 pt-1">
                          <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-purple-700 transition-colors">数据分析</h3>
                          <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors leading-relaxed">分析数据趋势和生成洞察报告</p>
                        </div>
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-violet-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:rotate-3 flex-shrink-0">
                           <BarChart3 className="w-5 h-5 text-white" />
                         </div>
                      </div>
                      <div className="absolute bottom-3 right-3 w-2 h-2 bg-purple-400 rounded-full opacity-60 group-hover:opacity-100 transition-opacity"></div>
                    </div>
                    <div className="group relative bg-gradient-to-br from-orange-50/90 to-amber-50/90 backdrop-blur-xl rounded-2xl p-4 border border-orange-200/50 hover:border-orange-300 hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:scale-[1.02] hover:-translate-y-2 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-orange-400/5 to-amber-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <div className="relative z-10 flex items-start justify-between gap-3">
                        <div className="flex-1 pt-1">
                          <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-orange-700 transition-colors">资源搜索</h3>
                          <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors leading-relaxed">搜索和管理物料库资源</p>
                        </div>
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:rotate-3 flex-shrink-0">
                           <Search className="w-5 h-5 text-white" />
                         </div>
                      </div>
                      <div className="absolute bottom-3 right-3 w-2 h-2 bg-orange-400 rounded-full opacity-60 group-hover:opacity-100 transition-opacity"></div>
                    </div>
                  </div>
                  
                  <div className="max-w-2xl mx-auto">
                    <p className="text-sm text-gray-500 mb-4">试试这些示例：</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      <button 
                        onClick={() => setInputMessage("帮我写一篇关于AI技术的文章")}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition-colors"
                      >
                        "帮我写一篇关于AI技术的文章"
                      </button>
                      <button 
                        onClick={() => setInputMessage("分析我的销售数据")}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition-colors"
                      >
                        "分析我的销售数据"
                      </button>
                      <button 
                        onClick={() => setInputMessage("搜索相关的图片素材")}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition-colors"
                      >
                        "搜索相关的图片素材"
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                messages.map(message => (
                  <div key={message.id} className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {message.role === 'assistant' && (
                      <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-blue-600" />
                      </div>
                    )}
                    <div className={`max-w-3xl ${message.role === 'user' ? 'order-1' : ''}`}>
                      {message.moduleUsed && (
                        <div className="flex items-center gap-2 mb-2 text-xs text-gray-500">
                          {message.moduleUsed === 'content_generation' && (
                            <>
                              <FileText size={12} />
                              <span>内容生成</span>
                            </>
                          )}
                          {message.moduleUsed === 'data_analysis' && (
                            <>
                              <BarChart3 size={12} />
                              <span>数据分析</span>
                            </>
                          )}
                          {message.moduleUsed === 'material_search' && (
                            <>
                              <Search size={12} />
                              <span>物料搜索</span>
                            </>
                          )}
                        </div>
                      )}
                      <div className={`rounded-2xl px-5 py-4 shadow-lg ${
                        message.role === 'user' 
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
                          : 'bg-white/90 backdrop-blur-sm border border-white/20 shadow-xl text-black'
                      }`}>
                        <div className="whitespace-pre-wrap">{message.content}</div>
                      </div>
                      <div className="flex items-center gap-3 mt-2 text-xs text-black">
                        <span>{new Date(message.timestamp).toLocaleTimeString()}</span>
                        {message.tokens && <span>{message.tokens} tokens</span>}
                        <button 
                          onClick={() => copyMessage(message.content)}
                          className="flex items-center gap-1 hover:text-black transition-colors"
                        >
                          <Copy size={12} />
                          复制
                        </button>
                      </div>
                    </div>
                    {message.role === 'user' && (
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-black" />
                      </div>
                    )}
                  </div>
                ))
              )}
              
              {isLoading && (
                <div className="flex gap-4 justify-start">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                    <Bot className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="bg-white/90 backdrop-blur-sm border border-white/20 rounded-2xl px-5 py-4 shadow-xl">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-bounce"></div>
                      <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-3 h-3 bg-gradient-to-r from-pink-400 to-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* 输入区域 */}
            <div className="bg-white/80 backdrop-blur-xl border-t border-white/20 p-6 shadow-lg">
              <div className="max-w-4xl mx-auto">
                <div className="relative">
                  <textarea
                    ref={inputRef}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={models.length === 0 ? "请先配置API密钥..." : "输入您的问题..."}
                    rows={1}
                    disabled={isLoading || models.length === 0}
                    className="w-full bg-white/90 backdrop-blur-sm border border-white/30 rounded-2xl px-6 py-4 pr-16 text-black focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-300 resize-none transition-all duration-300 shadow-lg hover:shadow-xl placeholder-gray-400"
                    style={{minHeight: '56px', maxHeight: '120px'}}
                  />
                  <button 
                    onClick={sendMessage}
                    disabled={!inputMessage.trim() || isLoading || models.length === 0}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white rounded-xl flex items-center justify-center transition-all duration-300 transform hover:scale-110 active:scale-95 shadow-lg hover:shadow-xl"
                  >
                    {isLoading ? (
                      <RefreshCw size={16} className="animate-spin" />
                    ) : (
                      <Send size={16} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Bot className="w-10 h-10 text-blue-600" />
              </div>
              <h2 className="text-2xl font-semibold text-black mb-2">欢迎使用AI助手</h2>
              <p className="text-black mb-8">选择一个对话或创建新对话开始聊天</p>
              <button 
                onClick={createNewConversation}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-2xl font-medium transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-xl hover:shadow-2xl flex items-center gap-3 mx-auto"
              >
                <Plus size={18} />
                创建新对话
              </button>
            </div>
          </div>
        )}
       </div>
     </div>

     {/* 删除确认对话框 */}
     {showDeleteConfirm && (
       <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
         <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4 transform transition-all duration-300 scale-100">
           <div className="flex items-center gap-4 mb-6">
             <div className="w-14 h-14 bg-gradient-to-r from-red-100 to-pink-100 rounded-2xl flex items-center justify-center shadow-lg">
               <Trash2 className="w-7 h-7 text-red-600" />
             </div>
             <div>
               <h3 className="text-lg font-semibold text-black">删除对话</h3>
               <p className="text-sm text-black">此操作无法撤销</p>
             </div>
           </div>
           
           <p className="text-black mb-6">
             确定要删除这个对话吗？删除后将无法恢复对话内容。
           </p>
           
           <div className="flex gap-4 justify-end">
             <button
               onClick={cancelDelete}
               className="px-6 py-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all duration-300 font-medium transform hover:scale-105"
             >
               取消
             </button>
             <button
               onClick={confirmDeleteConversation}
               className="px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white rounded-xl transition-all duration-300 font-medium transform hover:scale-105 shadow-lg hover:shadow-xl"
             >
               确认删除
             </button>
           </div>
         </div>
       </div>
     )}
     </APIConfigGuard>
  );
};

export default AIAssistant;