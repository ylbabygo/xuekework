import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types';
import {
  HomeIcon,
  ChatBubbleLeftRightIcon,
  PencilSquareIcon,
  ChartBarIcon,
  BookOpenIcon,
  FolderIcon,
  DocumentTextIcon,
  ListBulletIcon,
  WrenchScrewdriverIcon,
  Cog6ToothIcon,
  UserGroupIcon,
  XMarkIcon,
  PhotoIcon,
} from '@heroicons/react/24/outline';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user } = useAuth();

  const navigation = [
    { name: '仪表板', href: '/dashboard', icon: HomeIcon },
    { name: 'AI助手', href: '/ai-assistant', icon: ChatBubbleLeftRightIcon },
    { name: '内容生成', href: '/content-generator', icon: PencilSquareIcon },
    { name: '图片生成', href: '/image-generator', icon: PhotoIcon },
    { name: '数据分析', href: '/data-analysis', icon: ChartBarIcon },
    { name: '学习资源', href: '/learning-resources', icon: BookOpenIcon },
    { name: '物料库', href: '/asset-library', icon: FolderIcon },
    { name: '记事本', href: '/notes', icon: DocumentTextIcon },
    { name: '待办清单', href: '/todos', icon: ListBulletIcon },
    { name: 'AI工具', href: '/ai-tools', icon: WrenchScrewdriverIcon },
    { name: '设置', href: '/settings', icon: Cog6ToothIcon },
  ];

  // 管理员专用导航
  const adminNavigation = [
    { name: '用户管理', href: '/admin/users', icon: UserGroupIcon },
  ];

  return (
    <>
      {/* 桌面端侧边栏 */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 backdrop-blur-xl border-r border-slate-700/50 px-6 pb-4 shadow-2xl">
          {/* Logo */}
          <div className="flex h-16 shrink-0 items-center border-b border-slate-700/50">
            <div className="flex items-center space-x-3">
              {/* 新的Logo图标 */}
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-600 rounded-xl shadow-lg flex items-center justify-center transform rotate-3 hover:rotate-0 transition-transform duration-300">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full animate-pulse"></div>
              </div>
              <div>
                <div className="text-white text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  学科AI
                </div>
                <div className="text-slate-400 text-xs font-medium">
                  运营工作台
                </div>
              </div>
            </div>
          </div>

          {/* 导航菜单 */}
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item) => (
                    <li key={item.name}>
                      <NavLink
                        to={item.href}
                        className={({ isActive }) =>
                          `group flex gap-x-3 rounded-xl p-3 text-sm leading-6 font-medium transition-all duration-300 transform hover:scale-105 ${
                            isActive
                              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25 border border-blue-500/30'
                              : 'text-slate-300 hover:text-white hover:bg-slate-700/50 hover:shadow-lg hover:shadow-slate-900/20 border border-transparent hover:border-slate-600/30'
                          }`
                        }
                      >
                        {({ isActive }) => (
                          <>
                            <item.icon className={`h-5 w-5 shrink-0 transition-all duration-300 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'}`} aria-hidden="true" />
                            <span className="relative">
                              {item.name}
                              {isActive && (
                                <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full"></div>
                              )}
                            </span>
                          </>
                        )}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </li>

              {/* 管理员菜单 */}
              {user?.role === UserRole.SUPER_ADMIN && (
                <li>
                  <div className="text-xs font-semibold leading-6 text-slate-400 uppercase tracking-wider mb-2">
                    管理员功能
                  </div>
                  <ul role="list" className="-mx-2 space-y-1">
                    {adminNavigation.map((item) => (
                      <li key={item.name}>
                        <NavLink
                          to={item.href}
                          className={({ isActive }) =>
                            `group flex gap-x-3 rounded-xl p-3 text-sm leading-6 font-medium transition-all duration-300 transform hover:scale-105 ${
                              isActive
                                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25 border border-blue-500/30'
                                : 'text-slate-300 hover:text-white hover:bg-slate-700/50 hover:shadow-lg hover:shadow-slate-900/20 border border-transparent hover:border-slate-600/30'
                            }`
                          }
                        >
                          {({ isActive }) => (
                            <>
                              <item.icon className={`h-5 w-5 shrink-0 transition-all duration-300 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'}`} aria-hidden="true" />
                              <span className="relative">
                                {item.name}
                                {isActive && (
                                  <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full"></div>
                                )}
                              </span>
                            </>
                          )}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                </li>
              )}
            </ul>
          </nav>
        </div>
      </div>

      {/* 移动端侧边栏 */}
      <div className={`relative z-50 lg:hidden ${isOpen ? '' : 'hidden'}`}>
        <div className="fixed inset-0 flex">
          <div className="relative mr-16 flex w-full max-w-xs flex-1">
            <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
              <button
                type="button"
                className="-m-2.5 p-2.5 rounded-full bg-gradient-to-r from-slate-800 to-slate-700 shadow-lg border border-slate-600/50 hover:from-slate-700 hover:to-slate-600 transition-all duration-300"
                onClick={onClose}
              >
                <span className="sr-only">关闭侧边栏</span>
                <XMarkIcon className="h-6 w-6 text-slate-300 hover:text-white transition-colors duration-300" aria-hidden="true" />
              </button>
            </div>

            <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 backdrop-blur-xl px-6 pb-4 shadow-xl">
              {/* Logo */}
              <div className="flex h-16 shrink-0 items-center border-b border-slate-700/50">
                <div className="flex items-center space-x-3">
                  {/* 新的Logo图标 */}
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-600 rounded-xl shadow-lg flex items-center justify-center transform rotate-3 hover:rotate-0 transition-transform duration-300">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full animate-pulse"></div>
                  </div>
                  <div>
                    <div className="text-white text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                      学科AI
                    </div>
                    <div className="text-slate-400 text-xs font-medium">
                      运营工作台
                    </div>
                  </div>
                </div>
              </div>

              {/* 导航菜单 */}
              <nav className="flex flex-1 flex-col">
                <ul role="list" className="flex flex-1 flex-col gap-y-7">
                  <li>
                    <ul role="list" className="-mx-2 space-y-1">
                      {navigation.map((item) => (
                        <li key={item.name}>
                          <NavLink
                            to={item.href}
                            onClick={onClose}
                            className={({ isActive }) =>
                              `group flex gap-x-3 rounded-xl p-3 text-sm leading-6 font-medium transition-all duration-300 transform hover:scale-105 ${
                                isActive
                                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25 border border-blue-500/30'
                                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50 hover:shadow-lg hover:shadow-slate-900/20 border border-transparent hover:border-slate-600/30'
                              }`
                            }
                          >
                            {({ isActive }) => (
                              <>
                                <item.icon className={`h-5 w-5 shrink-0 transition-all duration-300 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'}`} aria-hidden="true" />
                                <span className="relative">
                                  {item.name}
                                  {isActive && (
                                    <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full"></div>
                                  )}
                                </span>
                              </>
                            )}
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  </li>

                  {/* 管理员菜单 */}
                  {user?.role === UserRole.SUPER_ADMIN && (
                    <li>
                      <div className="text-xs font-semibold leading-6 text-slate-400 uppercase tracking-wider mb-2">
                        管理员功能
                      </div>
                      <ul role="list" className="-mx-2 space-y-1">
                        {adminNavigation.map((item) => (
                          <li key={item.name}>
                            <NavLink
                              to={item.href}
                              onClick={onClose}
                              className={({ isActive }) =>
                                `group flex gap-x-3 rounded-xl p-3 text-sm leading-6 font-medium transition-all duration-300 transform hover:scale-105 ${
                                  isActive
                                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25 border border-blue-500/30'
                                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50 hover:shadow-lg hover:shadow-slate-900/20 border border-transparent hover:border-slate-600/30'
                                }`
                              }
                            >
                              {({ isActive }) => (
                                <>
                                  <item.icon className={`h-5 w-5 shrink-0 transition-all duration-300 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'}`} aria-hidden="true" />
                                  <span className="relative">
                                    {item.name}
                                    {isActive && (
                                      <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full"></div>
                                    )}
                                  </span>
                                </>
                              )}
                            </NavLink>
                          </li>
                        ))}
                      </ul>
                    </li>
                  )}
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}