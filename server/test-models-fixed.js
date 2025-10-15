const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/v1';

async function testModelsAPI() {
  console.log('🔍 测试修复后的AI模型API...\n');

  try {
    // 1. 登录获取token
    console.log('1. 登录测试...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });

    if (loginResponse.data.success) {
      console.log('✅ 登录成功');
      const token = loginResponse.data.data.token;
      console.log(`Token: ${token.substring(0, 20)}...`);

      // 2. 测试带认证的模型API
      console.log('\n2. 测试带认证的AI模型列表...');
      const modelsResponse = await axios.get(`${BASE_URL}/ai/models`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('✅ AI模型API响应成功');
      console.log('模型数据:', JSON.stringify(modelsResponse.data, null, 2));

      // 3. 测试API配置接口
      console.log('\n3. 测试API配置接口...');
      const configResponse = await axios.get(`${BASE_URL}/api-config/config`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('✅ API配置接口响应成功');
      console.log('配置数据:', JSON.stringify(configResponse.data, null, 2));

      // 4. 测试用户设置
      console.log('\n4. 测试用户设置...');
      const settingsResponse = await axios.get(`${BASE_URL}/users/settings`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('✅ 用户设置响应成功');
      console.log('设置数据:', JSON.stringify(settingsResponse.data, null, 2));

    } else {
      console.log('❌ 登录失败:', loginResponse.data.message);
    }

  } catch (error) {
    console.error('❌ 测试过程中出现错误:');
    if (error.response) {
      console.error('状态码:', error.response.status);
      console.error('响应数据:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('错误信息:', error.message);
    }
  }
}

// 运行测试
testModelsAPI();