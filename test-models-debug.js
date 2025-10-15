const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/v1';

async function testModelsAPI() {
  console.log('🔍 开始诊断AI模型API问题...\n');

  try {
    // 1. 首先测试登录获取token
    console.log('1. 测试登录获取token...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });

    if (!loginResponse.data.success) {
      console.error('❌ 登录失败:', loginResponse.data.message);
      return;
    }

    const token = loginResponse.data.data?.token || loginResponse.data.token;
    console.log('✅ 登录成功，token已获取');

    // 2. 测试不带认证的模型API
    console.log('\n2. 测试不带认证的模型API...');
    try {
      const noAuthResponse = await axios.get(`${BASE_URL}/ai/models`);
      console.log('✅ 不带认证的响应:', JSON.stringify(noAuthResponse.data, null, 2));
    } catch (error) {
      console.log('❌ 不带认证失败:', error.response?.data || error.message);
    }

    // 3. 测试带认证的模型API
    console.log('\n3. 测试带认证的模型API...');
    try {
      const authResponse = await axios.get(`${BASE_URL}/ai/models`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('✅ 带认证的响应:', JSON.stringify(authResponse.data, null, 2));
    } catch (error) {
      console.log('❌ 带认证失败:', error.response?.data || error.message);
    }

    // 4. 检查用户设置中的API密钥
    console.log('\n4. 检查用户设置中的API密钥...');
    try {
      const settingsResponse = await axios.get(`${BASE_URL}/auth/settings`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('✅ 用户设置:', JSON.stringify(settingsResponse.data, null, 2));
    } catch (error) {
      console.log('❌ 获取用户设置失败:', error.response?.data || error.message);
    }

    // 5. 测试API配置接口
    console.log('\n5. 测试API配置接口...');
    try {
      const configResponse = await axios.get(`${BASE_URL}/api-config/config`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('✅ API配置:', JSON.stringify(configResponse.data, null, 2));
    } catch (error) {
      console.log('❌ 获取API配置失败:', error.response?.data || error.message);
    }

    // 6. 测试用户信息
    console.log('\n6. 测试用户信息...');
    try {
      const userResponse = await axios.get(`${BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('✅ 用户信息:', JSON.stringify(userResponse.data, null, 2));
    } catch (error) {
      console.log('❌ 获取用户信息失败:', error.response?.data || error.message);
    }

  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error.message);
    if (error.response) {
      console.error('响应状态:', error.response.status);
      console.error('响应数据:', error.response.data);
    }
  }
}

// 运行测试
testModelsAPI().then(() => {
  console.log('\n🎯 诊断完成');
}).catch(error => {
  console.error('❌ 诊断失败:', error);
});