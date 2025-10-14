require('dotenv').config();
const { initDatabase, testConnection } = require('../config/database');

async function main() {
  try {
    console.log('开始初始化数据库...');
    
    // 测试数据库连接
    console.log('测试数据库连接...');
    await testConnection();
    console.log('✅ 数据库连接成功');
    
    // 初始化数据库
    console.log('执行数据库初始化脚本...');
    await initDatabase();
    console.log('✅ 数据库初始化完成');
    
    console.log('\n🎉 数据库初始化成功！');
    console.log('\n📋 初始用户账号信息:');
    console.log('\n超级管理员账户:');
    console.log('  用户名: zhangshuang  密码: xueke666');
    console.log('  用户名: yuli         密码: xueke666');
    console.log('\n普通用户账户:');
    console.log('  用户名: lichengcheng 密码: xueke666');
    console.log('  用户名: liuli        密码: xueke666');
    console.log('  用户名: wangxin      密码: xueke666');
    console.log('\n测试账户:');
    console.log('  用户名: admin        密码: 123456');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error);
    process.exit(1);
  }
}

main();