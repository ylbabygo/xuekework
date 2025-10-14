import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'light' | 'dark';
  showText?: boolean;
  className?: string;
}

export function Logo({ 
  size = 'md', 
  variant = 'light', 
  showText = true, 
  className = '' 
}: LogoProps) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12'
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  const iconColor = variant === 'light' ? '#1E40AF' : '#FFFFFF';
  const textColor = variant === 'light' ? 'text-gray-900' : 'text-white';

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Logo图标 - 使用SVG创建一个现代化的AI图标 */}
      <div className={`${sizeClasses[size]} relative`}>
        <svg
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* 外圆环 */}
          <circle
            cx="20"
            cy="20"
            r="18"
            stroke={iconColor}
            strokeWidth="2"
            fill="none"
            className="animate-pulse"
          />
          
          {/* 内部AI符号 */}
          <path
            d="M12 15L16 25H18L22 15H20L17 22L14 15H12Z"
            fill={iconColor}
          />
          <path
            d="M24 15V25H26V15H24Z"
            fill={iconColor}
          />
          <circle
            cx="25"
            cy="18"
            r="1"
            fill={iconColor}
          />
          
          {/* 装饰性点 */}
          <circle cx="8" cy="12" r="1" fill="#FDE047" className="animate-ping" />
          <circle cx="32" cy="28" r="1" fill="#FDE047" className="animate-ping" style={{animationDelay: '0.5s'}} />
          <circle cx="30" cy="10" r="1" fill="#3B82F6" className="animate-pulse" style={{animationDelay: '1s'}} />
        </svg>
      </div>

      {/* Logo文字 */}
      {showText && (
        <div className="flex flex-col">
          <span className={`font-bold ${textSizeClasses[size]} ${textColor} tracking-tight`}>
            学科AI
          </span>
          <span className={`text-xs ${variant === 'light' ? 'text-gray-500' : 'text-gray-300'} font-medium`}>
            智能工作台
          </span>
        </div>
      )}
    </div>
  );
}

export default Logo;