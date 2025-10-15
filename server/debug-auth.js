const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/v1';

async function debugAuth() {
  console.log('🔍 调试认证问题...\n');

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
      console.log(`Token: ${token.substring(0, 50)}...`);

      // 2. 测试用户信息接口
      console.log('\n2. 测试用户信息接口...');
      try {
        const userResponse = await axios.get(`${BASE_URL}/users/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        console.log('✅ 用户信息接口成功');
        console.log('用户数据:', JSON.stringify(userResponse.data, null, 2));
      } catch (error) {
        console.log('❌ 用户信息接口失败');
        if (error.response) {
          console.log('状态码:', error.response.status);
          console.log('响应:', JSON.stringify(error.response.data, null, 2));
        }
      }

      // 3. 测试AI模型接口
      console.log('\n3. 测试AI模型接口...');
      try {
        const modelsResponse = await axios.get(`${BASE_URL}/ai/models`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        console.log('✅ AI模型接口成功');
        console.log('模型数据:', JSON.stringify(modelsResponse.data, null, 2));
      } catch (error) {
        console.log('❌ AI模型接口失败');
        if (error.response) {
          console.log('状态码:', error.response.status);
          console.log('响应:', JSON.stringify(error.response.data, null, 2));
        }
      }

      // 4. 测试API配置状态接口
      console.log('\n4. 测试API配置状态接口...');
      try {
        const statusResponse = await axios.get(`${BASE_URL}/api-config/status`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        console.log('✅ API配置状态接口成功');
        console.log('状态数据:', JSON.stringify(statusResponse.data, null, 2));
      } catch (error) {
        console.log('❌ API配置状态接口失败');
        if (error.response) {
          console.log('状态码:', error.response.status);
          console.log('响应:', JSON.stringify(error.response.data, null, 2));
        }
      }

      // 5. 测试API配置接口
      console.log('\n5. 测试API配置接口...');
      try {
        const configResponse = await axios.get(`${BASE_URL}/api-config/config`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        console.log('✅ API配置接口成功');
        console.log('配置数据:', JSON.stringify(configResponse.data, null, 2));
      } catch (error) {
        console.log('❌ API配置接口失败');
        if (error.response) {
          console.log('状态码:', error.response.status);
          console.log('响应:', JSON.stringify(error.response.data, null, 2));
        }
      }

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
debugAuth();