const https = require('https');

// 测试CORS修复
async function testCORSFix() {
  console.log('🧪 测试CORS修复...\n');
  
  const testUrl = 'https://xueke-ai.vercel.app';
  
  // 测试1: 预检请求 (OPTIONS)
  console.log('1️⃣ 测试预检请求 (OPTIONS)...');
  try {
    const optionsResult = await makeRequest('OPTIONS', `${testUrl}/api/v1/auth/login`, {
      'Origin': 'https://xueke-ai-frontend.vercel.app',
      'Access-Control-Request-Method': 'POST',
      'Access-Control-Request-Headers': 'Content-Type, Authorization'
    });
    
    console.log('✅ 预检请求成功');
    console.log('📋 响应头:', optionsResult.headers);
  } catch (error) {
    console.log('❌ 预检请求失败:', error.message);
  }
  
  console.log('\n');
  
  // 测试2: 实际登录请求
  console.log('2️⃣ 测试登录请求...');
  try {
    const loginData = JSON.stringify({
      username: 'admin',
      password: 'admin123'
    });
    
    const loginResult = await makeRequest('POST', `${testUrl}/api/v1/auth/login`, {
      'Content-Type': 'application/json',
      'Origin': 'https://xueke-ai-frontend.vercel.app',
      'Content-Length': Buffer.byteLength(loginData)
    }, loginData);
    
    console.log('✅ 登录请求成功');
    console.log('📋 响应头:', loginResult.headers);
    console.log('📄 响应内容:', loginResult.data);
  } catch (error) {
    console.log('❌ 登录请求失败:', error.message);
  }
}

function makeRequest(method, url, headers = {}, data = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: headers,
      timeout: 10000
    };
    
    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = responseData ? JSON.parse(responseData) : null;
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: parsedData
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: responseData
          });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('请求超时'));
    });
    
    if (data) {
      req.write(data);
    }
    
    req.end();
  });
}

// 运行测试
testCORSFix().catch(console.error);