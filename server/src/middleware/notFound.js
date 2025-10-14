// 404 处理中间件
const notFound = (req, res, next) => {
  const error = new Error(`未找到路径 - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

module.exports = { notFound };