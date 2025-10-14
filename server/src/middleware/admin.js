// 管理员权限检查中间件
const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: '需要登录'
    });
  }

  if (req.user.role !== 'super_admin') {
    return res.status(403).json({
      success: false,
      message: '需要管理员权限'
    });
  }

  next();
};

// 检查是否为管理员或资源所有者
const isAdminOrOwner = (getResourceUserId) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: '需要登录'
        });
      }

      // 管理员可以访问所有资源
      if (req.user.role === 'super_admin') {
        return next();
      }

      // 获取资源的用户ID
      let resourceUserId;
      if (typeof getResourceUserId === 'function') {
        resourceUserId = await getResourceUserId(req);
      } else if (typeof getResourceUserId === 'string') {
        resourceUserId = req.params[getResourceUserId] || req.body[getResourceUserId];
      } else {
        resourceUserId = req.params.userId || req.body.user_id;
      }

      // 检查是否为资源所有者
      if (req.user.id !== resourceUserId) {
        return res.status(403).json({
          success: false,
          message: '无权访问此资源'
        });
      }

      next();
    } catch (error) {
      console.error('权限检查错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器内部错误'
      });
    }
  };
};

module.exports = {
  isAdmin,
  isAdminOrOwner
};