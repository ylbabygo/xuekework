const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api/v1';

async function testSupabaseAuth() {
  console.log('=== 测试Supabase认证功能 ===\n');

  try {
    // 1. 测试用户注册
    console.log('1. 测试用户注册...');
    const timestamp = Date.now().toString().slice(-6); // 取最后6位数字
    const registerData = {
      username: `testuser${timestamp}`,
      email: `test${timestamp}@example.com`,
      password: 'TestPassword123!',
      confirmPassword: 'TestPassword123!'
    };

    try {
      const registerResponse = await axios.post(`${BASE_URL}/auth/register`, registerData);
      console.log('✅ 注册成功:', registerResponse.data.message);
      console.log('用户信息:', registerResponse.data.data.user);
      
      const token = registerResponse.data.data.token;
      console.log('Token获取:', token ? '成功' : '失败');

      // 2. 测试令牌验证
      console.log('\n2. 测试令牌验证...');
      const verifyResponse = await axios.get(`${BASE_URL}/auth/verify`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ 令牌验证成功:', verifyResponse.data.data.valid);

      // 3. 测试获取当前用户信息
      console.log('\n3. 测试获取当前用户信息...');
      const currentUserResponse = await axios.get(`${BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ 获取用户信息成功:', currentUserResponse.data.data.username);

      // 4. 测试获取用户设置
      console.log('\n4. 测试获取用户设置...');
      const settingsResponse = await axios.get(`${BASE_URL}/auth/settings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ 获取用户设置成功:', settingsResponse.data.data);

      // 5. 测试更新用户设置
      console.log('\n5. 测试更新用户设置...');
      const updateSettingsResponse = await axios.put(`${BASE_URL}/auth/settings`, {
        theme: 'dark',
        language: 'en-US'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ 更新用户设置成功:', updateSettingsResponse.data.message);

      // 6. 测试登出
      console.log('\n6. 测试用户登出...');
      const logoutResponse = await axios.post(`${BASE_URL}/auth/logout`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ 登出成功:', logoutResponse.data.message);

    } catch (error) {
      if (error.response?.data?.message?.includes('用户名已存在')) {
        console.log('⚠️ 用户名已存在，尝试登录测试...');
        await testLogin();
      } else {
        throw error;
      }
    }

  } catch (error) {
    console.error('❌ 测试失败:', error.response?.data || error.message);
  }
}

async function testLogin() {
  try {
    console.log('\n=== 测试登录功能 ===');
    
    // 使用已知的测试用户登录
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      username: 'test_user',
      password: 'test123'
    });
    
    console.log('✅ 登录成功:', loginResponse.data.message);
    const token = loginResponse.data.data.token;
    
    // 测试令牌验证
    const verifyResponse = await axios.get(`${BASE_URL}/auth/verify`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ 令牌验证成功:', verifyResponse.data.data.valid);
    
  } catch (error) {
    console.error('❌ 登录测试失败:', error.response?.data || error.message);
  }
}

// 运行测试
testSupabaseAuth().then(() => {
  console.log('\n=== 测试完成 ===');
}).catch(error => {
  console.error('测试过程中发生错误:', error);
});