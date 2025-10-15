import React, { useState, useEffect, useRef } from 'react';
import {
  Folder,
  FileText,
  Image,
  Video,
  Music,
  BarChart3,
  Plus,
  Search,
  Filter,
  Download,
  Star,
  Eye,
  Edit,
  Trash2,
  Tag,
  Calendar,
  User,
  Upload,
  Sparkles,
  Cpu,
  Lightbulb,
  FileSearch,
  Grid3X3,
  List,
  SortAsc,
  SortDesc,
  X,
  Check,
  Brain,
  TrendingUp,
  Users,
  Clock,
  Target,
  PieChart,
  ChevronRight
} from 'lucide-react';

interface Asset {
  id: string;
  name: string;
  description: string;
  type: string;
  category: string;
  tags: string[];
  fileUrl: string;
  thumbnailUrl: string;
  fileSize: number;
  format: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  downloadCount: number;
  rating: number;
  isPublic: boolean;
  metadata: any;
}

interface Category {
  id: string;
  name: string;
  description: string;
}

interface AssetStats {
  totalAssets: number;
  publicAssets: number;
  privateAssets: number;
  assetsByType: Record<string, number>;
  assetsByCategory: Record<string, number>;
  totalDownloads: number;
  averageRating: number;
  recentAssets: Array<{
    id: string;
    name: string;
    type: string;
    createdAt: string;
    downloadCount: number;
  }>;
}

interface AISummary {
  overview: string;
  statistics: {
    totalAssets: number;
    categories: Record<string, number>;
    tags: Record<string, number>;
    fileTypes: Record<string, number>;
    recentActivity: Array<{
      name: string;
      action: string;
      date: string;
    }>;
  };
  insights: string[];
  recommendations: string[];
  generatedAt: string;
}

const AssetLibrary: React.FC = () => {
  const [activeTab, setActiveTab] = useState('assets');
  const [assets, setAssets] = useState<Asset[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState<AssetStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'createdAt' | 'downloadCount' | 'rating'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState('grid');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // AI分析相关状态
  const [aiSummary, setAiSummary] = useState<AISummary | null>(null);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiModalType, setAiModalType] = useState<'summary' | 'analyze' | 'tags'>('summary');
  const [newAsset, setNewAsset] = useState({
    name: '',
    description: '',
    type: 'template',
    category: '',
    tags: [] as string[],
    fileUrl: '',
    thumbnailUrl: '',
    fileSize: 0,
    format: '',
    isPublic: true,
    metadata: {}
  });

  const assetTypes = [
    { id: 'template', name: '模板', icon: FileText },
    { id: 'design', name: '设计', icon: Image },
    { id: 'document', name: '文档', icon: FileText },
    { id: 'media', name: '媒体', icon: Video },
    { id: 'audio', name: '音频', icon: Music },
    { id: 'presentation', name: '演示', icon: BarChart3 }
  ];

  useEffect(() => {
    loadAssets();
    loadCategories();
    if (activeTab === 'stats') {
      loadStats();
    }
  }, [activeTab, searchTerm, selectedCategory, selectedType, sortBy, sortOrder]);

  const loadAssets = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search: searchTerm,
        category: selectedCategory,
        type: selectedType,
        sortBy,
        sortOrder,
        limit: '50'
      });

      const response = await fetch(`/api/v1/assets?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAssets(data.data.assets);
      }
    } catch (error) {
      console.error('加载物料失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/v1/assets/categories', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCategories(data.data);
      }
    } catch (error) {
      console.error('加载分类失败:', error);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch('/api/v1/assets/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      }
    } catch (error) {
      console.error('加载统计数据失败:', error);
    }
  };

  const handleAddAsset = async () => {
    try {
      const response = await fetch('/api/v1/assets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newAsset)
      });

      if (response.ok) {
        setShowAddModal(false);
        setNewAsset({
          name: '',
          description: '',
          type: 'template',
          category: '',
          tags: [],
          fileUrl: '',
          thumbnailUrl: '',
          fileSize: 0,
          format: '',
          isPublic: true,
          metadata: {}
        });
        loadAssets();
      }
    } catch (error) {
      console.error('添加物料失败:', error);
    }
  };

  const handleUpdateAsset = async () => {
    if (!selectedAsset) return;

    try {
      const response = await fetch(`/api/v1/assets/${selectedAsset.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(selectedAsset)
      });

      if (response.ok) {
        setShowEditModal(false);
        setSelectedAsset(null);
        loadAssets();
      }
    } catch (error) {
      console.error('更新物料失败:', error);
    }
  };

  const handleDeleteAsset = async (id: string) => {
    if (!window.confirm('确定要删除这个物料吗？')) return;

    try {
      const response = await fetch(`/api/v1/assets/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        loadAssets();
      }
    } catch (error) {
      console.error('删除物料失败:', error);
    }
  };

  const handleDownload = async (asset: Asset) => {
    try {
      const response = await fetch(`/api/v1/assets/${asset.id}/download`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        // 创建下载链接
        const link = document.createElement('a');
        link.href = data.data.downloadUrl;
        link.download = data.data.fileName;
        link.click();
        loadAssets(); // 刷新下载次数
      }
    } catch (error) {
      console.error('下载失败:', error);
    }
  };

  const handleRating = async (assetId: string, rating: number) => {
    try {
      const response = await fetch(`/api/v1/assets/${assetId}/rate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ rating })
      });

      if (response.ok) {
        loadAssets();
      }
    } catch (error) {
      console.error('评分失败:', error);
    }
  };

  const generateDescription = async () => {
    if (!newAsset.name) return;

    try {
      const response = await fetch('/api/v1/assets/generate/description', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          name: newAsset.name,
          type: newAsset.type,
          category: newAsset.category,
          tags: newAsset.tags
        })
      });

      if (response.ok) {
        const data = await response.json();
        setNewAsset(prev => ({
          ...prev,
          description: data.data.description
        }));
      }
    } catch (error) {
      console.error('生成描述失败:', error);
    }
  };

  // AI分析相关函数
  const loadAISummary = async () => {
    try {
      setAiAnalyzing(true);
      const response = await fetch('/api/v1/assets/ai-summary', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAiSummary(data.data);
      }
    } catch (error) {
      console.error('获取AI摘要失败:', error);
    } finally {
      setAiAnalyzing(false);
    }
  };

  const reanalyzeAsset = async (assetId: string) => {
    try {
      setAiAnalyzing(true);
      const response = await fetch(`/api/v1/assets/${assetId}/reanalyze`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('AI重新分析完成:', data);
        loadAssets(); // 重新加载资产列表
        return data;
      }
    } catch (error) {
      console.error('AI重新分析失败:', error);
    } finally {
      setAiAnalyzing(false);
    }
  };

  const batchAnalyzeAssets = async () => {
    if (selectedAssets.length === 0) return;

    try {
      setAiAnalyzing(true);
      const response = await fetch('/api/v1/assets/batch-analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ assetIds: selectedAssets })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('批量AI分析完成:', data);
        loadAssets(); // 重新加载资产列表
        setSelectedAssets([]); // 清空选择
        return data;
      }
    } catch (error) {
      console.error('批量AI分析失败:', error);
    } finally {
      setAiAnalyzing(false);
    }
  };

  const getSmartTagSuggestions = async (fileName: string, fileType?: string, description?: string): Promise<string[]> => {
    try {
      const response = await fetch('/api/v1/assets/smart-tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ fileName, fileType, description })
      });

      if (response.ok) {
        const data = await response.json();
        return data.data.suggestedTags;
      }
    } catch (error) {
      console.error('获取智能标签建议失败:', error);
    }
    return [];
  };

  const toggleAssetSelection = (assetId: string) => {
    setSelectedAssets(prev => 
      prev.includes(assetId) 
        ? prev.filter(id => id !== assetId)
        : [...prev, assetId]
    );
  };

  const selectAllAssets = () => {
    const filteredAssetIds = filteredAssets.map(asset => asset.id);
    setSelectedAssets(filteredAssetIds);
  };

  const clearSelection = () => {
    setSelectedAssets([]);
  };

  // 文件上传相关函数
  const handleFileSelect = (files: FileList | null) => {
    if (files) {
      const fileArray = Array.from(files);
      setUploadFiles(prev => [...prev, ...fileArray]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const removeUploadFile = (index: number) => {
    setUploadFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (uploadFiles.length === 0) return;

    setUploading(true);
    try {
      const formData = new FormData();
      
      uploadFiles.forEach(file => {
        formData.append('files', file);
      });

      // 添加额外的元数据
      formData.append('description', '');
      formData.append('tags', JSON.stringify([]));
      formData.append('isPublic', 'true');

      const response = await fetch('/api/v1/assets/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        console.log('上传成功:', data);
        setUploadFiles([]);
        setShowAddModal(false);
        loadAssets(); // 重新加载物料列表
      } else {
        const errorData = await response.json();
        console.error('上传失败:', errorData.message);
      }
    } catch (error) {
      console.error('上传失败:', error);
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getTypeIcon = (type: string) => {
    const typeConfig = assetTypes.find(t => t.id === type);
    return typeConfig ? typeConfig.icon : FileText;
  };

  const renderAssetCard = (asset: Asset) => {
    const TypeIcon = getTypeIcon(asset.type);
    const isSelected = selectedAssets.includes(asset.id);
    
    if (viewMode === 'list') {
      return (
        <div key={asset.id} className={`bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 ${isSelected ? 'ring-2 ring-blue-500 border-blue-500' : ''}`}>
          <div className="flex items-center gap-4">
            {/* 选择框 */}
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => toggleAssetSelection(asset.id)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            
            {/* 图标/缩略图 */}
            <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center">
              {asset.thumbnailUrl ? (
                <img src={asset.thumbnailUrl} alt={asset.name} className="w-full h-full object-cover rounded-xl" />
              ) : (
                <TypeIcon className="w-8 h-8 text-gray-600" />
              )}
            </div>
            
            {/* 基本信息 */}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 truncate">{asset.name}</h3>
              <p className="text-gray-600 text-sm mt-1 line-clamp-2">{asset.description}</p>
              
              {/* 标签 */}
              <div className="flex flex-wrap gap-2 mt-2">
                {asset.tags.slice(0, 3).map((tag, index) => (
                  <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-lg">
                    {tag}
                  </span>
                ))}
                {asset.tags.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg">
                    +{asset.tags.length - 3}
                  </span>
                )}
              </div>
            </div>
            
            {/* 元数据 */}
            <div className="flex-shrink-0 text-sm text-gray-600 space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{asset.format.toUpperCase()}</span>
                <span>•</span>
                <span>{formatFileSize(asset.fileSize)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                <span>{asset.downloadCount}</span>
              </div>
            </div>
            
            {/* 评分 */}
            <div className="flex-shrink-0 flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => handleRating(asset.id, star)}
                  className="text-yellow-400 hover:text-yellow-500 transition-colors duration-200"
                >
                  <Star className={`w-4 h-4 ${star <= asset.rating ? 'fill-current' : ''}`} />
                </button>
              ))}
              <span className="text-sm text-gray-600 ml-1">({asset.rating.toFixed(1)})</span>
            </div>
            
            {/* 操作按钮 */}
            <div className="flex-shrink-0 flex items-center gap-2">
              <button
                onClick={() => handleDownload(asset)}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                title="下载"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setSelectedAsset(asset);
                  setShowEditModal(true);
                }}
                className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200"
                title="编辑"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => reanalyzeAsset(asset.id)}
                disabled={aiAnalyzing}
                className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-200 disabled:opacity-50"
                title="AI重新分析"
              >
                <FileSearch className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDeleteAsset(asset.id)}
                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                title="删除"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {/* AI分析结果 */}
          {asset.metadata?.aiAnalysis && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-600">AI分析</span>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                {asset.metadata.aiAnalysis.suggestedCategory && (
                  <div>
                    <span className="font-medium">建议分类:</span>
                    <span className="ml-1">{asset.metadata.aiAnalysis.suggestedCategory}</span>
                  </div>
                )}
                {asset.metadata.aiAnalysis.confidence && (
                  <div>
                    <span className="font-medium">置信度:</span>
                    <span className="ml-1">{(asset.metadata.aiAnalysis.confidence * 100).toFixed(1)}%</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      );
    }
    
    // 网格视图
    return (
      <div key={asset.id} className={`bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200 group ${isSelected ? 'ring-2 ring-blue-500 border-blue-500' : ''}`}>
        {/* 缩略图区域 */}
        <div className="relative aspect-video bg-gray-100">
          {asset.thumbnailUrl ? (
            <img src={asset.thumbnailUrl} alt={asset.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <TypeIcon className="w-12 h-12 text-gray-600" />
            </div>
          )}
          
          {/* 悬停操作按钮 */}
          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
            <button
              onClick={() => handleDownload(asset)}
              className="p-2 bg-white text-gray-700 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              title="下载"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setSelectedAsset(asset);
                setShowEditModal(true);
              }}
              className="p-2 bg-white text-gray-700 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              title="编辑"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => reanalyzeAsset(asset.id)}
              disabled={aiAnalyzing}
              className="p-2 bg-white text-gray-700 rounded-lg hover:bg-gray-100 transition-colors duration-200 disabled:opacity-50"
              title="AI重新分析"
            >
              <FileSearch className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDeleteAsset(asset.id)}
              className="p-2 bg-white text-red-600 rounded-lg hover:bg-red-50 transition-colors duration-200"
              title="删除"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          
          {/* 选择框 */}
          <div className="absolute top-3 left-3">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => toggleAssetSelection(asset.id)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
          </div>
        </div>
        
        {/* 信息区域 */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 truncate mb-2">{asset.name}</h3>
          <p className="text-gray-600 text-sm line-clamp-2 mb-3">{asset.description}</p>
          
          {/* 标签 */}
          <div className="flex flex-wrap gap-1 mb-3">
            {asset.tags.slice(0, 2).map((tag, index) => (
              <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-lg">
                {tag}
              </span>
            ))}
            {asset.tags.length > 2 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg">
                +{asset.tags.length - 2}
              </span>
            )}
          </div>
          
          {/* 元数据 */}
          <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
            <div className="flex items-center gap-2">
              <span className="font-medium">{asset.format.toUpperCase()}</span>
              <span>•</span>
              <span>{formatFileSize(asset.fileSize)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Download className="w-3 h-3" />
              <span>{asset.downloadCount}</span>
            </div>
          </div>
          
          {/* 评分 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => handleRating(asset.id, star)}
                  className="text-yellow-400 hover:text-yellow-500 transition-colors duration-200"
                >
                  <Star className={`w-3 h-3 ${star <= asset.rating ? 'fill-current' : ''}`} />
                </button>
              ))}
              <span className="text-xs text-gray-600 ml-1">({asset.rating.toFixed(1)})</span>
            </div>
            
            {/* AI分析标识 */}
            {asset.metadata?.aiAnalysis && (
              <div className="flex items-center gap-1 text-purple-600">
                <Sparkles className="w-3 h-3" />
                <span className="text-xs">AI</span>
              </div>
            )}
          </div>
          
          {/* AI分析详情 */}
          {asset.metadata?.aiAnalysis && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="text-xs text-gray-600 space-y-1">
                {asset.metadata.aiAnalysis.suggestedCategory && (
                  <div>
                    <span className="font-medium">建议分类:</span>
                    <span className="ml-1">{asset.metadata.aiAnalysis.suggestedCategory}</span>
                  </div>
                )}
                {asset.metadata.aiAnalysis.confidence && (
                  <div>
                    <span className="font-medium">置信度:</span>
                    <span className="ml-1">{(asset.metadata.aiAnalysis.confidence * 100).toFixed(1)}%</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderStatsTab = () => {
    if (!stats) {
      return (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">加载统计数据中...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        {/* 统计概览卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">总物料数</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalAssets}</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                <Folder className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">总下载量</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalDownloads}</p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                <Download className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">平均评分</p>
                <p className="text-3xl font-bold text-gray-900">{stats.averageRating}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">公开物料</p>
                <p className="text-3xl font-bold text-gray-900">{stats.publicAssets}</p>
              </div>
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                <Eye className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* 图表区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 按类型分布 */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              按类型分布
            </h3>
            <div className="space-y-4">
              {Object.entries(stats.assetsByType).map(([type, count]) => (
                <div key={type} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">{type}</span>
                    <span className="text-sm font-semibold text-gray-900">{count}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(count / stats.totalAssets) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 按分类分布 */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-green-600" />
              按分类分布
            </h3>
            <div className="space-y-4">
              {Object.entries(stats.assetsByCategory).map(([category, count]) => (
                <div key={category} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">{category}</span>
                    <span className="text-sm font-semibold text-gray-900">{count}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(count / stats.totalAssets) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 最近添加 */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-600" />
            最近添加
          </h3>
          <div className="space-y-4">
            {stats.recentAssets.map((asset) => (
              <div key={asset.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    {React.createElement(getTypeIcon(asset.type), { className: "w-5 h-5 text-blue-600" })}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{asset.name}</h4>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs font-medium">
                        {asset.type}
                      </span>
                      <span>•</span>
                      <span>{new Date(asset.createdAt).toLocaleDateString()}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Download className="w-3 h-3" />
                        {asset.downloadCount}
                      </span>
                    </div>
                  </div>
                </div>
                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors duration-200">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // 过滤和排序资产
  const filteredAssets = React.useMemo(() => {
    let filtered = assets.filter(asset => {
      // 搜索过滤
      const matchesSearch = !searchTerm || 
        asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

      // 分类过滤
      const matchesCategory = !selectedCategory || asset.category === selectedCategory;

      // 类型过滤
      const matchesType = !selectedType || asset.type === selectedType;

      return matchesSearch && matchesCategory && matchesType;
    });

    // 排序
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          const aName = a.name.toLowerCase();
          const bName = b.name.toLowerCase();
          if (sortOrder === 'asc') {
            return aName.localeCompare(bName);
          } else {
            return bName.localeCompare(aName);
          }
        case 'createdAt':
          const aTime = new Date(a.createdAt).getTime();
          const bTime = new Date(b.createdAt).getTime();
          if (sortOrder === 'asc') {
            return aTime - bTime;
          } else {
            return bTime - aTime;
          }
        case 'downloadCount':
          if (sortOrder === 'asc') {
            return a.downloadCount - b.downloadCount;
          } else {
            return b.downloadCount - a.downloadCount;
          }
        case 'rating':
          if (sortOrder === 'asc') {
            return a.rating - b.rating;
          } else {
            return b.rating - a.rating;
          }
        default:
          return 0;
      }
    });

    return filtered;
  }, [assets, searchTerm, selectedCategory, selectedType, sortBy, sortOrder]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 页面标题 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">物料库</h1>
              <p className="text-gray-600 mt-1">管理和分析您的数字资产</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowAIModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-200"
              >
                <Brain className="w-4 h-4" />
                AI分析
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200"
              >
                <Plus className="w-4 h-4" />
                添加物料
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 标签导航 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('assets')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === 'assets'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Folder className="w-4 h-4" />
                物料管理
              </div>
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === 'stats'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                统计分析
              </div>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {activeTab === 'assets' && (
          <>
            {/* 搜索和筛选栏 */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* 搜索框 */}
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="搜索物料..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                </div>
                
                {/* 筛选选项 */}
                <div className="flex flex-wrap gap-3">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="">所有分类</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>

                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="">所有类型</option>
                    {assetTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>

                  <select
                    value={`${sortBy}-${sortOrder}`}
                    onChange={(e) => {
                      const [field, order] = e.target.value.split('-');
                      setSortBy(field as 'name' | 'createdAt' | 'downloadCount' | 'rating');
                      setSortOrder(order as 'asc' | 'desc');
                    }}
                    className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="createdAt-desc">最新创建</option>
                    <option value="createdAt-asc">最早创建</option>
                    <option value="downloadCount-desc">下载最多</option>
                    <option value="rating-desc">评分最高</option>
                    <option value="name-asc">名称 A-Z</option>
                    <option value="name-desc">名称 Z-A</option>
                  </select>
                  
                  <button
                    onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                    className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200"
                  >
                    {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid3X3 className="w-4 h-4" />}
                    {viewMode === 'grid' ? '列表视图' : '网格视图'}
                  </button>
                </div>
              </div>
              
              {/* AI操作按钮 */}
              <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={() => loadAISummary()}
                  disabled={aiAnalyzing}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-200 disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  {aiAnalyzing ? '分析中...' : 'AI总结'}
                </button>

                {selectedAssets.length > 0 && (
                  <button
                    onClick={() => batchAnalyzeAssets()}
                    disabled={aiAnalyzing}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl hover:from-indigo-700 hover:to-indigo-800 transition-all duration-200 disabled:opacity-50"
                  >
                    <Cpu className="w-4 h-4" />
                    {aiAnalyzing ? '分析中...' : '批量分析'}
                  </button>
                )}

                <button
                  onClick={() => {
                    setAiModalType('tags');
                    setShowAIModal(true);
                  }}
                  disabled={aiAnalyzing}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 disabled:opacity-50"
                >
                  <Lightbulb className="w-4 h-4" />
                  智能标签
                </button>
              </div>
            </div>

            {/* 物料网格/列表 */}
            <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}`}>
              {loading ? (
                <div className="col-span-full flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">加载中...</p>
                  </div>
                </div>
              ) : filteredAssets.length > 0 ? (
                filteredAssets.map(renderAssetCard)
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-12">
                  <Folder className="w-16 h-16 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">暂无物料</h3>
                  <p className="text-gray-600 mb-6">开始添加您的第一个物料吧</p>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200"
                  >
                    <Plus className="w-4 h-4" />
                    添加物料
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'stats' && renderStatsTab()}
      </div>

      {/* 文件上传模态框 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900">上传物料文件</h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setUploadFiles([]);
                }}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6 max-h-[calc(90vh-140px)] overflow-y-auto">
              {/* 文件拖拽上传区域 */}
              <div 
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
                  dragActive 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <div className="space-y-2">
                  <p className="text-lg font-medium text-gray-700">拖拽文件到此处或点击选择文件</p>
                  <p className="text-sm text-gray-500">支持图片、文档、音频、视频等多种格式</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={(e) => handleFileSelect(e.target.files)}
                  style={{ display: 'none' }}
                  accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip,.rar"
                />
              </div>

              {/* 已选择的文件列表 */}
              {uploadFiles.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-gray-900">已选择的文件 ({uploadFiles.length})</h4>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {uploadFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{file.name}</div>
                            <div className="text-sm text-gray-500">{formatFileSize(file.size)}</div>
                          </div>
                        </div>
                        <button
                          onClick={() => removeUploadFile(index)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200"
                          type="button"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 上传进度 */}
              {uploading && (
                <div className="space-y-3">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full transition-all duration-300 animate-pulse" style={{ width: '60%' }}></div>
                  </div>
                  <p className="text-center text-gray-600">正在上传文件...</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setUploadFiles([]);
                }}
                className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors duration-200"
                disabled={uploading}
              >
                取消
              </button>
              <button
                onClick={handleUpload}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={uploadFiles.length === 0 || uploading}
              >
                {uploading ? '上传中...' : `上传 ${uploadFiles.length} 个文件`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 编辑物料模态框 */}
      {showEditModal && selectedAsset && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900">编辑物料</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">物料名称 *</label>
                <input
                  type="text"
                  value={selectedAsset.name}
                  onChange={(e) => setSelectedAsset(prev => prev ? { ...prev, name: e.target.value } : null)}
                  placeholder="请输入物料名称"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">描述</label>
                <textarea
                  value={selectedAsset.description}
                  onChange={(e) => setSelectedAsset(prev => prev ? { ...prev, description: e.target.value } : null)}
                  placeholder="请输入物料描述"
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                  style={{ color: 'var(--text-primary)' }}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">标签</label>
                <input
                  type="text"
                  value={selectedAsset.tags.join(', ')}
                  onChange={(e) => setSelectedAsset(prev => prev ? { 
                    ...prev, 
                    tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)
                  } : null)}
                  placeholder="请输入标签，用逗号分隔"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={selectedAsset.isPublic}
                  onChange={(e) => setSelectedAsset(prev => prev ? { ...prev, isPublic: e.target.checked } : null)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <label htmlFor="isPublic" className="text-sm font-medium text-gray-700">
                  公开物料
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors duration-200"
              >
                取消
              </button>
              <button
                onClick={handleUpdateAsset}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors duration-200"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI分析模态框 */}
      {showAIModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900">
                {aiModalType === 'summary' && 'AI智能总结'}
                {aiModalType === 'tags' && '智能标签建议'}
                {aiModalType === 'analyze' && 'AI分析结果'}
              </h2>
              <button
                onClick={() => setShowAIModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              {aiModalType === 'summary' && aiSummary && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Brain className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">AI智能总结</h3>
                  </div>
                  
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      概览
                    </h4>
                    <p className="text-gray-600 leading-relaxed">{aiSummary.overview}</p>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-6">
                    <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                      <BarChart3 className="w-4 h-4" />
                      统计信息
                    </h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-white rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-blue-600">{aiSummary.statistics.totalAssets}</div>
                        <div className="text-sm text-gray-500">总物料数</div>
                      </div>
                      <div className="bg-white rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-green-600">{Object.keys(aiSummary.statistics.categories).length}</div>
                        <div className="text-sm text-gray-500">分类数</div>
                      </div>
                      <div className="bg-white rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold text-purple-600">{Object.keys(aiSummary.statistics.tags).length}</div>
                        <div className="text-sm text-gray-500">标签数</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-6">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      AI洞察
                    </h4>
                    <ul className="space-y-2">
                      {aiSummary.insights.map((insight, index) => (
                        <li key={index} className="flex items-start gap-2 text-gray-600">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                          {insight}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-6">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      建议
                    </h4>
                    <ul className="space-y-2">
                      {aiSummary.recommendations.map((recommendation, index) => (
                        <li key={index} className="flex items-start gap-2 text-gray-600">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                          {recommendation}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-gray-500 pt-4 border-t border-gray-200">
                    <Clock className="w-3 h-3" />
                    生成时间: {new Date(aiSummary.generatedAt).toLocaleString()}
                  </div>
                </div>
              )}

              {aiModalType === 'tags' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Tag className="w-5 h-5 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">智能标签建议</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">输入描述或关键词:</label>
                      <textarea
                        placeholder="请输入物料描述或关键词，AI将为您推荐相关标签..."
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                        style={{ color: 'var(--text-primary)' }}
                      />
                    </div>
                    <button
                      onClick={() => getSmartTagSuggestions('示例描述')}
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={aiAnalyzing}
                    >
                      {aiAnalyzing ? '分析中...' : '获取标签建议'}
                    </button>
                  </div>
                </div>
              )}

              {aiAnalyzing && (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-gray-600">AI正在分析中，请稍候...</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end p-6 border-t border-gray-100">
              <button
                onClick={() => setShowAIModal(false)}
                className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors duration-200"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

        {/* 批量操作工具栏 */}
        {selectedAssets.length > 0 && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white rounded-2xl shadow-2xl border border-gray-200 px-6 py-4 z-40">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                已选择 {selectedAssets.length} 个物料
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => batchAnalyzeAssets()}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={aiAnalyzing}
                >
                  <Cpu className="w-4 h-4" />
                  批量AI分析
                </button>
                <button
                  onClick={selectAllAssets}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors duration-200"
                >
                  全选
                </button>
                <button
                  onClick={clearSelection}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors duration-200"
                >
                  清除选择
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default AssetLibrary;