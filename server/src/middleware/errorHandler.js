// 错误处理中间件
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // 默认错误状态码
  let statusCode = err.statusCode || 500;
  let message = err.message || '服务器内部错误';

  // 处理特定类型的错误
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = '数据验证失败';
  } else if (err.name === 'UnauthorizedError') {
    statusCode = 401;
    message = '未授权访问';
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = '无效的数据格式';
  }

  // 开发环境下返回详细错误信息
  const response = {
    success: false,
    message,
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  };

  res.status(statusCode).json(response);
};

module.exports = { errorHandler };