import React, { useState, useRef, useCallback, useEffect } from 'react';
import { aiApi } from '../services/api';
import APIConfigGuard from '../components/APIConfigGuard';
import './DataAnalysis.css';

// 类型定义
interface AnalysisResult {
  analysis: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface VisualizationSuggestion {
  title: string;
  type: string;
  description: string;
}

interface Model {
  id: string;
  name: string;
  description: string;
  provider?: string;
}

// 工作流步骤定义
const WORKFLOW_STEPS = [
  { id: 1, label: '数据输入', icon: '📊' },
  { id: 2, label: '配置分析', icon: '⚙️' },
  { id: 3, label: '执行分析', icon: '🚀' },
  { id: 4, label: '查看结果', icon: '📈' }
];

// 分析功能配置
const ANALYSIS_FUNCTIONS = [
  {
    id: 'analyze',
    title: '数据分析',
    description: '深度分析数据模式、趋势和洞察',
    icon: '🔍',
    color: 'primary',
    endpoint: '/data/analyze/text'
  },
  {
    id: 'report',
    title: '报告生成',
    description: '生成专业的数据分析报告',
    icon: '📋',
    color: 'success',
    endpoint: '/data/report/generate'
  },
  {
    id: 'visualization',
    title: '可视化建议',
    description: '推荐最佳的数据可视化方案',
    icon: '📊',
    color: 'warning',
    endpoint: '/data/visualization/suggestions'
  },
  {
    id: 'markdown',
    title: 'Markdown总结',
    description: '生成结构化的Markdown文档',
    icon: '📝',
    color: 'primary',
    endpoint: '/data/markdown/generate'
  },
  {
    id: 'html',
    title: 'HTML网页',
    description: '创建交互式的HTML分析页面',
    icon: '🌐',
    color: 'success',
    endpoint: '/data/html/generate'
  }
];

const DataAnalysis: React.FC = () => {
  // 状态管理
  const [currentStep, setCurrentStep] = useState(1);
  const [inputType, setInputType] = useState<'text' | 'file'>('text');
  const [textInput, setTextInput] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [filePath, setFilePath] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  
  // 模型状态
  const [models, setModels] = useState<Model[]>([]);
  const [modelsLoading, setModelsLoading] = useState(true);
  
  // 配置状态
  const [model, setModel] = useState('');
  const [analysisType, setAnalysisType] = useState('comprehensive');
  const [reportType, setReportType] = useState('detailed');
  const [summaryType, setSummaryType] = useState('comprehensive');
  const [htmlTemplate, setHtmlTemplate] = useState('modern');
  const [dataDescription, setDataDescription] = useState('');
  
  // 结果状态
  const [results, setResults] = useState<{[key: string]: any}>({});
  const [loadingStates, setLoadingStates] = useState<{[key: string]: boolean}>({});
  
  // 引用
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 模型加载函数
  const loadModels = useCallback(async () => {
    console.log('🔄 [数据分析页面] 开始加载模型列表...');
    setModelsLoading(true);
    
    try {
      console.log('🔑 [数据分析页面] 开始加载模型');
      
      const response = await aiApi.getModels();

      console.log('📡 [数据分析页面] API响应:', response);

      if (response.success) {
        console.log('📊 [数据分析页面] API响应数据:', response.data);
          // 将后端返回的模型数据转换为前端需要的格式
          const modelList: Model[] = [];

          // 处理每个提供商的模型
          console.log('🔍 [数据分析页面] 发现的模型提供商:', Object.keys(response.data as Record<string, string[]>));
          
          for (const [provider, modelIds] of Object.entries(response.data as Record<string, string[]>)) {
            console.log(`📋 [数据分析页面] ${provider} 的模型:`, modelIds);
            
            if (Array.isArray(modelIds)) {
              modelIds.forEach((modelId: string) => {
                const modelInfo = getModelInfo(modelId, provider);
                modelList.push(modelInfo);
              });
            }
          }

          console.log('✅ [数据分析页面] 转换后的模型列表:', modelList);
          setModels(modelList);
          
          // 设置默认模型
          if (modelList.length > 0 && !model) {
            const defaultModel = modelList[0].id;
            setModel(defaultModel);
            console.log('🎯 [数据分析页面] 设置默认模型:', defaultModel);
          }
          
          if (modelList.length === 0) {
            console.warn('⚠️ [数据分析页面] 没有可用的模型');
          }
        } else {
          console.error('❌ [数据分析页面] API返回失败:', response.message);
        }
    } catch (error) {
      console.error('💥 [数据分析页面] 加载模型失败:', error);
      
      // 如果API调用失败，使用默认模型
      const defaultModels: Model[] = [
        { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openai', description: '快速高效的分析模型' },
        { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet', provider: 'claude', description: '平衡性能与质量' }
      ];
      
      console.log('🔄 [数据分析页面] 使用默认模型列表:', defaultModels);
      setModels(defaultModels);
      
      if (!model) {
        setModel(defaultModels[0].id);
        console.log('🎯 [数据分析页面] 设置默认模型:', defaultModels[0].id);
      }
    } finally {
      setModelsLoading(false);
      console.log('✅ [数据分析页面] 模型加载完成');
    }
  }, [model]);

  // 组件挂载时加载模型
  useEffect(() => {
    loadModels();
  }, [loadModels]);

  // 工具函数
  const getModelInfo = (modelId: string, provider?: string): Model => {
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
      
      // DeepSeek 模型
      'deepseek-chat': { name: 'DeepSeek Chat', description: 'DeepSeek对话模型' },
      'deepseek-coder': { name: 'DeepSeek Coder', description: 'DeepSeek代码模型' },
      
      // Kimi 模型
      'moonshot-v1-8k': { name: 'Kimi 8K', description: 'Kimi 8K上下文模型' },
      'moonshot-v1-32k': { name: 'Kimi 32K', description: 'Kimi 32K上下文模型' },
      'moonshot-v1-128k': { name: 'Kimi 128K', description: 'Kimi 128K上下文模型' },
      
      // 百度模型
      'ernie-bot': { name: 'ERNIE Bot', description: '百度文心一言' },
      'ernie-bot-turbo': { name: 'ERNIE Bot Turbo', description: '百度文心一言Turbo' },
      
      // 智谱模型
      'glm-4': { name: 'GLM-4', description: '智谱GLM-4模型' },
      'glm-3-turbo': { name: 'GLM-3 Turbo', description: '智谱GLM-3 Turbo模型' }
    };

    const modelInfo = modelMap[modelId] || { name: modelId, description: '未知模型' };
    return {
      id: modelId,
      name: modelInfo.name,
      description: modelInfo.description,
      provider: provider
    };
  };

  // 文件处理
  const handleFileSelect = useCallback((file: File) => {
    setUploadedFile(file);
    setCurrentStep(2);
  }, []);

  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  // 分析执行
  const executeAnalysis = async (functionConfig: typeof ANALYSIS_FUNCTIONS[0]) => {
    let { id, endpoint } = functionConfig;
    
    setLoadingStates(prev => ({ ...prev, [id]: true }));
    setCurrentStep(3);

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('请先登录');
      }

      let requestBody: any = {};
      let headers: any = {
        'Authorization': `Bearer ${token}`,
      };

      // 根据功能类型构建请求体
      if (id === 'analyze') {
        // 数据分析功能
        if (inputType === 'text') {
          endpoint = '/data/analyze/text';
          requestBody = {
            text: textInput,
            analysisType,
            model
          };
          headers['Content-Type'] = 'application/json';
        } else if (uploadedFile) {
          // 文件上传分析
          endpoint = '/data/analyze/upload';
          const formData = new FormData();
          formData.append('file', uploadedFile);
          formData.append('analysisType', analysisType);
          formData.append('model', model);
          requestBody = formData;
          // 不设置Content-Type，让浏览器自动设置
        } else if (filePath) {
          endpoint = '/data/analyze/file';
          requestBody = {
            filePath,
            analysisType,
            model
          };
          headers['Content-Type'] = 'application/json';
        }
      } else if (id === 'report') {
        // 报告生成功能
        requestBody = {
          data: inputType === 'text' ? { content: textInput } : { filePath: filePath || uploadedFile?.name },
          reportType,
          model
        };
        headers['Content-Type'] = 'application/json';
      } else if (id === 'visualization') {
        // 可视化建议功能
        requestBody = {
          dataDescription: dataDescription || textInput || '用户提供的数据',
          dataType: 'mixed',
          model
        };
        headers['Content-Type'] = 'application/json';
      } else if (id === 'markdown') {
        // Markdown总结功能
        requestBody = {
          textInput: textInput,
          summaryType,
          model
        };
        headers['Content-Type'] = 'application/json';
      } else if (id === 'html') {
        // HTML网页生成功能
        requestBody = {
          textInput: textInput,
          htmlTemplate,
          model
        };
        headers['Content-Type'] = 'application/json';
      }

      const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const fullURL = `${baseURL}${endpoint}`;

      const response = await fetch(fullURL, {
        method: 'POST',
        headers: headers,
        body: headers['Content-Type'] === 'application/json' ? JSON.stringify(requestBody) : requestBody,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setResults(prev => ({ ...prev, [id]: result }));
        setCurrentStep(4);
      } else {
        throw new Error(result.message || '分析失败');
      }
    } catch (error) {
      console.error(`${functionConfig.title}失败:`, error);
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      alert(`${functionConfig.title}失败: ${errorMessage}`);
    } finally {
      setLoadingStates(prev => ({ ...prev, [id]: false }));
    }
  };

  // 清除结果
  const clearResults = () => {
    setResults({});
    setCurrentStep(1);
  };

  // 渲染工作流步骤
  const renderWorkflowSteps = () => (
    <div className="workflow-steps">
      {WORKFLOW_STEPS.map((step) => (
        <div
          key={step.id}
          className={`workflow-step ${
            currentStep === step.id ? 'active' : 
            currentStep > step.id ? 'completed' : ''
          }`}
        >
          <div className="step-number">{step.icon}</div>
          <div className="step-label">{step.label}</div>
        </div>
      ))}
    </div>
  );

  // 渲染数据输入卡片
  const renderDataInputCard = () => (
    <div className="workspace-card">
      <div className="card-header">
        <h3 className="card-title">
          📊 数据输入
        </h3>
        <p className="card-description">选择您的数据输入方式</p>
      </div>
      <div className="card-content">
        <div className="input-tabs">
          <button
            className={`tab-btn ${inputType === 'text' ? 'active' : ''}`}
            onClick={() => setInputType('text')}
          >
            📝 文本输入
          </button>
          <button
            className={`tab-btn ${inputType === 'file' ? 'active' : ''}`}
            onClick={() => setInputType('file')}
          >
            📁 文件上传
          </button>
        </div>

        <div className="input-content">
          {inputType === 'text' ? (
            <textarea
              className="text-input"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="请输入您要分析的数据或文本内容..."
              style={{ color: 'var(--text-primary)' }}
              onFocus={() => setCurrentStep(Math.max(currentStep, 1))}
            />
          ) : (
            <div>
              <div
                className={`file-upload-area ${isDragOver ? 'drag-over' : ''}`}
                onDrop={handleFileDrop}
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="upload-icon">📁</div>
                <div className="upload-text">
                  {uploadedFile ? uploadedFile.name : '点击选择文件或拖拽到此处'}
                </div>
                <div className="upload-hint">
                  支持 CSV, Excel, JSON, TXT 等格式
                </div>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileInputChange}
                style={{ display: 'none' }}
                accept=".csv,.xlsx,.xls,.json,.txt,.pdf"
              />

              <div style={{ marginTop: '1rem' }}>
                <label className="config-label">或输入文件路径：</label>
                <input
                  type="text"
                  className="config-input"
                  value={filePath}
                  onChange={(e) => setFilePath(e.target.value)}
                  placeholder="例如：/path/to/your/data.csv"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // 渲染配置卡片
  const renderConfigCard = () => (
    <div className="workspace-card">
      <div className="card-header">
        <h3 className="card-title">
          ⚙️ 分析配置
        </h3>
        <p className="card-description">自定义您的分析参数</p>
      </div>
      <div className="card-content">
        <div className="config-grid">
          <div className="config-group">
            <label className="config-label">AI模型</label>
            <select
              className="config-select"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              disabled={modelsLoading}
            >
              {modelsLoading ? (
                <option value="">加载模型中...</option>
              ) : models.length === 0 ? (
                <option value="">暂无可用模型</option>
              ) : (
                models.map((modelOption) => (
                  <option key={modelOption.id} value={modelOption.id}>
                    {modelOption.name} - {modelOption.description}
                  </option>
                ))
              )}
            </select>
            {!modelsLoading && models.length === 0 && (
              <p className="text-sm text-red-500 mt-1">
                请在设置页面配置AI服务商的API密钥
              </p>
            )}
          </div>

          <div className="config-group">
            <label className="config-label">分析类型</label>
            <select
              className="config-select"
              value={analysisType}
              onChange={(e) => setAnalysisType(e.target.value)}
            >
              <option value="comprehensive">综合分析</option>
              <option value="statistical">统计分析</option>
              <option value="trend">趋势分析</option>
              <option value="correlation">相关性分析</option>
            </select>
          </div>

          <div className="config-group">
            <label className="config-label">报告类型</label>
            <select
              className="config-select"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            >
              <option value="detailed">详细报告</option>
              <option value="summary">摘要报告</option>
              <option value="executive">执行摘要</option>
            </select>
          </div>

          <div className="config-group">
            <label className="config-label">数据描述（可选）</label>
            <input
              type="text"
              className="config-input"
              value={dataDescription}
              onChange={(e) => setDataDescription(e.target.value)}
              placeholder="简要描述您的数据内容..."
            />
          </div>
        </div>
      </div>
    </div>
  );

  // 渲染分析功能卡片
  const renderAnalysisFunctionsCard = () => (
    <div className="workspace-card">
      <div className="card-header">
        <h3 className="card-title">
          🚀 分析功能
        </h3>
        <p className="card-description">选择您需要的分析功能</p>
      </div>
      <div className="card-content">
        <div className="actions-grid">
          {ANALYSIS_FUNCTIONS.map((func) => (
            <button
              key={func.id}
              className={`action-btn ${func.color} ${loadingStates[func.id] ? 'loading' : ''}`}
              onClick={() => executeAnalysis(func)}
              disabled={
                loadingStates[func.id] || 
                (inputType === 'text' && !textInput.trim()) ||
                (inputType === 'file' && !uploadedFile && !filePath)
              }
            >
              {loadingStates[func.id] ? (
                <>
                  <div className="animate-spin">⏳</div>
                  处理中...
                </>
              ) : (
                <>
                  <span>{func.icon}</span>
                  {func.title}
                </>
              )}
            </button>
          ))}
        </div>

        {Object.keys(results).length > 0 && (
          <button
            className="action-btn"
            onClick={clearResults}
            style={{ marginTop: '1rem', width: '100%' }}
          >
            🗑️ 清除所有结果
          </button>
        )}
      </div>
    </div>
  );

  // 渲染结果卡片
  const renderResultCard = (functionId: string, result: any) => {
    const functionConfig = ANALYSIS_FUNCTIONS.find(f => f.id === functionId);
    if (!functionConfig) return null;

    return (
      <div key={functionId} className="result-card">
        <div className="result-header">
          <div className="result-title">
            <span>{functionConfig.icon}</span>
            {functionConfig.title}结果
          </div>
          <div className="result-actions">
            <button
              className="action-btn"
              onClick={() => {
                const newResults = { ...results };
                delete newResults[functionId];
                setResults(newResults);
              }}
              title="删除此结果"
            >
              🗑️
            </button>
          </div>
        </div>
        <div className="result-content">
          {functionId === 'analyze' && (
            <div>
              <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
                {result.data?.analysis || result.analysis || '分析结果为空'}
              </pre>
              {(result.data?.usage || result.usage) && (
                <div style={{ 
                  marginTop: '1rem', 
                  padding: '1rem', 
                  background: 'var(--bg-secondary)', 
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.9rem',
                  color: 'var(--text-secondary)'
                }}>
                  <strong>Token使用情况：</strong><br/>
                  输入: {(result.data?.usage || result.usage).prompt_tokens} | 
                  输出: {(result.data?.usage || result.usage).completion_tokens} | 
                  总计: {(result.data?.usage || result.usage).total_tokens}
                </div>
              )}
            </div>
          )}
          
          {functionId === 'report' && (
            <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
              {result.data?.report || result.report || '报告生成失败'}
            </pre>
          )}
          
          {functionId === 'visualization' && (
            <div>
              {(result.data?.suggestions || result.suggestions || []).map((suggestion: VisualizationSuggestion, index: number) => (
                <div key={index} style={{ 
                  marginBottom: '1rem', 
                  padding: '1rem', 
                  background: 'var(--bg-secondary)', 
                  borderRadius: 'var(--radius-sm)' 
                }}>
                  <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>
                    {suggestion.title}
                  </h4>
                  <p style={{ 
                    margin: '0 0 0.5rem 0', 
                    fontSize: '0.9rem', 
                    color: 'var(--text-secondary)' 
                  }}>
                    类型: {suggestion.type}
                  </p>
                  <p style={{ margin: '0', fontSize: '0.9rem', lineHeight: '1.4' }}>
                    {suggestion.description}
                  </p>
                </div>
              ))}
              {(!result.data?.suggestions && !result.suggestions) && (
                <p style={{ color: 'var(--text-secondary)' }}>暂无可视化建议</p>
              )}
            </div>
          )}
          
          {functionId === 'markdown' && (
            <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
              {result.data?.markdown || result.markdown || 'Markdown生成失败'}
            </pre>
          )}
          
          {functionId === 'html' && (
            <div>
              {result.data?.htmlContent && (
                <div style={{ 
                  marginBottom: '1rem', 
                  padding: '1rem', 
                  background: 'var(--bg-secondary)', 
                  borderRadius: 'var(--radius-sm)'
                }}>
                  <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>
                    生成的HTML内容
                  </h4>
                  <div style={{ 
                    maxHeight: '300px', 
                    overflow: 'auto', 
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.5rem'
                  }}>
                    <pre style={{ 
                      whiteSpace: 'pre-wrap', 
                      wordWrap: 'break-word',
                      fontSize: '0.8rem',
                      margin: 0
                    }}>
                      {result.data.htmlContent}
                    </pre>
                  </div>
                  <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                    <button
                      className="action-btn primary"
                      onClick={() => {
                        const blob = new Blob([result.data.htmlContent], { type: 'text/html' });
                        const url = URL.createObjectURL(blob);
                        window.open(url, '_blank');
                      }}
                    >
                      👁️ 预览HTML
                    </button>
                    <button
                      className="action-btn success"
                      onClick={() => {
                        const blob = new Blob([result.data.htmlContent], { type: 'text/html' });
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = 'generated_page.html';
                        link.click();
                        URL.revokeObjectURL(url);
                      }}
                    >
                      💾 下载HTML
                    </button>
                  </div>
                </div>
              )}
              {!result.data?.htmlContent && (
                <p style={{ color: 'var(--text-secondary)' }}>HTML生成失败</p>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <APIConfigGuard fallbackMessage="数据分析工具需要配置AI API密钥才能正常工作。请前往设置页面配置您的AI服务API密钥。">
      <div className="data-analysis-page">
        {/* 页面头部 */}
        <header className="page-header">
          <h1 className="page-title">
            🧠 AI数据分析工作台
          </h1>
          <p className="page-subtitle">
            智能化数据分析，让洞察触手可及
          </p>
        </header>

        {/* 主要内容 */}
        <main className="main-layout">
          {/* 工作流步骤指示器 */}
          {renderWorkflowSteps()}

          {/* 工作区网格 */}
          <div className="workspace-grid">
            {renderDataInputCard()}
            {renderConfigCard()}
            {renderAnalysisFunctionsCard()}
          </div>

          {/* 结果展示区域 */}
          {Object.keys(results).length > 0 && (
            <div className="results-workspace">
              <div className="workspace-card">
                <div className="card-header">
                  <h3 className="card-title">
                    📈 分析结果
                  </h3>
                  <p className="card-description">
                    您的数据分析结果已准备就绪
                  </p>
                </div>
              </div>
              
              <div className="results-grid">
                {Object.entries(results).map(([functionId, result]) =>
                  renderResultCard(functionId, result)
                )}
              </div>
            </div>
          )}

          {/* 空状态 */}
          {Object.keys(results).length === 0 && currentStep === 4 && (
            <div className="empty-state">
              <div className="icon">📊</div>
              <h3 className="empty-title">暂无分析结果</h3>
              <p className="empty-description">
                请先输入数据并选择分析功能来开始您的数据分析之旅
              </p>
            </div>
          )}
        </main>
      </div>
    </APIConfigGuard>
  );
};

export default DataAnalysis;