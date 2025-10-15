const axios = require('axios');

// 测试配置
const BASE_URL = 'http://localhost:5000';
const TEST_CREDENTIALS = {
  username: 'admin',
  password: 'admin123'
};

async function testLoginFix() {
  console.log('🧪 开始测试登录修复...\n');

  try {
    // 1. 测试健康检查
    console.log('1. 测试健康检查端点...');
    try {
      const healthResponse = await axios.get(`${BASE_URL}/health`);
      console.log('✅ 健康检查成功:', healthResponse.data.message);
    } catch (error) {
      console.log('❌ 健康检查失败:', error.response?.data?.message || error.message);
    }

    // 2. 测试API版本端点
    console.log('\n2. 测试API版本端点...');
    try {
      const apiTestResponse = await axios.get(`${BASE_URL}/api/v1/test`);
      console.log('✅ API测试端点成功:', apiTestResponse.data.message);
    } catch (error) {
      console.log('❌ API测试端点失败:', error.response?.data?.message || error.message);
    }

    // 3. 测试登录端点
    console.log('\n3. 测试登录端点...');
    try {
      const loginResponse = await axios.post(`${BASE_URL}/api/v1/auth/login`, TEST_CREDENTIALS);
      console.log('✅ 登录成功!');
      console.log('   - 用户:', loginResponse.data.data.user.username);
      console.log('   - Token:', loginResponse.data.data.token ? '已生成' : '未生成');
      
      // 4. 测试token验证
      console.log('\n4. 测试token验证...');
      const token = loginResponse.data.data.token;
      try {
        const meResponse = await axios.get(`${BASE_URL}/api/v1/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ Token验证成功:', meResponse.data.data.username);
      } catch (error) {
        console.log('❌ Token验证失败:', error.response?.data?.message || error.message);
      }
      
    } catch (error) {
      console.log('❌ 登录失败:', error.response?.data?.message || error.message);
      if (error.response?.status === 401) {
        console.log('   可能的原因: 用户名或密码错误，或者用户不存在');
      }
    }

    // 5. 测试CORS预检请求
    console.log('\n5. 测试CORS配置...');
    try {
      const corsResponse = await axios.options(`${BASE_URL}/api/v1/auth/login`);
      console.log('✅ CORS预检请求成功');
    } catch (error) {
      console.log('❌ CORS预检请求失败:', error.message);
    }

  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error.message);
  }

  console.log('\n🏁 测试完成!');
}

// 运行测试
testLoginFix().catch(console.error);