import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, message, Space, Typography, Alert } from 'antd';
import { SettingOutlined, CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface ApiConfigProps {
  onConfigChange?: (config: { apiUrl: string }) => void;
}

const ApiConfig: React.FC<ApiConfigProps> = ({ onConfigChange }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [testStatus, setTestStatus] = useState<'success' | 'error' | 'testing' | null>(null);
  const [currentApiUrl, setCurrentApiUrl] = useState<string>('');

  useEffect(() => {
    // 获取当前API配置
    const savedApiUrl = localStorage.getItem('custom_api_url') || 
                       process.env.REACT_APP_API_URL || 
                       'http://localhost:5000/api/v1';
    setCurrentApiUrl(savedApiUrl);
    form.setFieldsValue({ apiUrl: savedApiUrl });
  }, [form]);

  const testApiConnection = async (apiUrl: string) => {
    setTestStatus('testing');
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`${apiUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        setTestStatus('success');
        message.success('API连接测试成功！');
        return true;
      } else {
        setTestStatus('error');
        message.error('API连接测试失败，请检查地址是否正确');
        return false;
      }
    } catch (error) {
      setTestStatus('error');
      if (error instanceof Error && error.name === 'AbortError') {
        message.error('API连接超时，请检查网络或API地址');
      } else {
        message.error('API连接测试失败，请检查地址是否正确');
      }
      return false;
    }
  };

  const handleSave = async (values: { apiUrl: string }) => {
    setLoading(true);
    try {
      const apiUrl = values.apiUrl.trim();
      
      // 测试API连接
      const isConnected = await testApiConnection(apiUrl);
      
      if (isConnected) {
        // 保存配置
        localStorage.setItem('custom_api_url', apiUrl);
        setCurrentApiUrl(apiUrl);
        
        // 通知父组件配置变更
        if (onConfigChange) {
          onConfigChange({ apiUrl });
        }
        
        message.success('API配置保存成功！页面将在3秒后刷新以应用新配置');
        
        // 3秒后刷新页面以应用新配置
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      }
    } catch (error) {
      message.error('保存配置失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleTest = async () => {
    const apiUrl = form.getFieldValue('apiUrl');
    if (!apiUrl) {
      message.warning('请先输入API地址');
      return;
    }
    await testApiConnection(apiUrl.trim());
  };

  const resetToDefault = () => {
    const defaultUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';
    form.setFieldsValue({ apiUrl: defaultUrl });
    setTestStatus(null);
  };

  const getStatusIcon = () => {
    switch (testStatus) {
      case 'success':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'error':
        return <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />;
      case 'testing':
        return <SettingOutlined spin style={{ color: '#1890ff' }} />;
      default:
        return null;
    }
  };

  return (
    <Card 
      title={
        <Space>
          <SettingOutlined />
          <span>API配置</span>
        </Space>
      }
      style={{ maxWidth: 600, margin: '0 auto' }}
    >
      <Alert
        message="API配置说明"
        description={
          <div>
            <p>• 本地开发：使用 http://localhost:5000/api/v1</p>
            <p>• 生产环境：配置您的后端API地址</p>
            <p>• 支持的后端部署平台：Vercel、Railway、Heroku、Render等</p>
          </div>
        }
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSave}
        initialValues={{ apiUrl: currentApiUrl }}
      >
        <Form.Item
          label="API基础地址"
          name="apiUrl"
          rules={[
            { required: true, message: '请输入API地址' },
            { type: 'url', message: '请输入有效的URL地址' },
          ]}
          extra={
            <Space>
              <Text type="secondary">当前使用：{currentApiUrl}</Text>
              {getStatusIcon()}
            </Space>
          }
        >
          <Input
            placeholder="https://your-backend-api.vercel.app/api/v1"
            suffix={
              <Button 
                type="link" 
                size="small" 
                onClick={handleTest}
                loading={testStatus === 'testing'}
              >
                测试连接
              </Button>
            }
          />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              disabled={testStatus !== 'success'}
            >
              保存配置
            </Button>
            <Button onClick={resetToDefault}>
              恢复默认
            </Button>
          </Space>
        </Form.Item>
      </Form>

      <Alert
        message="注意事项"
        description={
          <div>
            <p>• 修改API配置后需要刷新页面才能生效</p>
            <p>• 请确保后端API服务正常运行</p>
            <p>• 生产环境请使用HTTPS协议</p>
          </div>
        }
        type="warning"
        showIcon
        style={{ marginTop: 16 }}
      />
    </Card>
  );
};

export default ApiConfig;