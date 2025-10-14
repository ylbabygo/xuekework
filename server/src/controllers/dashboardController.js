const { query } = require('../config/database');

class DashboardController {
  // 获取仪表盘统计数据
  static async getStats(req, res) {
    try {
      const userId = req.user?.id;
      
      // 获取今日和昨日的日期
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      // 获取AI消息总数（这里暂时返回模拟数据，因为没有ai_messages表）
      const totalMessages = 0;
      const todayMessagesCount = 0;
      const yesterdayMessagesCount = 0;
      
      // 获取AI工具收藏数量（模拟数据）
      const totalAiTools = 0;
      const todayAiToolsCount = 0;
      const yesterdayAiToolsCount = 0;
      
      // 获取AI对话总数（模拟数据）
      const totalConversations = 0;
      const todayConversationsCount = 0;
      const yesterdayConversationsCount = 0;
      
      // 获取系统日志总数
      const systemLogsResult = await query('SELECT COUNT(*) as count FROM system_logs');
      const totalSystemLogs = systemLogsResult[0]?.count || 0;
      
      // 获取今日新增系统日志数量
      const todaySystemLogsResult = await query(
        'SELECT COUNT(*) as count FROM system_logs WHERE DATE(created_at) = ?',
        [today]
      );
      const todaySystemLogsCount = todaySystemLogsResult[0]?.count || 0;
      
      // 获取昨日新增系统日志数量
      const yesterdaySystemLogsResult = await query(
        'SELECT COUNT(*) as count FROM system_logs WHERE DATE(created_at) = ?',
        [yesterday]
      );
      const yesterdaySystemLogsCount = yesterdaySystemLogsResult[0]?.count || 0;
      
      // 计算变化百分比
      const calculateChange = (today, yesterday) => {
        if (yesterday === 0) return today > 0 ? '+100%' : '0%';
        const change = ((today - yesterday) / yesterday * 100).toFixed(1);
        return change >= 0 ? `+${change}%` : `${change}%`;
      };
      
      const stats = [
        {
          name: 'AI消息',
          value: totalMessages.toString(),
          change: calculateChange(todayMessagesCount, yesterdayMessagesCount),
          changeType: todayMessagesCount >= yesterdayMessagesCount ? 'positive' : 'negative'
        },
        {
          name: 'AI工具收藏',
          value: totalAiTools.toString(),
          change: calculateChange(todayAiToolsCount, yesterdayAiToolsCount),
          changeType: todayAiToolsCount >= yesterdayAiToolsCount ? 'positive' : 'negative'
        },
        {
          name: 'AI对话',
          value: totalConversations.toString(),
          change: calculateChange(todayConversationsCount, yesterdayConversationsCount),
          changeType: todayConversationsCount >= yesterdayConversationsCount ? 'positive' : 'negative'
        },
        {
          name: '活动记录',
          value: totalSystemLogs.toString(),
          change: calculateChange(todaySystemLogsCount, yesterdaySystemLogsCount),
          changeType: todaySystemLogsCount >= yesterdaySystemLogsCount ? 'positive' : 'negative'
        }
      ];
      
      res.json({
        success: true,
        data: {
          stats
        }
      });
      
    } catch (error) {
      console.error('获取仪表盘统计数据失败:', error);
      res.status(500).json({
        success: false,
        message: '获取仪表盘统计数据失败',
        error: error.message
      });
    }
  }
  
  // 获取最近活动
  static async getRecentActivities(req, res) {
    try {
      const userId = req.user?.id;
      const limit = parseInt(req.query.limit) || 10;
      
      // 获取最近的系统日志
      const systemLogsData = await query(`
        SELECT id, action, details, created_at
        FROM system_logs 
        WHERE user_id = ?
        ORDER BY created_at DESC 
        LIMIT ?
      `, [userId, limit]);
      
      // 格式化活动数据
      const activities = (systemLogsData || []).map(log => {
        const now = new Date();
        const activityTime = new Date(log.created_at);
        const diffInHours = Math.floor((now - activityTime) / (1000 * 60 * 60));
        
        let timeText;
        if (diffInHours < 1) {
          timeText = '刚刚';
        } else if (diffInHours < 24) {
          timeText = `${diffInHours}小时前`;
        } else {
          const diffInDays = Math.floor(diffInHours / 24);
          timeText = diffInDays === 1 ? '昨天' : `${diffInDays}天前`;
        }
        
        let title, icon, color;
        switch (log.action) {
          case 'login':
            title = '用户登录';
            icon = 'ArrowRightOnRectangleIcon';
            color = 'bg-green-100 text-green-600';
            break;
          case 'logout':
            title = '用户登出';
            icon = 'ArrowLeftOnRectangleIcon';
            color = 'bg-red-100 text-red-600';
            break;
          case 'register':
            title = '用户注册';
            icon = 'UserPlusIcon';
            color = 'bg-blue-100 text-blue-600';
            break;
          default:
            title = `系统活动：${log.action}`;
            icon = 'ClipboardDocumentListIcon';
            color = 'bg-gray-100 text-gray-600';
        }
        
        return {
          title,
          time: timeText,
          icon,
          color
        };
      });
      
      res.json({ activities });
      
    } catch (error) {
      console.error('获取最近活动失败:', error);
      res.status(500).json({ error: '获取最近活动失败' });
    }
  }
}

module.exports = DashboardController;