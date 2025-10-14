const { User } = require('../models');
const SystemLog = require('../models/SystemLog');
const { generateToken, validatePassword } = require('../middleware/auth');

class AuthController {
  // 用户注册
  static async register(req, res) {
    try {
      const { username, email, password, confirmPassword } = req.body;

      // 验证必填字段
      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: '用户名和密码不能为空'
        });
      }

      // 验证密码确认
      if (password !== confirmPassword) {
        return res.status(400).json({
          success: false,
          message: '两次输入的密码不一致'
        });
      }

      // 验证用户名格式
      const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
      if (!usernameRegex.test(username)) {
        return res.status(400).json({
          success: false,
          message: '用户名只能包含字母、数字和下划线，长度3-20位'
        });
      }

      // 验证邮箱格式（如果提供）
      if (email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          return res.status(400).json({
            success: false,
            message: '邮箱格式不正确'
          });
        }
      }

      // 验证密码强度
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        return res.status(400).json({
          success: false,
          message: '密码强度不足',
          errors: passwordValidation.errors
        });
      }

      // 创建用户
      const user = await User.create({
        username,
        email,
        password,
        role: 'standard_user'
      });

      // 生成JWT令牌
      const token = generateToken(user);

      // 记录系统日志
      const systemLog = new SystemLog();
      await systemLog.logRegister(user.id, req.ip, req.get('User-Agent'));

      res.status(201).json({
        success: true,
        message: '注册成功',
        data: {
          token,
          user: user.toJSON()
        }
      });
    } catch (error) {
      console.error('注册错误:', error);
      
      // 处理特定错误
      if (error.message.includes('用户名已存在')) {
        return res.status(409).json({
          success: false,
          message: '用户名已存在'
        });
      }
      
      if (error.message.includes('邮箱已存在')) {
        return res.status(409).json({
          success: false,
          message: '邮箱已存在'
        });
      }

      res.status(500).json({
        success: false,
        message: '注册失败，请稍后重试'
      });
    }
  }

  // 用户登录
  static async login(req, res) {
    try {
      const { username, password, rememberMe = false } = req.body;

      // 验证必填字段
      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: '用户名和密码不能为空'
        });
      }

      // 查找用户
      const user = await User.findByUsername(username);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: '用户名或密码错误'
        });
      }

      // 验证密码
      const isValidPassword = await user.validatePassword(password);
      if (!isValidPassword) {
        // 记录登录失败日志
        const systemLog = new SystemLog();
        await systemLog.create({
          user_id: user.id,
          action: 'login_failed',
          details: { description: '登录失败 - 密码错误', reason: 'invalid_password' },
          ip_address: req.ip,
          user_agent: req.get('User-Agent')
        });

        return res.status(401).json({
          success: false,
          message: '用户名或密码错误'
        });
      }

      // 检查账户状态
      if (!user.is_active) {
        return res.status(401).json({
          success: false,
          message: '账户已被禁用，请联系管理员'
        });
      }

      // 更新最后登录时间
      await user.updateLastLogin();

      // 生成JWT令牌
      const token = generateToken(user);

      // 记录登录成功日志
      const systemLog = new SystemLog();
      await systemLog.logLogin(user.id, req.ip, req.get('User-Agent'));

      res.json({
        success: true,
        message: '登录成功',
        data: {
          token,
          user: user.toJSON()
        }
      });
    } catch (error) {
      console.error('登录错误:', error);
      res.status(500).json({
        success: false,
        message: '登录失败，请稍后重试'
      });
    }
  }

  // 获取当前用户信息
  static async getCurrentUser(req, res) {
    try {
      const user = req.user;
      
      // 简化用户信息，避免复杂的统计查询
      const userData = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar_url: user.avatar_url,
        created_at: user.created_at
      };
      
      res.json({
        success: true,
        data: userData
      });
    } catch (error) {
      console.error('获取用户信息错误:', error);
      res.status(500).json({
        success: false,
        message: '获取用户信息失败'
      });
    }
  }

  // 更新用户信息
  static async updateProfile(req, res) {
    try {
      const { email, avatar_url } = req.body;
      const user = req.user;

      const updateData = {};
      
      if (email !== undefined) {
        // 验证邮箱格式
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          return res.status(400).json({
            success: false,
            message: '邮箱格式不正确'
          });
        }
        updateData.email = email;
      }

      if (avatar_url !== undefined) {
        updateData.avatar_url = avatar_url;
      }

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
          success: false,
          message: '没有提供要更新的字段'
        });
      }

      await user.update(updateData);

      // 记录系统日志
      const systemLog = new SystemLog();
      await systemLog.create({
        user_id: user.id,
        action: 'profile_update',
        details: { description: '更新个人信息', ...updateData },
        ip_address: req.ip,
        user_agent: req.get('User-Agent')
      });

      res.json({
        success: true,
        message: '个人信息更新成功',
        data: {
          user: user.toJSON()
        }
      });
    } catch (error) {
      console.error('更新个人信息错误:', error);
      
      if (error.message.includes('邮箱已存在')) {
        return res.status(409).json({
          success: false,
          message: '邮箱已存在'
        });
      }

      res.status(500).json({
        success: false,
        message: '更新个人信息失败'
      });
    }
  }

  // 修改密码
  static async changePassword(req, res) {
    try {
      const { oldPassword, newPassword, confirmPassword } = req.body;
      const user = req.user;

      // 验证必填字段
      if (!oldPassword || !newPassword || !confirmPassword) {
        return res.status(400).json({
          success: false,
          message: '所有密码字段都不能为空'
        });
      }

      // 验证新密码确认
      if (newPassword !== confirmPassword) {
        return res.status(400).json({
          success: false,
          message: '两次输入的新密码不一致'
        });
      }

      // 验证新密码强度
      const passwordValidation = validatePassword(newPassword);
      if (!passwordValidation.isValid) {
        return res.status(400).json({
          success: false,
          message: '新密码强度不足',
          errors: passwordValidation.errors
        });
      }

      // 修改密码
      await user.changePassword(oldPassword, newPassword);

      // 记录系统日志
      const systemLog = new SystemLog();
      await systemLog.create({
        user_id: user.id,
        action: 'password_change',
        details: { description: '密码修改成功', success: true },
        ip_address: req.ip,
        user_agent: req.get('User-Agent')
      });

      res.json({
        success: true,
        message: '密码修改成功'
      });
    } catch (error) {
      console.error('修改密码错误:', error);
      
      if (error.message.includes('原密码错误')) {
        // 记录密码修改失败日志
        const systemLogFail = new SystemLog();
        await systemLogFail.create({
          user_id: req.user.id,
          action: 'password_change_failed',
          description: '密码修改失败 - 原密码错误',
          metadata: { reason: 'invalid_old_password' },
          ip_address: req.ip,
          user_agent: req.get('User-Agent')
        });

        return res.status(400).json({
          success: false,
          message: '原密码错误'
        });
      }

      res.status(500).json({
        success: false,
        message: '修改密码失败'
      });
    }
  }

  // 获取用户设置
  static async getSettings(req, res) {
    try {
      const user = req.user;
      const settings = await user.getSettings();

      res.json({
        success: true,
        data: settings
      });
    } catch (error) {
      console.error('获取用户设置错误:', error);
      res.status(500).json({
        success: false,
        message: '获取用户设置失败'
      });
    }
  }

  // 更新用户设置
  static async updateSettings(req, res) {
    try {
      const { theme, language, api_keys, notification_settings } = req.body;
      const user = req.user;

      const settings = await user.updateSettings({
        theme,
        language,
        api_keys,
        notification_settings
      });

      // 记录系统日志
      const systemLog = new SystemLog();
      await systemLog.create({
        user_id: user.id,
        action: 'settings_update',
        details: { description: '更新用户设置', theme, language },
        ip_address: req.ip,
        user_agent: req.get('User-Agent')
      });

      res.json({
        success: true,
        message: '设置更新成功',
        data: settings
      });
    } catch (error) {
      console.error('更新用户设置错误:', error);
      res.status(500).json({
        success: false,
        message: '更新设置失败'
      });
    }
  }

  // 用户登出
  static async logout(req, res) {
    try {
      const user = req.user;

      // 记录登出日志
      const systemLog = new SystemLog();
      await systemLog.logLogout(user.id, req.ip, req.get('User-Agent'));

      res.json({
        success: true,
        message: '登出成功'
      });
    } catch (error) {
      console.error('登出错误:', error);
      res.status(500).json({
        success: false,
        message: '登出失败'
      });
    }
  }

  // 删除账户
  static async deleteAccount(req, res) {
    try {
      const { password } = req.body;
      const user = req.user;

      // 验证密码
      if (!password) {
        return res.status(400).json({
          success: false,
          message: '请输入密码确认删除'
        });
      }

      const isValidPassword = await user.validatePassword(password);
      if (!isValidPassword) {
        return res.status(400).json({
          success: false,
          message: '密码错误'
        });
      }

      // 软删除用户
      await user.softDelete();

      // 记录系统日志
      const systemLog = new SystemLog();
      await systemLog.create({
        user_id: user.id,
        action: 'account_delete',
        details: { description: '删除账户', soft_delete: true },
        ip_address: req.ip,
        user_agent: req.get('User-Agent')
      });

      res.json({
        success: true,
        message: '账户已删除'
      });
    } catch (error) {
      console.error('删除账户错误:', error);
      res.status(500).json({
        success: false,
        message: '删除账户失败'
      });
    }
  }

  // 验证令牌有效性
  static async verifyToken(req, res) {
    try {
      const user = req.user;
      
      res.json({
        success: true,
        data: {
          valid: true,
          user: user.toJSON()
        }
      });
    } catch (error) {
      console.error('验证令牌错误:', error);
      res.status(500).json({
        success: false,
        message: '验证令牌失败'
      });
    }
  }
}

module.exports = AuthController;