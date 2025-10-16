export default function handler(req, res) {
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // 处理预检请求
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // 健康检查响应
  res.status(200).json({
    status: 'ok',
    message: 'API is working',
    timestamp: new Date().toISOString()
  });
}