import { User, UserRole } from '../types';

// 简单认证服务 - 用于生产环境
class SimpleAuthService {
  private readonly ADMIN_USERNAME = 'admin';
  private readonly ADMIN_PASSWORD = 'admin123';
  private readonly DEMO_USERNAME = 'demo';
  private readonly DEMO_PASSWORD = 'demo123';

  async login(username: string, password: string) {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 500));

    let user: User | null = null;

    if (username === this.ADMIN_USERNAME && password === this.ADMIN_PASSWORD) {
      user = {
        id: '1',
        username: 'admin',
        email: 'admin@xueke.ai',
        role: UserRole.SUPER_ADMIN,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      };
    } else if (username === this.DEMO_USERNAME && password === this.DEMO_PASSWORD) {
      user = {
        id: '2',
        username: 'demo',
        email: 'demo@xueke.ai',
        role: UserRole.STANDARD_USER,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      };
    }

    if (user) {
      // 生成简单的token
      const token = btoa(JSON.stringify({ userId: user.id, timestamp: Date.now() }));
      
      // 存储到localStorage
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user', JSON.stringify(user));

      return {
        success: true,
        data: {
          user,
          token,
          message: '登录成功'
        }
      };
    } else {
      throw new Error('用户名或密码错误');
    }
  }

  async getCurrentUser() {
    const token = localStorage.getItem('auth_token');
    const userStr = localStorage.getItem('user');

    if (!token || !userStr) {
      throw new Error('未登录');
    }

    try {
      const user = JSON.parse(userStr) as User;
      return {
        success: true,
        data: user
      };
    } catch (error) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      throw new Error('登录状态已过期');
    }
  }

  async changePassword(currentPassword: string, newPassword: string) {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      throw new Error('未登录');
    }

    const user = JSON.parse(userStr) as User;
    
    // 验证当前密码
    let isCurrentPasswordValid = false;
    if (user.username === this.ADMIN_USERNAME && currentPassword === this.ADMIN_PASSWORD) {
      isCurrentPasswordValid = true;
    } else if (user.username === this.DEMO_USERNAME && currentPassword === this.DEMO_PASSWORD) {
      isCurrentPasswordValid = true;
    }

    if (!isCurrentPasswordValid) {
      throw new Error('当前密码错误');
    }

    // 在简单认证中，我们只是返回成功消息
    // 实际的密码更改需要在真实的后端实现
    return {
      success: true,
      message: '密码修改成功（注意：这是演示模式，密码未真正更改）'
    };
  }

  logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    return Promise.resolve({ success: true, message: '退出成功' });
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('auth_token');
    const userStr = localStorage.getItem('user');
    return !!(token && userStr);
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }
}

export const simpleAuthService = new SimpleAuthService();

// 确保这是一个模块
export {};