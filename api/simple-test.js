// 简单的测试 API 函数

module.exports = async function handler(req, res) {
  try {
    console.log('简单测试函数被调用:', req.method, req.url);
    
    // 设置CORS头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // 处理预检请求
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }
    
    // 返回简单的测试响应
    res.status(200).json({
      success: true,
      message: '简单测试 API 成功',
      timestamp: new Date().toISOString(),
      url: req.url,
      method: req.method,
      headers: req.headers
    });
  } catch (error) {
    console.error('简单测试函数错误:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
};