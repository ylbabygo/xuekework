const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/v1';

async function testAPI() {
  console.log('🚀 开始测试API接口...\n');
  
  let token = null;
  
  try {
    // 1. 测试健康检查
    console.log('1. 测试健康检查接口...');
    const healthResponse = await axios.get('http://localhost:5000/health');
    console.log('✅ 健康检查:', healthResponse.data.message);
    
    // 2. 测试基础API
    console.log('\n2. 测试基础API接口...');
    const testResponse = await axios.get(`${BASE_URL}/test`);
    console.log('✅ 基础API:', testResponse.data.message);
    
    // 3. 测试登录获取token
    console.log('\n3. 测试登录获取token...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });
    
    if (loginResponse.data.success) {
      token = loginResponse.data.data.token;
      console.log('✅ 登录成功，token已获取');
    }
    
    // 4. 测试用户相关API
    console.log('\n4. 测试用户相关API...');
    const headers = { 'Authorization': `Bearer ${token}` };
    
    // 获取当前用户信息
    const meResponse = await axios.get(`${BASE_URL}/auth/me`, { headers });
    console.log('✅ 获取用户信息:', meResponse.data.data?.username);
    
    // 获取用户设置
    const settingsResponse = await axios.get(`${BASE_URL}/auth/settings`, { headers });
    console.log('✅ 获取用户设置成功');
    
    // 5. 测试AI对话API
    console.log('\n5. 测试AI对话API...');
    
    try {
      // 获取对话列表
      const conversationsResponse = await axios.get(`${BASE_URL}/ai/conversations`, { headers });
      console.log('✅ 获取对话列表:', `共${conversationsResponse.data.data?.length || 0}个对话`);
    } catch (error) {
      console.log('⚠️ AI对话API:', error.response?.data?.message || error.message);
    }
    
    // 6. 测试AI工具API
    console.log('\n6. 测试AI工具API...');
    
    try {
      const aiToolsResponse = await axios.get(`${BASE_URL}/ai-tools`, { headers });
      console.log('✅ 获取AI工具列表:', `共${aiToolsResponse.data.data?.length || 0}个工具`);
    } catch (error) {
      console.log('⚠️ AI工具API:', error.response?.data?.message || error.message);
    }
    
    // 7. 测试用户管理API（管理员功能）
    console.log('\n7. 测试用户管理API...');
    
    try {
      const usersResponse = await axios.get(`${BASE_URL}/users`, { headers });
      console.log('✅ 获取用户列表:', `共${usersResponse.data.data?.length || 0}个用户`);
    } catch (error) {
      if (error.response?.status === 403) {
        console.log('⚠️ 用户管理API需要管理员权限');
      } else {
        console.log('❌ 用户管理API测试失败:', error.message);
      }
    }
    
    // 8. 测试设置相关API
    console.log('\n8. 测试设置相关API...');
    
    try {
      const apiConfigResponse = await axios.get(`${BASE_URL}/api-config/config`, { headers });
      console.log('✅ 获取API配置成功');
    } catch (error) {
      console.log('⚠️ API配置接口:', error.response?.data?.message || error.message);
    }
    
    // 9. 测试仪表板API
    console.log('\n9. 测试仪表板API...');
    
    try {
      const dashboardResponse = await axios.get(`${BASE_URL}/dashboard/stats`, { headers });
      console.log('✅ 获取仪表板统计成功');
    } catch (error) {
      console.log('⚠️ 仪表板API:', error.response?.data?.message || error.message);
    }
    
    console.log('\n🎯 API接口测试完成');
    
  } catch (error) {
    console.error('❌ API测试失败:', error.response?.data?.message || error.message);
  }
}

testAPI();