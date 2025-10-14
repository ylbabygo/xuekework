import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import {
  ChatBubbleLeftRightIcon,
  PencilSquareIcon,
  ChartBarIcon,
  FolderIcon,
  DocumentTextIcon,
  ListBulletIcon,
  WrenchScrewdriverIcon,
  UserGroupIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { UserRole } from '../types';
import dashboardService, { DashboardStats, RecentActivity } from '../services/dashboardService';

function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const quickActions = [
    {
      name: 'AI助手',
      description: '与智能助手对话，获取专业建议',
      href: '/ai-assistant',
      icon: ChatBubbleLeftRightIcon,
      color: 'from-blue-500 to-blue-600',
    },
    {
      name: '内容生成',
      description: '快速生成营销文案和教学内容',
      href: '/content-generator',
      icon: PencilSquareIcon,
      color: 'from-green-500 to-green-600',
    },
    {
      name: '数据分析',
      description: '深入分析学科运营数据',
      href: '/data-analysis',
      icon: ChartBarIcon,
      color: 'from-purple-500 to-purple-600',
    },
    {
      name: '物料库',
      description: '管理和检索教学物料',
      href: '/asset-library',
      icon: FolderIcon,
      color: 'from-yellow-500 to-yellow-600',
    },
    {
      name: '记事本',
      description: '记录重要信息和想法',
      href: '/notes',
      icon: DocumentTextIcon,
      color: 'from-indigo-500 to-indigo-600',
    },
    {
      name: '待办清单',
      description: '管理日常工作任务',
      href: '/todos',
      icon: ListBulletIcon,
      color: 'from-pink-500 to-pink-600',
    },
    {
      name: 'AI工具',
      description: '发现更多AI工具',
      href: '/ai-tools',
      icon: WrenchScrewdriverIcon,
      color: 'from-orange-500 to-orange-600',
    },
  ];

  // 管理员专用功能
  const adminActions = [
    {
      name: '用户管理',
      description: '管理系统用户和权限',
      href: '/admin/users',
      icon: UserGroupIcon,
      color: 'from-red-500 to-red-600',
    },
  ];

  // 获取仪表盘数据
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await dashboardService.getDashboardData();
        setStats(data.stats);
        setRecentActivities(data.activities);
      } catch (err) {
        console.error('获取仪表盘数据失败:', err);
        setError('获取数据失败，请稍后重试');
        // 设置默认数据作为后备
        setStats([
          { name: '今日AI对话', value: '0', change: '0%', changeType: 'positive' },
          { name: '生成内容数', value: '0', change: '0%', changeType: 'positive' },
          { name: '物料上传', value: '0', change: '0%', changeType: 'positive' },
          { name: '完成任务', value: '0', change: '0%', changeType: 'positive' },
        ]);
        setRecentActivities([]);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  // 图标映射
  const getIconComponent = (iconName: string) => {
    const iconMap: { [key: string]: any } = {
      'ChatBubbleLeftRightIcon': ChatBubbleLeftRightIcon,
      'ChatBubbleLeftIcon': ChatBubbleLeftRightIcon,
      'PencilSquareIcon': PencilSquareIcon,
      'FolderIcon': FolderIcon,
      'ListBulletIcon': ListBulletIcon,
      'DocumentTextIcon': DocumentTextIcon,
      'StarIcon': DocumentTextIcon, // 暂时用DocumentTextIcon代替StarIcon
      'ClipboardDocumentListIcon': DocumentTextIcon, // 暂时用DocumentTextIcon代替ClipboardDocumentListIcon
    };
    return iconMap[iconName] || DocumentTextIcon;
  };

  // 获取统计项的图标和颜色
  const getStatsIconAndColor = (name: string) => {
    const mapping: { [key: string]: { icon: any; color: string } } = {
      '今日AI对话': { icon: ChatBubbleLeftRightIcon, color: 'text-blue-600' },
      '生成内容数': { icon: PencilSquareIcon, color: 'text-green-600' },
      '物料上传': { icon: FolderIcon, color: 'text-yellow-600' },
      '完成任务': { icon: ListBulletIcon, color: 'text-purple-600' },
    };
    return mapping[name] || { icon: DocumentTextIcon, color: 'text-gray-600' };
  };

  // 获取活动图标和颜色的辅助函数
  const getActivityIconAndColor = (type: string) => {
    const iconMap: Record<string, { icon: any; color: string }> = {
      'note': { icon: DocumentTextIcon, color: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' },
      'todo': { icon: ListBulletIcon, color: 'bg-gradient-to-r from-green-500 to-green-600 text-white' },
      'ai_tool': { icon: WrenchScrewdriverIcon, color: 'bg-gradient-to-r from-purple-500 to-purple-600 text-white' },
      'data_analysis': { icon: ChartBarIcon, color: 'bg-gradient-to-r from-orange-500 to-orange-600 text-white' },
      'chat': { icon: ChatBubbleLeftRightIcon, color: 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white' },
    };
    return iconMap[type] || { icon: DocumentTextIcon, color: 'bg-gradient-to-r from-gray-500 to-gray-600 text-white' };
  };

  // 错误处理显示
  if (error) {
    return (
      <div className="space-y-8 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">加载失败</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              重新加载
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      {/* 欢迎信息 - 蔚来风格 */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 rounded-3xl shadow-2xl border border-blue-200/20 p-8 group">
        {/* 背景装饰 */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 via-blue-700/90 to-indigo-800/90"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-yellow-400/20 to-orange-500/20 rounded-full blur-3xl transform translate-x-32 -translate-y-32 group-hover:scale-110 transition-transform duration-700"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-blue-400/20 to-cyan-500/20 rounded-full blur-2xl transform -translate-x-16 translate-y-16 group-hover:scale-110 transition-transform duration-700"></div>
        
        <div className="relative z-10 flex items-center justify-between">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
              欢迎回来，
              <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                {user?.username || user?.email?.split('@')[0] || '用户'}
              </span>
              ！
            </h1>
            <p className="text-blue-100 flex items-center text-lg">
              <ClockIcon className="h-5 w-5 mr-3 text-yellow-400" />
              今天是 {new Date().toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long'
              })}
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-blue-200 mb-2">当前角色</div>
            <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
              {user?.role === UserRole.SUPER_ADMIN ? '超级管理员' : '标准用户'}
            </div>
          </div>
        </div>
      </div>

      {/* 数据统计 - 蔚来风格 */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          // 加载状态
          Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6 animate-pulse">
              <div className="flex items-center mb-3">
                <div className="w-9 h-9 bg-gray-300 rounded-xl"></div>
                <div className="ml-3 w-20 h-4 bg-gray-300 rounded"></div>
              </div>
              <div className="w-16 h-8 bg-gray-300 rounded mb-4"></div>
              <div className="w-12 h-6 bg-gray-300 rounded ml-auto"></div>
            </div>
          ))
        ) : (
          stats.map((item, index) => {
            const { icon: IconComponent, color } = getStatsIconAndColor(item.name);
            return (
              <div 
                key={item.name} 
                className="group relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6 hover:shadow-2xl hover:border-blue-300/50 transition-all duration-500 transform hover:-translate-y-2"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* 背景光效 */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/30 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-400/20 to-purple-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center mb-3">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                          <IconComponent className="h-5 w-5 text-white" />
                        </div>
                        <p className="text-sm font-medium text-gray-600 ml-3 group-hover:text-gray-800 transition-colors duration-300">{item.name}</p>
                      </div>
                      <p className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent group-hover:from-blue-600 group-hover:to-indigo-600 transition-all duration-300">
                        {item.value}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-end">
                    <div className={`flex items-center px-3 py-1 rounded-full transition-all duration-300 ${
                      item.changeType === 'positive' 
                        ? 'bg-gradient-to-r from-green-100 to-emerald-100 group-hover:from-green-200 group-hover:to-emerald-200' 
                        : 'bg-gradient-to-r from-red-100 to-pink-100 group-hover:from-red-200 group-hover:to-pink-200'
                    }`}>
                      <ArrowTrendingUpIcon className={`h-4 w-4 mr-1 ${
                        item.changeType === 'positive' ? 'text-green-600' : 'text-red-600 transform rotate-180'
                      }`} />
                      <span className={`text-sm font-semibold ${
                        item.changeType === 'positive' ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {item.change}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 快速操作 - 蔚来风格 */}
      <div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-8">快速操作</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {quickActions.map((action, index) => (
            <Link
              key={action.name}
              to={action.href}
              className="group relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6 hover:shadow-2xl hover:border-blue-300/50 transition-all duration-500 transform hover:-translate-y-3 hover:scale-105"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* 背景光效 */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-indigo-50/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-400/10 to-purple-500/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              {/* 悬停光线效果 */}
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute top-0 left-1/4 w-1/2 h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent"></div>
                <div className="absolute bottom-0 right-1/4 w-1/2 h-px bg-gradient-to-r from-transparent via-purple-400 to-transparent"></div>
              </div>
              
              <div className="relative z-10 flex items-start space-x-4">
                <div className={`flex-shrink-0 p-4 rounded-2xl bg-gradient-to-r ${action.color} shadow-lg group-hover:shadow-2xl transition-all duration-300 transform group-hover:scale-110 group-hover:rotate-3`}>
                  <action.icon className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1 space-y-2">
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                    {action.name}
                  </h3>
                  <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors duration-300 leading-relaxed">
                    {action.description}
                  </p>
                </div>
              </div>
              
              {/* 底部装饰线 */}
              <div className="absolute bottom-0 left-0 w-0 h-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full group-hover:w-full transition-all duration-500"></div>
            </Link>
          ))}

          {/* 管理员专用功能 */}
          {user?.role === UserRole.SUPER_ADMIN &&
            adminActions.map((action, index) => (
              <Link
                key={action.name}
                to={action.href}
                className="group relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-6 hover:shadow-2xl hover:border-red-300/50 transition-all duration-500 transform hover:-translate-y-3 hover:scale-105"
                style={{ animationDelay: `${(quickActions.length + index) * 50}ms` }}
              >
                {/* 背景光效 - 管理员专用红色主题 */}
                <div className="absolute inset-0 bg-gradient-to-br from-red-50/30 to-orange-50/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-red-400/10 to-orange-500/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* 悬停光线效果 */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute top-0 left-1/4 w-1/2 h-px bg-gradient-to-r from-transparent via-red-400 to-transparent"></div>
                  <div className="absolute bottom-0 right-1/4 w-1/2 h-px bg-gradient-to-r from-transparent via-orange-400 to-transparent"></div>
                </div>
                
                <div className="relative z-10 flex items-start space-x-4">
                  <div className={`flex-shrink-0 p-4 rounded-2xl bg-gradient-to-r ${action.color} shadow-lg group-hover:shadow-2xl transition-all duration-300 transform group-hover:scale-110 group-hover:rotate-3`}>
                    <action.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-red-600 transition-colors duration-300">
                      {action.name}
                    </h3>
                    <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors duration-300 leading-relaxed">
                      {action.description}
                    </p>
                  </div>
                </div>
                
                {/* 底部装饰线 - 管理员专用红色 */}
                <div className="absolute bottom-0 left-0 w-0 h-1 bg-gradient-to-r from-red-500 to-orange-600 rounded-full group-hover:w-full transition-all duration-500"></div>
              </Link>
            ))}
        </div>
      </div>

      {/* 最近活动 - 蔚来风格 */}
      <div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-8">最近活动</h2>
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-8 hover:shadow-xl transition-all duration-500">
          <div className="space-y-6">
            {loading ? (
              // 加载状态
              Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex items-center space-x-6 p-4 rounded-xl animate-pulse">
                  <div className="w-12 h-12 bg-gray-300 rounded-xl"></div>
                  <div className="flex-1 space-y-2">
                    <div className="w-3/4 h-4 bg-gray-300 rounded"></div>
                    <div className="w-1/2 h-3 bg-gray-300 rounded"></div>
                  </div>
                </div>
              ))
            ) : recentActivities.length > 0 ? (
              recentActivities.map((activity, index) => {
                const IconComponent = getIconComponent(activity.icon);
                return (
                  <div 
                    key={index} 
                    className="group flex items-center space-x-6 p-4 rounded-xl hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/30 transition-all duration-300 transform hover:scale-[1.02]"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className={`flex-shrink-0 p-3 rounded-xl ${activity.color} shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110`}>
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-gray-900 font-semibold group-hover:text-blue-600 transition-colors duration-300">
                        {activity.title}
                      </p>
                      <p className="text-sm text-gray-500 group-hover:text-gray-600 transition-colors duration-300 flex items-center">
                        <ClockIcon className="h-4 w-4 mr-1" />
                        {activity.time}
                      </p>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8">
                <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">暂无最近活动</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;