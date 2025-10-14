import React, { useState } from 'react';
import { 
  StarIcon,
  HeartIcon,
  EyeIcon,
  LinkIcon,
  SparklesIcon,
  FireIcon,
  TrophyIcon,
  DevicePhoneMobileIcon,
  CpuChipIcon,
  CodeBracketIcon,
  GlobeAltIcon,
  BookmarkIcon,
  ShareIcon
} from '@heroicons/react/24/outline';
import { 
  HeartIcon as HeartSolidIcon, 
  StarIcon as StarSolidIcon,
  BookmarkIcon as BookmarkSolidIcon,
  FireIcon as FireSolidIcon
} from '@heroicons/react/24/solid';
import { AITool } from '../../types';

interface AIToolCardProps {
  tool: AITool;
  viewMode?: 'grid' | 'list' | 'compact';
  isFavorited?: boolean;
  isBookmarked?: boolean;
  onFavorite?: (toolId: string) => void;
  onBookmark?: (toolId: string) => void;
  onVisit?: (toolId: string) => void;
  className?: string;
}

export function AIToolCard({
  tool,
  viewMode = 'grid',
  isFavorited = false,
  isBookmarked = false,
  onFavorite,
  onBookmark,
  onVisit,
  className = ''
}: AIToolCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFavorite?.(tool.id);
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    onBookmark?.(tool.id);
  };

  const handleVisit = () => {
    onVisit?.(tool.id);
    window.open(tool.url, '_blank');
  };

  if (viewMode === 'list') {
    return (
      <div 
        className={`group relative bg-gradient-to-r from-white/95 to-blue-50/95 backdrop-blur-xl border border-blue-100/50 rounded-2xl p-6 hover:border-blue-300/50 hover:shadow-xl transition-all duration-500 hover:scale-[1.01] cursor-pointer ${className}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleVisit}
      >
        <div className="flex items-center gap-6">
          {/* Logo */}
          <div className="relative flex-shrink-0">
            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
              {tool.logo_url ? (
                <img 
                  src={tool.logo_url} 
                  alt={tool.name}
                  className={`w-full h-full object-cover transition-all duration-500 ${imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-110'}`}
                  onLoad={() => setImageLoaded(true)}
                />
              ) : (
                <SparklesIcon className="w-8 h-8 text-white" />
              )}
            </div>
            {/* 悬停光效 */}
            <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-400/20 to-purple-400/20 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`} />
          </div>

          {/* 基本信息 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                {tool.name}
              </h3>
              <span className="px-3 py-1 bg-blue-100 text-blue-600 text-sm rounded-full font-medium">
                {tool.category}
              </span>
              {/* 状态标签 */}
              {tool.is_featured && (
                <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs rounded-full">
                  <TrophyIcon className="w-3 h-3" />
                  精选
                </div>
              )}
              {tool.is_trending && (
                <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-red-400 to-pink-400 text-white text-xs rounded-full">
                  <FireSolidIcon className="w-3 h-3" />
                  热门
                </div>
              )}
            </div>
            
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {tool.short_description || tool.description}
            </p>
            
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <StarSolidIcon className="w-4 h-4 text-yellow-400" />
                <span className="font-medium">{tool.rating.toFixed(1)}</span>
              </div>
              <div className="flex items-center gap-1">
                <EyeIcon className="w-4 h-4" />
                <span>{tool.view_count || 0}</span>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                tool.pricing === 'free' || tool.free_tier
                  ? 'bg-green-100 text-green-600' 
                  : 'bg-blue-100 text-blue-600'
              }`}>
                {tool.pricing === 'free' ? '免费' : tool.pricing}
              </span>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleFavorite}
              className={`p-3 rounded-xl transition-all duration-300 transform hover:scale-110 ${
                isFavorited 
                  ? 'bg-red-100 text-red-500 shadow-lg' 
                  : 'bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-500'
              }`}
            >
              {isFavorited ? <HeartSolidIcon className="w-5 h-5" /> : <HeartIcon className="w-5 h-5" />}
            </button>
            
            <button
              onClick={handleBookmark}
              className={`p-3 rounded-xl transition-all duration-300 transform hover:scale-110 ${
                isBookmarked 
                  ? 'bg-blue-100 text-blue-500 shadow-lg' 
                  : 'bg-gray-100 text-gray-400 hover:bg-blue-50 hover:text-blue-500'
              }`}
            >
              {isBookmarked ? <BookmarkSolidIcon className="w-5 h-5" /> : <BookmarkIcon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (viewMode === 'compact') {
    return (
      <div 
        className={`group relative bg-gradient-to-r from-white/95 to-blue-50/95 backdrop-blur-xl border border-blue-100/50 rounded-xl p-4 hover:border-blue-300/50 hover:shadow-lg transition-all duration-300 hover:scale-[1.01] cursor-pointer ${className}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleVisit}
      >
        <div className="flex items-center gap-3">
          {/* Logo */}
          <div className="relative flex-shrink-0">
            <div className="w-10 h-10 rounded-lg overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md">
              {tool.logo_url ? (
                <img 
                  src={tool.logo_url} 
                  alt={tool.name}
                  className={`w-full h-full object-cover transition-all duration-500 ${imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-110'}`}
                  onLoad={() => setImageLoaded(true)}
                />
              ) : (
                <SparklesIcon className="w-5 h-5 text-white" />
              )}
            </div>
          </div>

          {/* 基本信息 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-300 truncate">
                {tool.name}
              </h3>
              <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-xs rounded-full font-medium flex-shrink-0">
                {tool.category}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <StarSolidIcon className="w-3 h-3 text-yellow-400" />
                <span>{tool.rating.toFixed(1)}</span>
              </div>
              <span>{tool.view_count?.toLocaleString() || 0} 次访问</span>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleFavorite}
              className={`p-2 rounded-lg transition-all duration-300 transform hover:scale-110 ${
                isFavorited 
                  ? 'bg-red-100 text-red-500 shadow-md' 
                  : 'bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-500'
              }`}
            >
              {isFavorited ? <HeartSolidIcon className="w-4 h-4" /> : <HeartIcon className="w-4 h-4" />}
            </button>
            
            <button
              onClick={handleBookmark}
              className={`p-2 rounded-lg transition-all duration-300 transform hover:scale-110 ${
                isBookmarked 
                  ? 'bg-blue-100 text-blue-500 shadow-md' 
                  : 'bg-gray-100 text-gray-400 hover:bg-blue-50 hover:text-blue-500'
              }`}
            >
              {isBookmarked ? <BookmarkSolidIcon className="w-4 h-4" /> : <BookmarkIcon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Grid模式
  return (
    <div 
      className={`group relative bg-gradient-to-br from-white/95 via-blue-50/50 to-purple-50/30 backdrop-blur-xl border border-blue-100/50 rounded-3xl p-6 hover:border-blue-300/50 hover:shadow-2xl transition-all duration-500 hover:scale-[1.03] cursor-pointer overflow-hidden ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleVisit}
    >
      {/* 背景装饰 */}
      <div className={`absolute inset-0 bg-gradient-to-br from-blue-400/5 via-purple-400/5 to-pink-400/5 transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'}`} />
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-400/10 to-transparent rounded-full transition-all duration-700 ${isHovered ? 'scale-150 opacity-100' : 'scale-100 opacity-0'}`} />
      
      {/* 状态标签 */}
      <div className="absolute top-4 right-4 flex gap-1 z-10">
        {tool.is_featured && (
          <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs rounded-full shadow-lg animate-pulse">
            <TrophyIcon className="w-3 h-3" />
            精选
          </div>
        )}
        {tool.is_trending && (
          <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-red-400 to-pink-400 text-white text-xs rounded-full shadow-lg">
            <FireSolidIcon className="w-3 h-3" />
            热门
          </div>
        )}
        {tool.is_new && (
          <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-green-400 to-emerald-400 text-white text-xs rounded-full shadow-lg">
            <SparklesIcon className="w-3 h-3" />
            新品
          </div>
        )}
      </div>

      {/* 工具Logo和基本信息 */}
      <div className="relative z-10 flex items-start gap-4 mb-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-xl">
            {tool.logo_url ? (
              <img 
                src={tool.logo_url} 
                alt={tool.name}
                className={`w-full h-full object-cover transition-all duration-500 ${imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-110'}`}
                onLoad={() => setImageLoaded(true)}
              />
            ) : (
              <SparklesIcon className="w-8 h-8 text-white" />
            )}
          </div>
          {/* Logo悬停效果 */}
          <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-400/30 to-purple-400/30 transition-all duration-300 ${isHovered ? 'opacity-100 scale-110' : 'opacity-0 scale-100'}`} />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors duration-300">
            {tool.name}
          </h3>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full font-medium">
              {tool.category}
            </span>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <StarSolidIcon className="w-3 h-3 text-yellow-400" />
              <span>{tool.rating.toFixed(1)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 工具描述 */}
      <p className="relative z-10 text-gray-600 text-sm mb-4 line-clamp-3">
        {tool.short_description || tool.description}
      </p>

      {/* 特性标签 */}
      <div className="relative z-10 flex flex-wrap gap-1 mb-4">
        {tool.tags.slice(0, 3).map(tag => (
          <span 
            key={tag}
            className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full border border-gray-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all duration-200"
          >
            {tag}
          </span>
        ))}
        {tool.tags.length > 3 && (
          <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-full border border-gray-200">
            +{tool.tags.length - 3}
          </span>
        )}
      </div>

      {/* 平台和特性图标 */}
      <div className="relative z-10 flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {tool.api_available && (
            <div className="p-1 bg-blue-100 rounded-lg" title="API可用">
              <CpuChipIcon className="w-4 h-4 text-blue-500" />
            </div>
          )}
          {tool.open_source && (
            <div className="p-1 bg-green-100 rounded-lg" title="开源">
              <CodeBracketIcon className="w-4 h-4 text-green-500" />
            </div>
          )}
          {tool.mobile_app && (
            <div className="p-1 bg-purple-100 rounded-lg" title="移动应用">
              <DevicePhoneMobileIcon className="w-4 h-4 text-purple-500" />
            </div>
          )}
          {tool.chrome_extension && (
            <div className="p-1 bg-orange-100 rounded-lg" title="浏览器扩展">
              <GlobeAltIcon className="w-4 h-4 text-orange-500" />
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-1">
          {tool.difficulty_level && (
            <span className={`px-2 py-1 text-xs rounded-full font-medium ${
              tool.difficulty_level === 'beginner' ? 'bg-green-100 text-green-600' :
              tool.difficulty_level === 'intermediate' ? 'bg-yellow-100 text-yellow-600' :
              'bg-red-100 text-red-600'
            }`}>
              {tool.difficulty_level === 'beginner' ? '初级' : 
               tool.difficulty_level === 'intermediate' ? '中级' : '高级'}
            </span>
          )}
        </div>
      </div>

      {/* 底部操作区 */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 text-sm rounded-xl font-medium shadow-sm ${
            tool.pricing === 'free' || tool.free_tier
              ? 'bg-gradient-to-r from-green-400 to-emerald-400 text-white' 
              : tool.pricing.includes('freemium')
              ? 'bg-gradient-to-r from-blue-400 to-cyan-400 text-white'
              : 'bg-gradient-to-r from-purple-400 to-pink-400 text-white'
          }`}>
            {tool.pricing === 'free' ? '免费' : 
             tool.pricing.includes('freemium') ? '免费试用' : 
             tool.pricing}
          </span>
          
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <EyeIcon className="w-3 h-3" />
            <span>{tool.view_count || 0}</span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleFavorite}
            className={`p-2 rounded-xl transition-all duration-300 transform hover:scale-110 ${
              isFavorited 
                ? 'bg-red-100 text-red-500 shadow-lg' 
                : 'bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-500'
            }`}
          >
            {isFavorited ? <HeartSolidIcon className="w-4 h-4" /> : <HeartIcon className="w-4 h-4" />}
          </button>
          
          <button
            onClick={handleBookmark}
            className={`p-2 rounded-xl transition-all duration-300 transform hover:scale-110 ${
              isBookmarked 
                ? 'bg-blue-100 text-blue-500 shadow-lg' 
                : 'bg-gray-100 text-gray-400 hover:bg-blue-50 hover:text-blue-500'
            }`}
          >
            {isBookmarked ? <BookmarkSolidIcon className="w-4 h-4" /> : <BookmarkIcon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AIToolCard;