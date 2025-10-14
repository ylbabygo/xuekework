import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '../../types';
import { Logo } from '../Logo/Logo';
import {
  Bars3Icon,
  BellIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  ChevronDownIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const userNavigation = [
    { name: '个人设置', href: '/settings', icon: Cog6ToothIcon },
    { name: '退出登录', onClick: handleLogout, icon: ArrowRightOnRectangleIcon },
  ];

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-xl border-b border-slate-700/50 shadow-2xl">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* 左侧：Logo和移动端菜单按钮 */}
        <div className="flex items-center space-x-4">
          {/* 移动端菜单按钮 */}
          <button
            type="button"
            className="lg:hidden p-2 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-xl transition-all duration-300 transform hover:scale-105 border border-transparent hover:border-slate-600/30"
            onClick={onMenuClick}
          >
            <span className="sr-only">打开侧边栏</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
          
          {/* Logo */}
          <div className="flex items-center">
            <Logo size="md" showText={true} className="cursor-pointer hover:scale-105 transition-transform duration-200" />
          </div>
        </div>

        {/* 中间：搜索栏 */}
        <div className="flex-1 flex justify-center lg:justify-start lg:ml-8">
          <div className="hidden lg:block w-full max-w-lg">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="搜索AI工具、功能..."
                className="block w-full pl-12 pr-4 py-3 border border-slate-600/30 bg-slate-800/50 text-white placeholder-slate-400 focus:bg-slate-700/70 focus:ring-2 focus:ring-blue-500 focus:border-blue-500/50 focus:outline-none rounded-2xl text-sm transition-all duration-300 shadow-lg hover:shadow-xl backdrop-blur-sm"
              />
            </div>
          </div>
        </div>

        {/* 右侧：通知和用户菜单 */}
        <div className="flex items-center space-x-3">
          {/* 通知按钮 */}
          <button
            type="button"
            className="p-3 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-xl transition-all duration-300 relative transform hover:scale-105 shadow-lg hover:shadow-xl border border-transparent hover:border-slate-600/30"
          >
            <span className="sr-only">查看通知</span>
            <BellIcon className="h-5 w-5" aria-hidden="true" />
            {/* 通知小红点 */}
            <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-gradient-to-r from-red-400 to-pink-500 ring-2 ring-slate-800 animate-pulse"></span>
          </button>

          {/* 用户菜单 */}
          <div className="relative">
            <button
              type="button"
              className="flex items-center space-x-3 p-3 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl border border-transparent hover:border-slate-600/30"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            >
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <UserCircleIcon className="h-8 w-8 text-slate-400" />
                  <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-400 rounded-full ring-2 ring-slate-800"></div>
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-sm font-medium text-white">
                    {user?.username || user?.email?.split('@')[0] || '用户'}
                  </div>
                  <div className="text-xs text-slate-400">
                    {user?.role === UserRole.SUPER_ADMIN ? '管理员' : '普通用户'}
                  </div>
                </div>
                <ChevronDownIcon 
                  className={`h-4 w-4 transition-transform duration-300 ${isUserMenuOpen ? 'rotate-180' : ''}`} 
                />
              </div>
            </button>

            {/* 用户下拉菜单 */}
            {isUserMenuOpen && (
              <>
                {/* 遮罩层 */}
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setIsUserMenuOpen(false)}
                />
                
                {/* 菜单内容 */}
                <div className="absolute right-0 mt-3 w-64 bg-slate-800/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700/50 py-3 z-20 transform transition-all duration-300 animate-in slide-in-from-top-2">
                  {/* 用户信息 */}
                  <div className="px-5 py-4 border-b border-slate-700/50">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <UserCircleIcon className="h-12 w-12 text-blue-400" />
                        <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-400 rounded-full ring-2 ring-slate-800"></div>
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-white">
                          {user?.username || user?.email?.split('@')[0] || '用户'}
                        </div>
                        <div className="text-xs text-slate-400 mt-1">
                          {user?.email || 'user@example.com'}
                        </div>
                        <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-600 to-purple-600 text-white mt-2">
                          {user?.role === UserRole.SUPER_ADMIN ? '管理员' : '普通用户'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 菜单项 */}
                  <div className="py-2">
                    {userNavigation.map((item) => (
                      <button
                        key={item.name}
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          if (item.onClick) {
                            item.onClick();
                          } else if (item.href) {
                            navigate(item.href);
                          }
                        }}
                        className="flex items-center w-full px-5 py-3 text-sm text-slate-300 hover:bg-slate-700/50 hover:text-white transition-all duration-300 group rounded-lg mx-2"
                      >
                        <item.icon className="h-5 w-5 mr-3 text-slate-400 group-hover:text-blue-400 transition-colors duration-200" />
                        <span className="font-medium">{item.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;