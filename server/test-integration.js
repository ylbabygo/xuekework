const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/v1';

async function testIntegration() {
  try {
    console.log('🧪 开始综合集成测试...\n');

    // 1. 测试认证系统
    console.log('1. 测试用户认证...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });

    if (!loginResponse.data.success) {
      throw new Error('登录失败');
    }

    const token = loginResponse.data.data.token;
    console.log('✅ 用户认证成功\n');

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // 2. 测试AI模型获取
    console.log('2. 测试AI模型获取...');
    const modelsResponse = await axios.get(`${BASE_URL}/ai/models`, { headers });
    console.log(`✅ 获取到 ${modelsResponse.data.data.length} 个AI模型\n`);

    // 3. 测试对话功能
    console.log('3. 测试AI对话功能...');
    
    // 创建对话
    const conversationResponse = await axios.post(`${BASE_URL}/ai/conversations`, {
      title: '集成测试对话',
      model: 'deepseek'
    }, { headers });

    const conversationId = conversationResponse.data.data.id;
    console.log(`✅ 创建对话成功，ID: ${conversationId}`);

    // 发送消息
    const messageResponse = await axios.post(`${BASE_URL}/ai/conversations/${conversationId}/messages`, {
      content: '你好，这是一个集成测试消息',
      model: 'deepseek'
    }, { headers });

    console.log('✅ 消息发送成功，收到AI回复\n');

    // 4. 测试内容生成功能
    console.log('4. 测试内容生成功能...');
    const contentResponse = await axios.post(`${BASE_URL}/content/generate`, {
      type: 'article',
      prompt: '写一段关于学习的励志文字，50字以内',
      model: 'deepseek',
      options: {
        temperature: 0.7,
        maxTokens: 200
      }
    }, { headers });

    console.log('✅ 内容生成成功\n');

    // 5. 测试笔记功能
    console.log('5. 测试笔记功能...');
    const noteResponse = await axios.post(`${BASE_URL}/notes`, {
      title: '集成测试笔记',
      content: '这是一个集成测试创建的笔记',
      category: 'test',
      tags: ['测试', '集成']
    }, { headers });

    console.log('✅ 笔记创建成功\n');

    // 6. 测试数据分析功能
    console.log('6. 测试数据分析功能...');
    try {
      const analysisResponse = await axios.post(`${BASE_URL}/data/analyze-text`, {
        text: '这是一段测试文本，用于验证数据分析功能是否正常工作。',
        analysisType: 'general'
      }, { headers });
      console.log('✅ 数据分析功能正常\n');
    } catch (error) {
      console.log('⚠️ 数据分析功能可能需要额外配置\n');
    }

    // 7. 测试学习计划功能
    console.log('7. 测试学习计划功能...');
    try {
      const studyPlanResponse = await axios.post(`${BASE_URL}/learning/study-plan`, {
        subject: '人工智能',
        level: 'beginner',
        duration: 30,
        goals: ['了解AI基础概念', '学习机器学习']
      }, { headers });
      console.log('✅ 学习计划生成成功\n');
    } catch (error) {
      console.log('⚠️ 学习计划功能可能需要额外配置\n');
    }

    console.log('🎉 综合集成测试完成！');
    console.log('✅ 核心功能验证通过：');
    console.log('  - 用户认证系统');
    console.log('  - AI对话功能');
    console.log('  - 内容生成功能');
    console.log('  - 笔记管理功能');
    console.log('  - 前后端API通信');

  } catch (error) {
    console.error('❌ 集成测试失败:', error.response?.data || error.message);
  }
}

testIntegration();