require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // 使用服务角色密钥

console.log('=== 测试Supabase直接插入 ===\n');

async function testDirectInsert() {
  try {
    console.log('1. 初始化Supabase客户端...');
    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Supabase客户端初始化成功\n');

    console.log('2. 准备测试数据...');
    const testUser = {
      id: uuidv4(),
      username: `testuser_${Date.now().toString().slice(-6)}`,
      email: `test_${Date.now().toString().slice(-6)}@example.com`,
      password_hash: await bcrypt.hash('Test123!@#', 10),
      role: 'standard_user'
    };
    console.log('测试用户数据:', {
      id: testUser.id,
      username: testUser.username,
      email: testUser.email,
      role: testUser.role
    });
    console.log('✅ 测试数据准备完成\n');

    console.log('3. 尝试插入用户...');
    const { data, error } = await supabase
      .from('users')
      .insert(testUser)
      .select();

    if (error) {
      console.error('❌ 插入失败:', error);
      return;
    }

    console.log('✅ 插入成功!');
    console.log('返回的数据:', data);

    console.log('\n4. 验证插入结果...');
    const { data: verifyData, error: verifyError } = await supabase
      .from('users')
      .select('*')
      .eq('id', testUser.id)
      .single();

    if (verifyError) {
      console.error('❌ 验证失败:', verifyError);
      return;
    }

    console.log('✅ 验证成功!');
    console.log('查询到的用户:', verifyData);

  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

testDirectInsert();