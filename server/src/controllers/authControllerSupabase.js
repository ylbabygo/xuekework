const databaseAdapter = require('../adapters/databaseAdapter');
const { generateToken, validatePassword } = require('../middleware/auth');

class AuthControllerSupabase {
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

      // 检查用户名是否已存在
      try {
        const existingUser = await databaseAdapter.getUserByUsername(username);
        if (existingUser) {
          return res.status(409).json({
            success: false,
            message: '用户名已存在'
          });
        }
      } catch (error) {
        // 如果是"未找到"错误，继续执行
        if (!error.message.includes('not found') && !error.message.includes('No rows')) {
          throw error;
        }
      }

      // 哈希密码
      const passwordHash = await databaseAdapter.hashPassword(password);

      // 创建用户
      const user = await databaseAdapter.createUser({
        username,
        email: email || `${username}@example.com`,
        password_hash: passwordHash,
        role: 'standard_user'
      });

      // 生成JWT令牌
      const token = generateToken({
        id: user.id,
        username: user.username,
        email: user.email,
        role: 'standard_user'
      });

      // 记录系统日志
      await databaseAdapter.createSystemLog({
        user_id: user.id,
        action: 'register',
        resource_type: 'user',
        resource_id: user.id,
        details: {
          message: '用户注册成功',
          username: user.username
        },
        ip_address: req.ip,
        user_agent: req.get('User-Agent')
      });

      res.status(201).json({
        success: true,
        message: '注册成功',
        data: {
          token,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            created_at: user.created_at
          }
        }
      });
    } catch (error) {
      console.error('注册错误:', error);
      
      // 处理特定错误
      if (error.message.includes('duplicate key') || error.message.includes('UNIQUE constraint')) {
        if (error.message.includes('username')) {
          return res.status(409).json({
            success: false,
            message: '用户名已存在'
          });
        }
        if (error.message.includes('email')) {
          return res.status(409).json({
            success: false,
            message: '邮箱已存在'
          });
        }
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
      let user;
      try {
        user = await databaseAdapter.getUserByUsername(username);
      } catch (error) {
        return res.status(401).json({
          success: false,
          message: '用户名或密码错误'
        });
      }

      if (!user) {
        return res.status(401).json({
          success: false,
          message: '用户名或密码错误'
        });
      }

      // 验证密码
      const isValidPassword = await databaseAdapter.validateUserPassword(user, password);
      if (!isValidPassword) {
        // 记录登录失败日志
        await databaseAdapter.createSystemLog({
          level: 'warning',
          message: '登录失败 - 密码错误',
          metadata: {
            action: 'login_failed',
            username: user.username,
            reason: 'invalid_password',
            ip_address: req.ip,
            user_agent: req.get('User-Agent')
          },
          user_id: user.id
        });

        return res.status(401).json({
          success: false,
          message: '用户名或密码错误'
        });
      }

      // 检查账户状态
      if (user.status !== 'active') {
        return res.status(401).json({
          success: false,
          message: '账户已被禁用，请联系管理员'
        });
      }

      // 生成JWT令牌
      const tokenPayload = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role || 'standard_user'
      };

      const token = generateToken(tokenPayload, rememberMe ? '30d' : '24h');

      // 记录登录成功日志
      await databaseAdapter.createSystemLog({
        level: 'info',
        message: '用户登录成功',
        metadata: {
          action: 'login_success',
          username: user.username,
          remember_me: rememberMe,
          ip_address: req.ip,
          user_agent: req.get('User-Agent')
        },
        user_id: user.id
      });

      res.json({
        success: true,
        message: '登录成功',
        data: {
          token,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            avatar_url: user.avatar_url,
            bio: user.bio,
            status: user.status,
            role: user.role || 'standard_user',
            created_at: user.created_at
          }
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
      const userId = req.user.id;
      const user = await databaseAdapter.getUserById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: '用户不存在'
        });
      }

      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            avatar_url: user.avatar_url,
            bio: user.bio,
            status: user.status,
            role: user.role || 'standard_user',
            created_at: user.created_at,
            updated_at: user.updated_at
          }
        }
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
      const userId = req.user.id;
      const { email, bio, avatar_url } = req.body;

      const updateData = {};
      if (email !== undefined) updateData.email = email;
      if (bio !== undefined) updateData.bio = bio;
      if (avatar_url !== undefined) updateData.avatar_url = avatar_url;
      updateData.updated_at = new Date().toISOString();

      const updatedUser = await databaseAdapter.updateUser(userId, updateData);

      // 记录更新日志
      await databaseAdapter.createSystemLog({
        level: 'info',
        message: '用户信息更新',
        metadata: {
          action: 'profile_update',
          updated_fields: Object.keys(updateData),
          ip_address: req.ip,
          user_agent: req.get('User-Agent')
        },
        user_id: userId
      });

      res.json({
        success: true,
        message: '用户信息更新成功',
        data: {
          user: updatedUser
        }
      });
    } catch (error) {
      console.error('更新用户信息错误:', error);
      res.status(500).json({
        success: false,
        message: '更新用户信息失败'
      });
    }
  }

  // 修改密码
  static async changePassword(req, res) {
    try {
      const userId = req.user.id;
      const { currentPassword, newPassword, confirmPassword } = req.body;

      // 验证必填字段
      if (!currentPassword || !newPassword || !confirmPassword) {
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

      // 获取用户信息
      const user = await databaseAdapter.getUserById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: '用户不存在'
        });
      }

      // 验证当前密码
      const isValidCurrentPassword = await databaseAdapter.validateUserPassword(user, currentPassword);
      if (!isValidCurrentPassword) {
        return res.status(401).json({
          success: false,
          message: '当前密码错误'
        });
      }

      // 哈希新密码
      const newPasswordHash = await databaseAdapter.hashPassword(newPassword);

      // 更新密码
      await databaseAdapter.updateUser(userId, {
        password_hash: newPasswordHash,
        updated_at: new Date().toISOString()
      });

      // 记录密码修改日志
      await databaseAdapter.createSystemLog({
        level: 'info',
        message: '用户密码修改',
        metadata: {
          action: 'password_change',
          ip_address: req.ip,
          user_agent: req.get('User-Agent')
        },
        user_id: userId
      });

      res.json({
        success: true,
        message: '密码修改成功'
      });
    } catch (error) {
      console.error('修改密码错误:', error);
      res.status(500).json({
        success: false,
        message: '修改密码失败'
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
        role: user.role || 'standard_user',
        avatar_url: user.avatar_url,
        bio: user.bio,
        status: user.status,
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

  // 验证令牌有效性
  static async verifyToken(req, res) {
    try {
      const user = req.user;
      
      res.json({
        success: true,
        data: {
          valid: true,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role || 'standard_user',
            avatar_url: user.avatar_url,
            bio: user.bio,
            status: user.status,
            created_at: user.created_at
          }
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

  // 获取用户设置
  static async getSettings(req, res) {
    try {
      const userId = req.user.id;
      const settings = await databaseAdapter.getUserSettings(userId);

      res.json({
        success: true,
        data: settings || {
          theme: 'light',
          language: 'zh-CN',
          api_keys: {},
          notification_settings: {}
        }
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
      const userId = req.user.id;

      const updateData = {};
      if (theme !== undefined) updateData.theme = theme;
      if (language !== undefined) updateData.language = language;
      if (api_keys !== undefined) updateData.api_keys = api_keys;
      if (notification_settings !== undefined) updateData.notification_settings = notification_settings;
      updateData.updated_at = new Date().toISOString();

      const settings = await databaseAdapter.updateUserSettings(userId, updateData);

      // 记录系统日志
      await databaseAdapter.createSystemLog({
        action: 'settings_update',
        details: {
          message: '用户设置更新',
          updated_fields: Object.keys(updateData),
          ip_address: req.ip,
          user_agent: req.get('User-Agent')
        },
        user_id: userId
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
      const userId = req.user?.id;

      if (userId) {
        // 记录登出日志
        await databaseAdapter.createSystemLog({
          action: 'logout',
          details: {
            message: '用户登出',
            ip_address: req.ip,
            user_agent: req.get('User-Agent')
          },
          user_id: userId
        });
      }

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
      const userId = req.user.id;

      // 验证密码
      if (!password) {
        return res.status(400).json({
          success: false,
          message: '请输入密码确认删除'
        });
      }

      // 获取用户信息
      const user = await databaseAdapter.getUserById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: '用户不存在'
        });
      }

      // 验证密码
      const isValidPassword = await databaseAdapter.validateUserPassword(user, password);
      if (!isValidPassword) {
        return res.status(400).json({
          success: false,
          message: '密码错误'
        });
      }

      // 软删除用户（更新状态为inactive）
      await databaseAdapter.updateUser(userId, {
        status: 'inactive',
        updated_at: new Date().toISOString()
      });

      // 记录系统日志
      await databaseAdapter.createSystemLog({
        level: 'info',
        message: '用户账户删除',
        metadata: {
          action: 'account_delete',
          soft_delete: true,
          ip_address: req.ip,
          user_agent: req.get('User-Agent')
        },
        user_id: userId
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
}

module.exports = AuthControllerSupabase;