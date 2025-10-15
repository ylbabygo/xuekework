const https = require('https');

// Vercel部署的URL
const VERCEL_URL = 'https://xuekework-47ukcw0n2-yulis-projects-ad9ada99.vercel.app';

// 测试函数
async function testVercelAPI() {
  console.log('🧪 开始测试Vercel API函数...\n');
  
  // 测试用例
  const tests = [
    {
      name: '健康检查',
      path: '/health',
      method: 'GET'
    },
    {
      name: 'API版本检查',
      path: '/api/v1/test',
      method: 'GET'
    },
    {
      name: '登录端点测试',
      path: '/api/v1/auth/login',
      method: 'POST',
      data: JSON.stringify({
        username: 'admin',
        password: 'admin123'
      })
    }
  ];

  for (const test of tests) {
    console.log(`📋 测试: ${test.name}`);
    console.log(`🔗 URL: ${VERCEL_URL}${test.path}`);
    
    try {
      const result = await makeRequest(test.path, test.method, test.data);
      console.log(`✅ 状态码: ${result.statusCode}`);
      console.log(`📄 响应头:`, JSON.stringify(result.headers, null, 2));
      console.log(`📦 响应体:`, result.body);
    } catch (error) {
      console.log(`❌ 错误: ${error.message}`);
    }
    
    console.log('─'.repeat(60));
  }
}

// 发送HTTP请求的辅助函数
function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(VERCEL_URL + path);
    
    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Node.js Test Client'
      }
    };

    if (data && method === 'POST') {
      options.headers['Content-Length'] = Buffer.byteLength(data);
    }

    const req = https.request(options, (res) => {
      let body = '';
      
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedBody = JSON.parse(body);
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: parsedBody
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: body
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data && method === 'POST') {
      req.write(data);
    }
    
    req.end();
  });
}

// 运行测试
testVercelAPI().catch(console.error);