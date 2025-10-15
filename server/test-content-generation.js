const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/v1';

async function testContentGeneration() {
  try {
    console.log('🧪 测试内容生成接口...\n');

    // 1. 登录获取token
    console.log('1. 登录获取token...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });

    if (!loginResponse.data.success) {
      throw new Error('登录失败');
    }

    const token = loginResponse.data.data.token;
    console.log('✅ 登录成功\n');

    // 设置请求头
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // 2. 测试内容生成接口
    console.log('2. 测试内容生成接口...');
    
    const contentRequest = {
      type: 'article',
      prompt: '请帮我写一篇关于人工智能发展的简短文章，大约200字',
      model: 'deepseek',
      options: {
        temperature: 0.7,
        maxTokens: 500
      }
    };

    console.log('发送内容生成请求:', JSON.stringify(contentRequest, null, 2));

    const contentResponse = await axios.post(`${BASE_URL}/content/generate`, contentRequest, { headers });

    console.log('内容生成响应:', JSON.stringify(contentResponse.data, null, 2));

    if (contentResponse.data.success) {
      console.log('✅ 内容生成成功');
      console.log('生成的内容:', contentResponse.data.data.content);
    } else {
      console.log('❌ 内容生成失败:', contentResponse.data.message);
    }

  } catch (error) {
    console.error('❌ 测试失败:', error.response?.data || error.message);
  }
}

testContentGeneration();