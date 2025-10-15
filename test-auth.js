const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/v1';

async function testAuth() {
  console.log('🔐 开始测试用户认证功能...\n');
  
  try {
    // 测试登录
    console.log('1. 测试用户登录...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });
    
    if (loginResponse.status === 200) {
      console.log('✅ 登录成功');
      console.log('完整响应:', JSON.stringify(loginResponse.data, null, 2));
      console.log('Token:', loginResponse.data.data?.token || loginResponse.data.token ? '已获取' : '未获取');
      
      const token = loginResponse.data.data?.token || loginResponse.data.token;
      
      // 测试获取用户信息
      console.log('\n2. 测试获取用户信息...');
      const meResponse = await axios.get(`${BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (meResponse.status === 200) {
        console.log('✅ 获取用户信息成功');
        console.log('用户:', meResponse.data.data?.username || meResponse.data.user?.username);
      }
      
      // 测试获取用户设置
      console.log('\n3. 测试获取用户设置...');
      const settingsResponse = await axios.get(`${BASE_URL}/auth/settings`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (settingsResponse.status === 200) {
        console.log('✅ 获取用户设置成功');
      }
      
      // 测试登出
      console.log('\n4. 测试用户登出...');
      const logoutResponse = await axios.post(`${BASE_URL}/auth/logout`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (logoutResponse.status === 200) {
        console.log('✅ 登出成功');
      }
      
    }
    
  } catch (error) {
    console.error('❌ 认证测试失败:', error.response?.data || error.message);
  }
  
  console.log('\n🎯 用户认证功能测试完成');
}

testAuth();