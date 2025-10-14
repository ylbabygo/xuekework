import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { EyeIcon, EyeSlashIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { Logo } from '../components/Logo/Logo';

export function Login() {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number, size: number, opacity: number}>>([]);

  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  // 生成粒子效果
  useEffect(() => {
    const generateParticles = () => {
      const newParticles = [];
      for (let i = 0; i < 50; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 4 + 1,
          opacity: Math.random() * 0.5 + 0.1,
        });
      }
      setParticles(newParticles);
    };

    generateParticles();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await signIn(formData.username, formData.password);
      if (success) {
        navigate(from, { replace: true });
      }
    } catch (error) {
      console.error('登录失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black flex relative overflow-hidden">
      {/* 高级动态背景系统 */}
      <div className="absolute inset-0 overflow-hidden">
        {/* 主要粒子层 */}
        <div className="absolute inset-0">
          {particles.map((particle) => (
            <div
              key={particle.id}
              className="absolute rounded-full"
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                background: `radial-gradient(circle, rgba(59, 130, 246, ${particle.opacity}) 0%, rgba(147, 197, 253, ${particle.opacity * 0.5}) 50%, transparent 100%)`,
                animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 2}s`,
                filter: 'blur(0.5px)',
              }}
            />
          ))}
        </div>
        
        {/* 次要光点层 */}
        <div className="absolute inset-0">
          {particles.slice(0, 20).map((particle) => (
            <div
              key={`glow-${particle.id}`}
              className="absolute rounded-full"
              style={{
                left: `${(particle.x + 10) % 100}%`,
                top: `${(particle.y + 15) % 100}%`,
                width: `${particle.size * 0.3}px`,
                height: `${particle.size * 0.3}px`,
                background: `rgba(34, 197, 94, ${particle.opacity * 0.6})`,
                animation: `float ${4 + Math.random() * 3}s ease-in-out infinite reverse`,
                animationDelay: `${Math.random() * 3}s`,
                filter: 'blur(1px)',
              }}
            />
          ))}
        </div>
      </div>

      {/* 增强的背景渐变光效 */}
      <div className="absolute inset-0">
        {/* 主光源 */}
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-gradient-radial from-blue-500/25 via-blue-600/15 to-transparent rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-gradient-radial from-emerald-500/20 via-cyan-500/15 to-transparent rounded-full blur-3xl animate-pulse" style={{animationDelay: '1.5s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-gradient-radial from-purple-500/15 via-indigo-500/10 to-transparent rounded-full blur-3xl animate-pulse" style={{animationDelay: '3s'}}></div>
        
        {/* 边缘光效 */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-400/30 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent"></div>
        <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-transparent via-blue-400/20 to-transparent"></div>
        <div className="absolute right-0 top-0 w-1 h-full bg-gradient-to-b from-transparent via-emerald-400/20 to-transparent"></div>
      </div>

      {/* 网格背景层 */}
      <div className="absolute inset-0 opacity-20">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px),
              linear-gradient(rgba(34, 197, 94, 0.05) 1px, transparent 1px),
              linear-gradient(90deg, rgba(34, 197, 94, 0.05) 1px, transparent 1px)
            `,
            backgroundSize: '100px 100px, 100px 100px, 50px 50px, 50px 50px',
            backgroundPosition: '0 0, 0 0, 25px 25px, 25px 25px'
          }}
        ></div>
      </div>

      {/* 左侧装饰区域 */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* 多层次背景系统 */}
        <div className="absolute inset-0">
          {/* 主背景渐变 */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-blue-900/60 to-emerald-900/40"></div>
          
          {/* 动态网格背景 */}
          <div className="absolute inset-0 opacity-30">
            <div 
              className="w-full h-full"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(59, 130, 246, 0.2) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(59, 130, 246, 0.2) 1px, transparent 1px),
                  linear-gradient(rgba(34, 197, 94, 0.1) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(34, 197, 94, 0.1) 1px, transparent 1px)
                `,
                backgroundSize: '60px 60px, 60px 60px, 20px 20px, 20px 20px',
                backgroundPosition: '0 0, 0 0, 10px 10px, 10px 10px'
              }}
            ></div>
          </div>
          
          {/* 装饰性光效 */}
          <div className="absolute inset-0">
            <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-400/20 rounded-full blur-2xl animate-pulse"></div>
            <div className="absolute bottom-1/3 right-1/3 w-24 h-24 bg-emerald-400/15 rounded-full blur-xl animate-pulse" style={{animationDelay: '2s'}}></div>
            <div className="absolute top-2/3 left-1/6 w-16 h-16 bg-purple-400/10 rounded-full blur-lg animate-pulse" style={{animationDelay: '4s'}}></div>
          </div>
          
          {/* 边框装饰 */}
          <div className="absolute inset-0 border-r border-white/10"></div>
          <div className="absolute top-0 right-0 w-px h-1/3 bg-gradient-to-b from-blue-400/50 to-transparent"></div>
          <div className="absolute bottom-0 right-0 w-px h-1/3 bg-gradient-to-t from-emerald-400/50 to-transparent"></div>
        </div>
        
        {/* 主要内容 */}
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12">
          <div className="max-w-md text-center">

            
            <h1 className="relative group mb-8">
              {/* 背景光环效果 */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 via-emerald-500/30 to-purple-500/30 blur-3xl transform scale-150 opacity-0 group-hover:opacity-100 transition-all duration-1000 animate-pulse"></div>
              
              {/* 主标题容器 */}
              <div className="relative text-center">
                {/* 顶部装饰图标 */}
                <div className="flex justify-center mb-4">
                  <div className="relative">
                    {/* 主图标 - AI芯片样式 */}
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-400 via-emerald-400 to-purple-400 rounded-xl flex items-center justify-center transform rotate-45 group-hover:rotate-180 transition-transform duration-1000">
                      <div className="w-12 h-12 bg-gradient-to-br from-white/20 to-white/5 rounded-lg transform -rotate-45 flex items-center justify-center backdrop-blur-sm">
                        <SparklesIcon className="w-6 h-6 text-white animate-pulse" />
                      </div>
                    </div>
                    
                    {/* 环绕粒子 */}
                    <div className="absolute -inset-4">
                      <div className="absolute top-0 left-1/2 w-2 h-2 bg-blue-400 rounded-full animate-ping" style={{animationDelay: '0s'}}></div>
                      <div className="absolute top-1/2 right-0 w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" style={{animationDelay: '0.5s'}}></div>
                      <div className="absolute bottom-0 left-1/2 w-1 h-1 bg-purple-400 rounded-full animate-ping" style={{animationDelay: '1s'}}></div>
                      <div className="absolute top-1/2 left-0 w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping" style={{animationDelay: '1.5s'}}></div>
                    </div>
                  </div>
                </div>
                
                {/* 主标题文字 */}
                <div className="text-6xl font-bold tracking-tight leading-tight">
                  {/* 学科运营 */}
                  <div className="relative inline-block">
                    <span className="relative z-10 bg-gradient-to-r from-white via-blue-100 to-emerald-100 bg-clip-text text-transparent">
                      学科运营
                    </span>
                    {/* 文字背景光效 */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400/40 to-emerald-400/40 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                  </div>
                  
                  {/* AI标识 */}
                  <div className="relative inline-block mx-4">
                    <span className="relative z-10 text-5xl font-black bg-gradient-to-r from-emerald-300 via-blue-300 to-purple-300 bg-clip-text text-transparent transform inline-block hover:scale-110 transition-transform duration-300">
                      AI
                    </span>
                    {/* AI背景特效 */}
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/50 to-blue-400/50 blur-md rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse"></div>
                    {/* AI边框 */}
                    <div className="absolute inset-0 border-2 border-gradient-to-r from-emerald-400/30 to-blue-400/30 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </div>
                  
                  {/* 工作台 */}
                  <div className="relative inline-block">
                    <span className="relative z-10 bg-gradient-to-r from-blue-100 via-emerald-100 to-white bg-clip-text text-transparent">
                      工作台
                    </span>
                    {/* 文字背景光效 */}
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/40 to-purple-400/40 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                  </div>
                </div>
                
                {/* 主标题文字 */}
                <div className="text-3xl font-bold tracking-tight leading-tight">
                  {/* 学科运营AI工作台 */}
                  <div className="relative">
                    <span className="relative z-10 bg-gradient-to-r from-white via-blue-100 to-emerald-100 bg-clip-text text-transparent">
                      学科运营
                    </span>
                    <span className="relative z-10 mx-2 text-2xl font-black bg-gradient-to-r from-emerald-300 via-blue-300 to-purple-300 bg-clip-text text-transparent">
                      AI
                    </span>
                    <span className="relative z-10 bg-gradient-to-r from-blue-100 via-emerald-100 to-white bg-clip-text text-transparent">
                      工作台
                    </span>
                    
                    {/* 文字背景光效 */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400/30 via-emerald-400/30 to-purple-400/30 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                  </div>
                </div>
                
                {/* 底部装饰线 */}
                <div className="mt-6 flex justify-center">
                  <div className="relative w-64 h-1">
                    {/* 主装饰线 */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-50"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-30 transform scale-y-150"></div>
                    
                    {/* 动态光点 */}
                    <div className="absolute top-1/2 left-0 w-2 h-2 bg-blue-400 rounded-full transform -translate-y-1/2 animate-ping"></div>
                    <div className="absolute top-1/2 right-0 w-2 h-2 bg-emerald-400 rounded-full transform -translate-y-1/2 animate-ping" style={{animationDelay: '1s'}}></div>
                    <div className="absolute top-1/2 left-1/2 w-1.5 h-1.5 bg-purple-400 rounded-full transform -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
                  </div>
                </div>
                

              </div>
            </h1>

          </div>
        </div>
      </div>

      {/* 右侧登录表单 */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-12 relative">
        {/* 表单区域背景装饰 */}
        <div className="absolute inset-0">
          {/* 渐变背景 */}
          <div className="absolute inset-0 bg-gradient-to-tl from-slate-900/50 via-transparent to-blue-900/30"></div>
          
          {/* 装饰性几何图形 */}
          <div className="absolute top-1/4 right-1/4 w-2 h-2 bg-blue-400/60 rounded-full animate-ping"></div>
          <div className="absolute bottom-1/3 left-1/6 w-1 h-1 bg-emerald-400/60 rounded-full animate-ping" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-1/2 right-1/6 w-1.5 h-1.5 bg-purple-400/60 rounded-full animate-ping" style={{animationDelay: '2s'}}></div>
          
          {/* 微妙的网格 */}
          <div className="absolute inset-0 opacity-5">
            <div 
              className="w-full h-full"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
                `,
                backgroundSize: '40px 40px'
              }}
            ></div>
          </div>
        </div>
        
        <div className="w-full max-w-md relative z-10">
          {/* 移动端标题 */}
          <div className="lg:hidden text-center mb-12">
            <h1 className="relative group mb-4">
              {/* 背景光环效果 */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-emerald-500/20 to-purple-500/20 blur-2xl transform scale-125 opacity-0 group-hover:opacity-100 transition-all duration-1000 animate-pulse"></div>
              
              {/* 主标题容器 */}
              <div className="relative text-center">
                {/* 顶部装饰图标 */}
                <div className="flex justify-center mb-3">
                  <div className="relative">
                    {/* 主图标 - AI芯片样式 */}
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 via-emerald-400 to-purple-400 rounded-lg flex items-center justify-center transform rotate-45 group-hover:rotate-180 transition-transform duration-1000">
                      <div className="w-8 h-8 bg-gradient-to-br from-white/20 to-white/5 rounded-md transform -rotate-45 flex items-center justify-center backdrop-blur-sm">
                        <SparklesIcon className="w-4 h-4 text-white animate-pulse" />
                      </div>
                    </div>
                    
                    {/* 环绕粒子 */}
                    <div className="absolute -inset-3">
                      <div className="absolute top-0 left-1/2 w-1.5 h-1.5 bg-blue-400 rounded-full animate-ping" style={{animationDelay: '0s'}}></div>
                      <div className="absolute top-1/2 right-0 w-1 h-1 bg-emerald-400 rounded-full animate-ping" style={{animationDelay: '0.5s'}}></div>
                      <div className="absolute bottom-0 left-1/2 w-1 h-1 bg-purple-400 rounded-full animate-ping" style={{animationDelay: '1s'}}></div>
                      <div className="absolute top-1/2 left-0 w-1 h-1 bg-cyan-400 rounded-full animate-ping" style={{animationDelay: '1.5s'}}></div>
                    </div>
                  </div>
                </div>
                
                {/* 主标题文字 */}
                <div className="text-3xl font-bold tracking-tight leading-tight">
                  {/* 学科运营AI工作台 */}
                  <div className="relative">
                    <span className="relative z-10 bg-gradient-to-r from-white via-blue-100 to-emerald-100 bg-clip-text text-transparent">
                      学科运营
                    </span>
                    <span className="relative z-10 mx-2 text-2xl font-black bg-gradient-to-r from-emerald-300 via-blue-300 to-purple-300 bg-clip-text text-transparent">
                      AI
                    </span>
                    <span className="relative z-10 bg-gradient-to-r from-blue-100 via-emerald-100 to-white bg-clip-text text-transparent">
                      工作台
                    </span>
                    
                    {/* 文字背景光效 */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400/30 via-emerald-400/30 to-purple-400/30 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                  </div>
                </div>
                
                {/* 底部装饰线 */}
                <div className="mt-4 flex justify-center">
                  <div className="relative w-48 h-0.5">
                    {/* 主装饰线 */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-50"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-30 transform scale-y-150"></div>
                    
                    {/* 动态光点 */}
                    <div className="absolute top-1/2 left-0 w-1.5 h-1.5 bg-blue-400 rounded-full transform -translate-y-1/2 animate-ping"></div>
                    <div className="absolute top-1/2 right-0 w-1.5 h-1.5 bg-emerald-400 rounded-full transform -translate-y-1/2 animate-ping" style={{animationDelay: '1s'}}></div>
                    <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-purple-400 rounded-full transform -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
                  </div>
                </div>
              </div>
            </h1>
            <p className="relative group text-center">
                <span className="block text-blue-200/80 font-light text-sm tracking-wide">
                  <span className="inline-block bg-gradient-to-r from-blue-200 via-emerald-200 to-blue-200 bg-clip-text text-transparent">
                    智能化学科运营管理平台
                  </span>
                  
                  {/* 装饰性光点 */}
                  <span className="inline-block ml-2 w-1 h-1 bg-gradient-to-r from-blue-400 to-emerald-400 rounded-full animate-pulse"></span>
                </span>
            </p>
          </div>

          {/* 登录表单容器 */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
            {/* 表单标题 */}
            <div className="text-center mb-8">
              <h2 className="relative group inline-block">
                <div className="text-4xl font-extralight mb-3 tracking-wide">
                  {/* 背景光效 */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-emerald-400/20 to-purple-400/20 blur-xl transform scale-110 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  {/* 主文字 */}
                  <span className="relative bg-gradient-to-r from-white via-blue-100 to-emerald-100 bg-clip-text text-transparent">
                    欢迎回来
                  </span>
                </div>
                
                {/* 装饰性下划线 */}
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-blue-400 via-emerald-400 to-purple-400 group-hover:w-full transition-all duration-700 ease-out"></div>
                
                {/* 侧边装饰点 */}
                <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-1 h-1 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-1 h-1 bg-emerald-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{transitionDelay: '200ms'}}></div>
              </h2>
              <div className="relative group text-sm flex items-center justify-center gap-2">
                  {/* 背景光效 */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 via-emerald-400/10 to-purple-400/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform scale-110"></div>
                  
                  {/* 图标 */}
                  <SparklesIcon className="relative h-4 w-4 text-blue-300 group-hover:text-emerald-300 transition-colors duration-300 animate-pulse" />
                  
                  {/* 文本 */}
                  <span className="relative text-blue-200 group-hover:text-blue-100 transition-colors duration-300 font-light tracking-wide">
                    请登录您的账户以继续
                  </span>
                  
                  {/* 装饰性点 */}
                  <div className="relative w-1 h-1 bg-emerald-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-ping"></div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 用户名输入 */}
              <div className="space-y-3">
                <label htmlFor="username" className="block text-sm font-medium text-blue-100">
                  用户名
                </label>
                <div className="relative group">
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    className="w-full px-4 py-4 text-white bg-white/5 backdrop-blur-sm border border-white/20 rounded-2xl focus:border-blue-400 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-400/50 transition-all duration-300 placeholder-blue-200/60 hover:bg-white/8"
                    placeholder="请输入用户名"
                    value={formData.username}
                    onChange={handleChange}
                  />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-400/0 via-blue-400/5 to-blue-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
              </div>

              {/* 密码输入 */}
              <div className="space-y-3">
                <label htmlFor="password" className="block text-sm font-medium text-blue-100">
                  密码
                </label>
                <div className="relative group">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="w-full px-4 py-4 pr-12 text-white bg-white/5 backdrop-blur-sm border border-white/20 rounded-2xl focus:border-blue-400 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-400/50 transition-all duration-300 placeholder-blue-200/60 hover:bg-white/8"
                    placeholder="请输入密码"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-200 hover:text-white transition-colors duration-200 p-1"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-400/0 via-blue-400/5 to-blue-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
              </div>

              {/* 登录按钮 */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white py-4 px-6 font-medium text-sm rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-500/25 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                <div className="relative z-10">
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                      登录中...
                    </div>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <SparklesIcon className="h-4 w-4" />
                      登录
                    </span>
                  )}
                </div>
              </button>
              
              {/* 帮助链接 */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-400">
                  登录后即可在设置中配置AI服务
                </p>
              </div>
              

            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;