// 健康检查API端点
export default function handler(req, res) {
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Content-Type', 'application/json');

  // 处理预检请求
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // 记录请求信息用于调试
  console.log('健康检查请求:', {
    method: req.method,
    url: req.url,
    headers: req.headers
  });

  // 健康检查响应
  res.status(200).json({
    success: true,
    message: '健康检查通过 - 服务运行正常',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'production',
    url: req.url,
    method: req.method,
    status: 'healthy'
  });
}