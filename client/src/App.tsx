import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

// 导入页面组件
import Login from './pages/Login';
import DashboardPage from './pages/Dashboard';
import AIAssistantPage from './pages/AIAssistant';
import ContentGeneratorPage from './pages/ContentGenerator';
import DataAnalysisPage from './pages/DataAnalysis';
import LearningResourcesPage from './pages/LearningResources';
import AssetLibraryPage from './pages/AssetLibrary';
import NotesPage from './pages/Notes';
import TodosPage from './pages/Todos';
import AIToolsPage from './pages/AITools';
import SettingsPage from './pages/Settings';
import AdminUsersPage from './pages/AdminUsers';

// 导入布局组件
import Layout from './components/Layout/MainLayout';

// 导入认证相关
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { APIConfigProvider } from './contexts/APIConfigContext';
import ProtectedRoute from './components/ProtectedRoute';
import { UserRole } from './types';

// 创建 React Query 客户端
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// 主应用路由组件
function AppRoutes() {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-tesla-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse-slow">
            <div className="w-16 h-16 bg-tesla-black rounded-full mx-auto mb-4"></div>
          </div>
          <p className="text-tesla-gray-600 text-sm uppercase tracking-wider">
            学科运营AI工作台
          </p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* 公开路由 */}
      <Route
        path="/login"
        element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" replace />}
      />

      
      {/* 受保护的路由 */}
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="ai-assistant" element={<AIAssistantPage />} />
        <Route path="content-generator" element={<ContentGeneratorPage />} />
        <Route path="data-analysis" element={<DataAnalysisPage />} />
        <Route path="learning-resources" element={<LearningResourcesPage />} />
        <Route path="asset-library" element={<AssetLibraryPage />} />
        <Route path="notes" element={<NotesPage />} />
        <Route path="todos" element={<TodosPage />} />
        <Route path="ai-tools" element={<AIToolsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        
        {/* 管理员专用路由 */}
        <Route 
          path="admin/users" 
          element={
            <ProtectedRoute requiredRole={UserRole.SUPER_ADMIN}>
              <AdminUsersPage />
            </ProtectedRoute>
          } 
        />
      </Route>
      
      {/* 404 重定向 */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AuthProvider>
          <ThemeProvider>
            <APIConfigProvider>
              <Router>
                <div className="App min-h-screen bg-tesla-white">
                  <AppRoutes />
                
                {/* 全局通知组件 */}
                <Toaster
                  position="top-right"
                  toastOptions={{
                    duration: 4000,
                    style: {
                      background: '#000000',
                      color: '#FFFFFF',
                      fontSize: '14px',
                      fontWeight: '500',
                    },
                    success: {
                      iconTheme: {
                        primary: '#FFFFFF',
                        secondary: '#000000',
                      },
                    },
                    error: {
                      iconTheme: {
                        primary: '#EF4444',
                        secondary: '#FFFFFF',
                      },
                    },
                  }}
                />
                </div>
              </Router>
             </APIConfigProvider>
           </ThemeProvider>
         </AuthProvider>
       </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
