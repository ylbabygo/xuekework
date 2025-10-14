import api from './api';

export interface DashboardStats {
  name: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative';
}

export interface RecentActivity {
  title: string;
  time: string;
  icon: string;
  color: string;
}

export interface DashboardData {
  stats: DashboardStats[];
  activities: RecentActivity[];
}

// 使用简单认证模式（返回模拟数据）
const useSimpleAuth = true;

// 模拟数据
const mockStats: DashboardStats[] = [
  {
    name: '今日访问量',
    value: '2,345',
    change: '+12.5%',
    changeType: 'positive'
  },
  {
    name: '活跃用户',
    value: '1,234',
    change: '+8.2%',
    changeType: 'positive'
  },
  {
    name: '内容生成',
    value: '567',
    change: '+15.3%',
    changeType: 'positive'
  },
  {
    name: '任务完成率',
    value: '89.2%',
    change: '-2.1%',
    changeType: 'negative'
  }
];

const mockActivities: RecentActivity[] = [
  {
    title: '生成了营销文案',
    time: '2分钟前',
    icon: '📝',
    color: 'text-blue-600'
  },
  {
    title: '完成了数据分析',
    time: '15分钟前',
    icon: '📊',
    color: 'text-green-600'
  },
  {
    title: '上传了新物料',
    time: '1小时前',
    icon: '📁',
    color: 'text-purple-600'
  },
  {
    title: '创建了待办事项',
    time: '2小时前',
    icon: '✅',
    color: 'text-orange-600'
  }
];

class DashboardService {
  // 获取仪表盘统计数据
  async getStats(): Promise<DashboardStats[]> {
    if (useSimpleAuth) {
      // 返回模拟数据
      return new Promise(resolve => {
        setTimeout(() => resolve(mockStats), 500);
      });
    }
    
    try {
      const response = await api.get('/dashboard/stats');
      return response.data.data.stats;
    } catch (error) {
      console.error('获取仪表盘统计数据失败:', error);
      throw error;
    }
  }

  // 获取最近活动
  async getRecentActivities(): Promise<RecentActivity[]> {
    if (useSimpleAuth) {
      // 返回模拟数据
      return new Promise(resolve => {
        setTimeout(() => resolve(mockActivities), 300);
      });
    }
    
    try {
      const response = await api.get('/dashboard/activities');
      return response.data.activities;
    } catch (error) {
      console.error('获取最近活动失败:', error);
      throw error;
    }
  }

  // 获取完整的仪表盘数据
  async getDashboardData(): Promise<DashboardData> {
    try {
      const [stats, activities] = await Promise.all([
        this.getStats(),
        this.getRecentActivities()
      ]);
      
      return {
        stats,
        activities
      };
    } catch (error) {
      console.error('获取仪表盘数据失败:', error);
      throw error;
    }
  }
}

export default new DashboardService();