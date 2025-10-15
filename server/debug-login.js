const axios = require('axios');
const jwt = require('jsonwebtoken');

const BASE_URL = 'http://localhost:5000/api/v1';

async function debugLogin() {
  try {
    console.log('🔍 调试登录过程...\n');

    // 1. 执行登录
    console.log('1. 执行登录...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });

    if (loginResponse.data.success) {
      console.log('✅ 登录成功');
      const token = loginResponse.data.data.token;
      const user = loginResponse.data.data.user;
      
      console.log('用户信息:', {
        id: user.id,
        username: user.username,
        role: user.role
      });
      
      // 2. 解码token
      console.log('\n2. 解码token...');
      const decoded = jwt.decode(token);
      console.log('Token中的用户信息:', {
        id: decoded.id,
        username: decoded.username,
        role: decoded.role
      });
      
      // 3. 比较ID
      console.log('\n3. 比较ID...');
      console.log('用户对象中的ID:', user.id);
      console.log('Token中的ID:', decoded.id);
      console.log('ID是否匹配:', user.id === decoded.id);
      
      // 4. 使用token测试API
      console.log('\n4. 使用token测试API...');
      const apiResponse = await axios.get(`${BASE_URL}/api-config/config`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (apiResponse.data.success) {
        console.log('✅ API调用成功');
      } else {
        console.log('❌ API调用失败:', apiResponse.data.message);
      }
      
    } else {
      console.log('❌ 登录失败:', loginResponse.data.message);
    }

  } catch (error) {
    console.error('❌ 调试过程中出现错误:', error.response?.data?.message || error.message);
  }
}

debugLogin();