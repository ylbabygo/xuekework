// 捕获所有 /api/* 请求并转发到 Express 应用
const app = require('../server/src/app');

module.exports = (req, res) => {
  return app(req, res);
};