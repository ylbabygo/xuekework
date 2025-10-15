const axios = require('axios');

async function testAIChat() {
  const BASE_URL = 'http://localhost:5000/api/v1';
  
  try {
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
    const user = loginResponse.data.data.user;
    const headers = { 'Authorization': `Bearer ${token}` };
    console.log('✅ 登录成功');
    console.log('用户信息:', JSON.stringify(user, null, 2));
    
    // 2. 获取AI模型列表
    console.log('\n2. 获取AI模型列表...');
    const modelsResponse = await axios.get(`${BASE_URL}/ai/models`, { headers });
    console.log('✅ 模型列表:', Object.keys(modelsResponse.data.data || {}));
    
    // 3. 获取现有对话列表
    console.log('\n3. 获取对话列表...');
    const conversationsResponse = await axios.get(`${BASE_URL}/ai/conversations`, { headers });
    console.log('✅ 对话数量:', conversationsResponse.data.data?.length || 0);
    
    // 4. 创建新对话
    console.log('\n4. 创建新对话...');
    const createResponse = await axios.post(`${BASE_URL}/ai/conversations`, {
      title: '测试对话',
      model: 'gpt-3.5-turbo'
    }, { headers });
    
    console.log('创建对话响应:', JSON.stringify(createResponse.data, null, 2));
    
    if (!createResponse.data.success) {
      throw new Error('创建对话失败: ' + createResponse.data.message);
    }
    
    const conversationId = createResponse.data.data.id;
    console.log('✅ 对话创建成功, ID:', conversationId);
    
    // 5. 发送消息
    console.log('\n5. 发送测试消息...');
    const messageResponse = await axios.post(`${BASE_URL}/ai/conversations/${conversationId}/messages`, {
      content: '你好，这是一个测试消息',
      model: 'gpt-3.5-turbo'
    }, { headers });
    
    if (messageResponse.data.success) {
      console.log('✅ 消息发送成功');
      console.log('用户消息:', messageResponse.data.data.userMessage.content);
      console.log('AI回复:', messageResponse.data.data.assistantMessage.content.substring(0, 100) + '...');
    } else {
      console.log('❌ 消息发送失败:', messageResponse.data.message);
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error.response?.data || error.message);
  }
}

testAIChat();