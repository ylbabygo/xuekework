import React, { useState, useEffect, useMemo } from 'react';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  StarIcon,
  HeartIcon,
  EyeIcon,
  LinkIcon,
  TagIcon,
  SparklesIcon,
  FireIcon,
  TrophyIcon,
  ClockIcon,
  GlobeAltIcon,
  DevicePhoneMobileIcon,
  CpuChipIcon,
  CodeBracketIcon,
  BoltIcon,
  CheckBadgeIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ChartBarIcon,
  BookmarkIcon,
  ShareIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';
import { 
  HeartIcon as HeartSolidIcon, 
  StarIcon as StarSolidIcon,
  BookmarkIcon as BookmarkSolidIcon,
  FireIcon as FireSolidIcon
} from '@heroicons/react/24/solid';
import { aiToolsApi } from '../services/api';
import { AITool } from '../types';
import { AIToolCard } from '../components/AIToolCard';

interface AIToolsState {
  tools: AITool[];
  categories: string[];
  tags: string[];
  loading: boolean;
  error: string | null;
  favorites: Set<string>;
  bookmarks: Set<string>;
}

interface Filters {
  search: string;
  category: string;
  subcategory: string;
  tags: string[];
  rating: number;
  pricing: string[];
  features: string[];
  difficulty: string;
  platforms: string[];
  showFeatured: boolean;
  showTrending: boolean;
  showNew: boolean;
  showOpenSource: boolean;
  showFreeTier: boolean;
}

interface ViewMode {
  type: 'grid' | 'list' | 'compact';
  sortBy: 'rating' | 'views' | 'name' | 'newest' | 'trending' | 'popularity';
  sortOrder: 'asc' | 'desc';
}

function AITools() {
  const [state, setState] = useState<AIToolsState>({
    tools: [],
    categories: [],
    tags: [],
    loading: true,
    error: null,
    favorites: new Set<string>(),
    bookmarks: new Set<string>()
  });

  const [filters, setFilters] = useState<Filters>({
    search: '',
    category: '',
    subcategory: '',
    tags: [],
    rating: 0,
    pricing: [],
    features: [],
    difficulty: '',
    platforms: [],
    showFeatured: false,
    showTrending: false,
    showNew: false,
    showOpenSource: false,
    showFreeTier: false
  });

  const [viewMode, setViewMode] = useState<ViewMode>({
    type: 'grid',
    sortBy: 'rating',
    sortOrder: 'desc'
  });

  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTool, setSelectedTool] = useState<AITool | null>(null);

  // 加载数据
  useEffect(() => {
    loadData();
  }, []);

  // 根据筛选器加载数据
  useEffect(() => {
    loadFilteredData();
  }, [filters, viewMode.sortBy, viewMode.sortOrder]);

  const loadData = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const [categoriesResponse, tagsResponse] = await Promise.all([
        aiToolsApi.getAIToolCategories(),
        aiToolsApi.getAIToolTags()
      ]);

      setState(prev => ({
        ...prev,
        categories: categoriesResponse.data || [],
        tags: tagsResponse.data || [],
      }));

      // 加载初始工具数据
      await loadFilteredData();

      // 加载用户收藏和书签
      try {
        const [favoritesResponse, bookmarksResponse] = await Promise.all([
          aiToolsApi.getUserFavorites(),
          aiToolsApi.getUserBookmarks?.() || Promise.resolve({ data: [] })
        ]);
        const favoritesSet = new Set(favoritesResponse.data?.map((tool: AITool) => tool.id) || []);
        const bookmarksSet = new Set(bookmarksResponse.data?.data?.map((tool: AITool) => tool.id) || []);
        
        setFavorites(favoritesSet);
        setBookmarks(bookmarksSet);
        
        setState(prev => ({
          ...prev,
          favorites: favoritesSet,
          bookmarks: bookmarksSet
        }));
      } catch (error) {
        console.log('未登录或获取用户数据失败');
      }

    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: '加载AI工具数据失败'
      }));
    }
  };

  const loadFilteredData = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const params = {
        category: filters.category || undefined,
        subcategory: filters.subcategory || undefined,
        search: filters.search || undefined,
        tags: filters.tags.length > 0 ? filters.tags : undefined,
        rating: filters.rating > 0 ? filters.rating : undefined,
        pricing: filters.pricing.length > 0 ? filters.pricing.join(',') : undefined,
        is_trending: filters.showTrending || undefined,
        is_new: filters.showNew || undefined,
        open_source: filters.showOpenSource || undefined,
        free_tier: filters.showFreeTier || undefined,
        difficulty_level: filters.difficulty || undefined,
        sort: viewMode.sortBy,
        page: 1,
        limit: 50
      };

      const toolsResponse = await aiToolsApi.getAITools(params);

      setState(prev => ({
        ...prev,
        tools: toolsResponse.data?.data || [],
        loading: false
      }));

    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: '加载AI工具数据失败'
      }));
    }
  };

  // 筛选和排序工具
  const filteredTools = useMemo(() => {
    let filtered = state.tools.filter(tool => {
      // 搜索过滤
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        if (!tool.name.toLowerCase().includes(searchLower) &&
            !tool.description.toLowerCase().includes(searchLower) &&
            !tool.tags.some(tag => tag.toLowerCase().includes(searchLower))) {
          return false;
        }
      }

      // 分类过滤
      if (filters.category && tool.category !== filters.category) return false;
      if (filters.subcategory && tool.subcategory !== filters.subcategory) return false;

      // 标签过滤
      if (filters.tags.length > 0 && !filters.tags.some(tag => tool.tags.includes(tag))) return false;

      // 评分过滤
      if (filters.rating > 0 && tool.rating < filters.rating) return false;

      // 定价过滤
      if (filters.pricing.length > 0) {
        const toolPricing = tool.pricing.toLowerCase();
        if (!filters.pricing.some(p => toolPricing.includes(p.toLowerCase()))) return false;
      }

      // 特性过滤
      if (filters.showFeatured && !tool.is_featured) return false;
      if (filters.showTrending && !tool.is_trending) return false;
      if (filters.showNew && !tool.is_new) return false;
      if (filters.showOpenSource && !tool.open_source) return false;
      if (filters.showFreeTier && !tool.free_tier) return false;

      // 难度过滤
      if (filters.difficulty && tool.difficulty_level !== filters.difficulty) return false;

      // 平台过滤
      if (filters.platforms.length > 0 && tool.platforms) {
        if (!filters.platforms.some(p => tool.platforms!.includes(p))) return false;
      }

      return true;
    });

    // 排序
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (viewMode.sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'rating':
          comparison = b.rating - a.rating;
          break;
        case 'views':
          comparison = (b.view_count || 0) - (a.view_count || 0);
          break;
        case 'newest':
          comparison = new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          break;
        case 'trending':
          comparison = (b.like_count || 0) - (a.like_count || 0);
          break;
        case 'popularity':
          comparison = (b.monthly_visits || 0) - (a.monthly_visits || 0);
          break;
        default:
          comparison = 0;
      }
      return viewMode.sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [state.tools, filters, viewMode]);

  // 获取统计数据
  const stats = useMemo(() => {
    const tools = state.tools;
    return {
      total: tools.length,
      featured: tools.filter(t => t.is_featured).length,
      trending: tools.filter(t => t.is_trending).length,
      new: tools.filter(t => t.is_new).length,
      free: tools.filter(t => t.free_tier).length,
      openSource: tools.filter(t => t.open_source).length,
      categories: new Set(tools.map(t => t.category)).size
    };
  }, [state.tools]);

  // 切换收藏
  const toggleFavorite = async (toolId: string) => {
    try {
      if (state.favorites.has(toolId)) {
        await aiToolsApi.removeFavorite(toolId);
        setState(prev => ({
          ...prev,
          favorites: new Set(Array.from(prev.favorites).filter(id => id !== toolId))
        }));
        setFavorites(prev => {
          const newSet = new Set(prev);
          newSet.delete(toolId);
          return newSet;
        });
      } else {
        await aiToolsApi.addFavorite(toolId);
        setState(prev => ({
          ...prev,
          favorites: new Set([...Array.from(prev.favorites), toolId])
        }));
        setFavorites(prev => new Set(prev).add(toolId));
      }
    } catch (error) {
      console.error('操作收藏失败:', error);
    }
  };

  // 切换书签
  const toggleBookmark = async (toolId: string) => {
    try {
      if (state.bookmarks.has(toolId)) {
        await aiToolsApi.removeBookmark?.(toolId);
        setState(prev => ({
          ...prev,
          bookmarks: new Set(Array.from(prev.bookmarks).filter(id => id !== toolId))
        }));
        setBookmarks(prev => {
          const newSet = new Set(prev);
          newSet.delete(toolId);
          return newSet;
        });
      } else {
        await aiToolsApi.addBookmark?.(toolId);
        setState(prev => ({
          ...prev,
          bookmarks: new Set([...Array.from(prev.bookmarks), toolId])
        }));
        setBookmarks(prev => new Set(prev).add(toolId));
      }
    } catch (error) {
      console.error('操作书签失败:', error);
    }
  };

  // 访问工具
  const visitTool = async (tool: AITool) => {
    try {
      await aiToolsApi.incrementViews(tool.id);
      window.open(tool.url, '_blank');
    } catch (error) {
      console.error('记录访问失败:', error);
      window.open(tool.url, '_blank');
    }
  };

  // 分享工具
  const shareTool = async (tool: AITool) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: tool.name,
          text: tool.description,
          url: tool.url
        });
      } catch (error) {
        console.log('分享取消');
      }
    } else {
      // 复制到剪贴板
      navigator.clipboard.writeText(`${tool.name}: ${tool.url}`);
      // 这里可以添加提示消息
    }
  };

  // 渲染工具卡片 - 网格模式
  const renderGridCard = (tool: AITool) => (
    <div key={tool.id} className="group relative bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6 hover:border-blue-500/50 hover:bg-gray-900/70 transition-all duration-300 hover:scale-[1.02]">
      {/* 状态标签 */}
      <div className="absolute top-4 right-4 flex gap-1">
        {tool.is_featured && (
          <span className="px-2 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs rounded-full flex items-center gap-1">
            <TrophyIcon className="w-3 h-3" />
            精选
          </span>
        )}
        {tool.is_trending && (
          <span className="px-2 py-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full flex items-center gap-1">
            <FireSolidIcon className="w-3 h-3" />
            热门
          </span>
        )}
        {tool.is_new && (
          <span className="px-2 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs rounded-full flex items-center gap-1">
            <SparklesIcon className="w-3 h-3" />
            新品
          </span>
        )}
      </div>

      {/* 工具Logo和基本信息 */}
      <div className="flex items-start gap-4 mb-4">
        <div className="relative">
          {tool.logo_url ? (
            <img 
              src={tool.logo_url} 
              alt={tool.name}
              className="w-16 h-16 rounded-xl object-cover border border-gray-700"
            />
          ) : (
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <SparklesIcon className="w-8 h-8 text-white" />
            </div>
          )}
          {tool.free_tier && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
              <CheckBadgeIcon className="w-3 h-3 text-white" />
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-white mb-1 truncate">{tool.name}</h3>
          <p className="text-sm text-gray-400 mb-2">{tool.category}</p>
          <div className="flex items-center gap-3 text-sm text-gray-400">
            <div className="flex items-center gap-1">
              <StarSolidIcon className="w-4 h-4 text-yellow-400" />
              <span>{tool.rating.toFixed(1)}</span>
              {tool.rating_count && <span>({tool.rating_count})</span>}
            </div>
            <div className="flex items-center gap-1">
              <EyeIcon className="w-4 h-4" />
              <span>{tool.view_count || 0}</span>
            </div>
            {tool.monthly_visits && (
              <div className="flex items-center gap-1">
                <ChartBarIcon className="w-4 h-4" />
                <span>{tool.monthly_visits.toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 工具描述 */}
      <p className="text-gray-300 text-sm mb-4 line-clamp-2">
        {tool.short_description || tool.description}
      </p>

      {/* 特性标签 */}
      <div className="flex flex-wrap gap-1 mb-4">
        {tool.tags.slice(0, 4).map(tag => (
          <span 
            key={tag}
            className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded-full border border-gray-700"
          >
            {tag}
          </span>
        ))}
        {tool.tags.length > 4 && (
          <span className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded-full border border-gray-700">
            +{tool.tags.length - 4}
          </span>
        )}
      </div>

      {/* 平台和特性图标 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {tool.api_available && <CpuChipIcon className="w-4 h-4 text-blue-400" title="API可用" />}
          {tool.open_source && <CodeBracketIcon className="w-4 h-4 text-green-400" title="开源" />}
          {tool.mobile_app && <DevicePhoneMobileIcon className="w-4 h-4 text-purple-400" title="移动应用" />}
          {tool.chrome_extension && <GlobeAltIcon className="w-4 h-4 text-orange-400" title="浏览器扩展" />}
        </div>
        
        <div className="flex items-center gap-1">
          {tool.difficulty_level && (
            <span className={`px-2 py-1 text-xs rounded-full ${
              tool.difficulty_level === 'beginner' ? 'bg-green-500/20 text-green-400' :
              tool.difficulty_level === 'intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-red-500/20 text-red-400'
            }`}>
              {tool.difficulty_level === 'beginner' ? '初级' : 
               tool.difficulty_level === 'intermediate' ? '中级' : '高级'}
            </span>
          )}
        </div>
      </div>

      {/* 定价和操作按钮 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 text-sm rounded-lg font-medium ${
            tool.pricing === 'free' || tool.free_tier
              ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
              : tool.pricing.includes('freemium')
              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
              : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
          }`}>
            {tool.pricing === 'free' ? '免费' : 
             tool.pricing.includes('freemium') ? '免费试用' : 
             tool.pricing_details || tool.pricing}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleFavorite(tool.id)}
            className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
            title="收藏"
          >
            {favorites.has(tool.id) ? (
              <HeartSolidIcon className="w-5 h-5 text-red-500" />
            ) : (
              <HeartIcon className="w-5 h-5 text-gray-400 hover:text-red-400" />
            )}
          </button>
          
          <button
            onClick={() => toggleBookmark(tool.id)}
            className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
            title="书签"
          >
            {bookmarks.has(tool.id) ? (
              <BookmarkSolidIcon className="w-5 h-5 text-blue-500" />
            ) : (
              <BookmarkIcon className="w-5 h-5 text-gray-400 hover:text-blue-400" />
            )}
          </button>
          
          <button
            onClick={() => shareTool(tool)}
            className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
            title="分享"
          >
            <ShareIcon className="w-5 h-5 text-gray-400 hover:text-green-400" />
          </button>
          
          <button
            onClick={() => visitTool(tool)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-sm rounded-lg transition-all duration-200 font-medium"
          >
            <LinkIcon className="w-4 h-4" />
            访问
          </button>
        </div>
      </div>
    </div>
  );

  // 渲染工具卡片 - 列表模式
  const renderListCard = (tool: AITool) => (
    <div key={tool.id} className="group bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6 hover:border-blue-500/50 hover:bg-gray-900/70 transition-all duration-300">
      <div className="flex items-center gap-6">
        {/* Logo */}
        <div className="relative flex-shrink-0">
          {tool.logo_url ? (
            <img 
              src={tool.logo_url} 
              alt={tool.name}
              className="w-12 h-12 rounded-lg object-cover border border-gray-700"
            />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <SparklesIcon className="w-6 h-6 text-white" />
            </div>
          )}
        </div>

        {/* 基本信息 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-white">{tool.name}</h3>
            <span className="text-sm text-gray-400">{tool.category}</span>
            {tool.is_featured && <TrophyIcon className="w-4 h-4 text-yellow-400" />}
            {tool.is_trending && <FireSolidIcon className="w-4 h-4 text-red-400" />}
            {tool.is_new && <SparklesIcon className="w-4 h-4 text-green-400" />}
          </div>
          <p className="text-gray-300 text-sm mb-3 line-clamp-1">
            {tool.short_description || tool.description}
          </p>
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-1">
              <StarSolidIcon className="w-4 h-4 text-yellow-400" />
              <span>{tool.rating.toFixed(1)}</span>
            </div>
            <div className="flex items-center gap-1">
              <EyeIcon className="w-4 h-4" />
              <span>{tool.view_count || 0}</span>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs ${
              tool.pricing === 'free' || tool.free_tier
                ? 'bg-green-500/20 text-green-400' 
                : 'bg-blue-500/20 text-blue-400'
            }`}>
              {tool.pricing === 'free' ? '免费' : tool.pricing}
            </span>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => toggleFavorite(tool.id)}
            className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            {favorites.has(tool.id) ? (
              <HeartSolidIcon className="w-5 h-5 text-red-500" />
            ) : (
              <HeartIcon className="w-5 h-5 text-gray-400" />
            )}
          </button>
          
          <button
            onClick={() => visitTool(tool)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
          >
            <LinkIcon className="w-4 h-4" />
            访问
          </button>
        </div>
      </div>
    </div>
  );

  if (state.loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">加载AI工具中...</p>
        </div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-8 text-center">
        <p className="text-red-400 mb-4">{state.error}</p>
        <button 
          onClick={loadData}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          重试
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <SparklesIcon className="w-8 h-8 text-blue-400" />
              AI工具聚合器
            </h1>
            <p className="text-gray-400">发现和使用最优秀的AI工具，提升工作效率</p>
          </div>
          
          {/* 统计信息 */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-gray-800/50 rounded-lg p-3">
              <div className="text-2xl font-bold text-blue-400">{stats.total}</div>
              <div className="text-xs text-gray-400">总工具数</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3">
              <div className="text-2xl font-bold text-yellow-400">{stats.featured}</div>
              <div className="text-xs text-gray-400">精选工具</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3">
              <div className="text-2xl font-bold text-green-400">{stats.free}</div>
              <div className="text-xs text-gray-400">免费工具</div>
            </div>
          </div>
        </div>

        {/* 搜索和控制栏 */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* 搜索框 */}
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="搜索AI工具、功能、标签..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* 视图模式切换 */}
          <div className="flex items-center gap-2 bg-gray-800/50 rounded-lg p-1">
            <button
              onClick={() => setViewMode(prev => ({ ...prev, type: 'grid' }))}
              className={`p-2 rounded-md transition-colors ${
                viewMode.type === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode(prev => ({ ...prev, type: 'list' }))}
              className={`p-2 rounded-md transition-colors ${
                viewMode.type === 'list' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          {/* 排序选择 */}
          <select
            value={viewMode.sortBy}
            onChange={(e) => setViewMode(prev => ({ ...prev, sortBy: e.target.value as any }))}
            className="px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
          >
            <option value="rating">按评分排序</option>
            <option value="views">按访问量排序</option>
            <option value="name">按名称排序</option>
            <option value="newest">按最新排序</option>
            <option value="trending">按热门排序</option>
            <option value="popularity">按流行度排序</option>
          </select>

          {/* 筛选按钮 */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-3 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 rounded-lg text-white transition-colors"
          >
            <AdjustmentsHorizontalIcon className="w-5 h-5" />
            <span>筛选</span>
            {Object.values(filters).some(v => Array.isArray(v) ? v.length > 0 : v) && (
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            )}
          </button>
        </div>

        {/* 快速筛选标签 */}
        <div className="flex flex-wrap gap-2 mt-4">
          <button
            onClick={() => setFilters(prev => ({ ...prev, showFeatured: !prev.showFeatured }))}
            className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-colors ${
              filters.showFeatured 
                ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' 
                : 'bg-gray-800/50 text-gray-400 border border-gray-700 hover:border-yellow-500/30'
            }`}
          >
            <TrophyIcon className="w-4 h-4" />
            精选
          </button>
          
          <button
            onClick={() => setFilters(prev => ({ ...prev, showTrending: !prev.showTrending }))}
            className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-colors ${
              filters.showTrending 
                ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                : 'bg-gray-800/50 text-gray-400 border border-gray-700 hover:border-red-500/30'
            }`}
          >
            <FireIcon className="w-4 h-4" />
            热门
          </button>
          
          <button
            onClick={() => setFilters(prev => ({ ...prev, showNew: !prev.showNew }))}
            className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-colors ${
              filters.showNew 
                ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                : 'bg-gray-800/50 text-gray-400 border border-gray-700 hover:border-green-500/30'
            }`}
          >
            <SparklesIcon className="w-4 h-4" />
            新品
          </button>
          
          <button
            onClick={() => setFilters(prev => ({ ...prev, showFreeTier: !prev.showFreeTier }))}
            className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-colors ${
              filters.showFreeTier 
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                : 'bg-gray-800/50 text-gray-400 border border-gray-700 hover:border-blue-500/30'
            }`}
          >
            <CurrencyDollarIcon className="w-4 h-4" />
            免费
          </button>
          
          <button
            onClick={() => setFilters(prev => ({ ...prev, showOpenSource: !prev.showOpenSource }))}
            className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-colors ${
              filters.showOpenSource 
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' 
                : 'bg-gray-800/50 text-gray-400 border border-gray-700 hover:border-purple-500/30'
            }`}
          >
            <CodeBracketIcon className="w-4 h-4" />
            开源
          </button>
        </div>

        {/* 高级筛选面板 */}
        {showFilters && (
          <div className="mt-6 p-6 bg-gray-800/30 rounded-lg border border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* 分类筛选 */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">分类</label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">全部分类</option>
                  {state.categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* 评分筛选 */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">最低评分</label>
                <select
                  value={filters.rating}
                  onChange={(e) => setFilters(prev => ({ ...prev, rating: Number(e.target.value) }))}
                  className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value={0}>不限</option>
                  <option value={4.5}>4.5星以上</option>
                  <option value={4}>4星以上</option>
                  <option value={3.5}>3.5星以上</option>
                  <option value={3}>3星以上</option>
                </select>
              </div>

              {/* 定价筛选 */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">定价模式</label>
                <select
                  value={filters.pricing.join(',')}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    pricing: e.target.value ? e.target.value.split(',') : [] 
                  }))}
                  className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">不限</option>
                  <option value="free">免费</option>
                  <option value="freemium">免费试用</option>
                  <option value="paid">付费</option>
                </select>
              </div>

              {/* 难度等级 */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">难度等级</label>
                <select
                  value={filters.difficulty}
                  onChange={(e) => setFilters(prev => ({ ...prev, difficulty: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">不限</option>
                  <option value="beginner">初级</option>
                  <option value="intermediate">中级</option>
                  <option value="advanced">高级</option>
                </select>
              </div>
            </div>

            {/* 重置按钮 */}
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setFilters({
                  search: '',
                  category: '',
                  subcategory: '',
                  tags: [],
                  rating: 0,
                  pricing: [],
                  features: [],
                  difficulty: '',
                  platforms: [],
                  showFeatured: false,
                  showTrending: false,
                  showNew: false,
                  showOpenSource: false,
                  showFreeTier: false
                })}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                重置筛选
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 结果统计 */}
      <div className="flex items-center justify-between text-sm text-gray-400">
        <span>找到 {filteredTools.length} 个AI工具</span>
        <span>共 {state.categories.length} 个分类</span>
      </div>

      {/* 工具列表 */}
      <div className={
        viewMode.type === 'grid' 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          : "space-y-4"
      }>
        {filteredTools.map(tool => (
          <AIToolCard
            key={tool.id}
            tool={tool}
            viewMode={viewMode.type}
            isFavorited={state.favorites.has(tool.id)}
            isBookmarked={state.bookmarks.has(tool.id)}
            onFavorite={() => toggleFavorite(tool.id)}
            onBookmark={() => toggleBookmark(tool.id)}
          />
        ))}
      </div>

      {/* 空状态 */}
      {filteredTools.length === 0 && (
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-12 text-center">
          <SparklesIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">没有找到匹配的AI工具</h3>
          <p className="text-gray-400 mb-6">尝试调整搜索条件或筛选器</p>
          <button
            onClick={() => setFilters({
              search: '',
              category: '',
              subcategory: '',
              tags: [],
              rating: 0,
              pricing: [],
              features: [],
              difficulty: '',
              platforms: [],
              showFeatured: false,
              showTrending: false,
              showNew: false,
              showOpenSource: false,
              showFreeTier: false
            })}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            清除所有筛选
          </button>
        </div>
      )}
    </div>
  );
}

export default AITools;