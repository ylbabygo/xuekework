import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  // 如果正在加载，显示加载状态
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="tesla-loading mb-4"></div>
          <p className="text-white text-lg">正在验证身份...</p>
        </div>
      </div>
    );
  }

  // 如果未认证，重定向到登录页
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 如果需要特定角色权限
  if (requiredRole && user?.role !== requiredRole) {
    // 如果是普通用户尝试访问管理员页面，重定向到仪表板
    if (requiredRole === UserRole.SUPER_ADMIN && user?.role === UserRole.STANDARD_USER) {
      return <Navigate to="/dashboard" replace />;
    }
    
    // 其他权限不足情况，显示无权限页面
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">🚫</div>
          <h1 className="text-white text-2xl font-bold mb-2">访问被拒绝</h1>
          <p className="text-gray-400 mb-6">您没有权限访问此页面</p>
          <button
            onClick={() => window.history.back()}
            className="tesla-btn-primary"
          >
            返回上一页
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// 管理员专用路由
export function AdminRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requiredRole={UserRole.SUPER_ADMIN}>
      {children}
    </ProtectedRoute>
  );
}

export default ProtectedRoute;