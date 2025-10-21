import React, { useState } from 'react';
import {
  Card,
  Button,
  Input,
  Select,
  Typography,
  Row,
  Col,
  Space,
  Alert,
  Spin,
  Tag,
  Slider,
  Form,
  message,
  Image,
  Divider
} from 'antd';
import { DownloadOutlined, PictureOutlined, BgColorsOutlined } from '@ant-design/icons';
import { generateImages, ImageType, getImageTypes, getPromptSuggestions } from '../services/imageGenerator';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface GeneratedImage {
  url: string;
  prompt: string;
  timestamp: number;
}

const ImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [imageType, setImageType] = useState<ImageType>('poster');
  const [numberOfImages, setNumberOfImages] = useState(1);
  const [apiKey, setApiKey] = useState('AIzaSyDYS1QvxZd7UhzCooQIy8ikSvw1XHDlvz4');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [error, setError] = useState<string | null>(null);

  const imageTypes = getImageTypes();
  const promptSuggestions = getPromptSuggestions(imageType);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      message.error('请输入图片描述');
      return;
    }

    if (!apiKey.trim()) {
      message.error('请输入API密钥');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const result = await generateImages({
        prompt,
        imageType,
        numberOfImages,
        apiKey
      });

      if (result.success && result.images) {
        const newImages: GeneratedImage[] = result.images.map(url => ({
          url,
          prompt,
          timestamp: Date.now()
        }));
        setGeneratedImages(prev => [...newImages, ...prev]);
        message.success(`成功生成 ${result.images.length} 张图片`);
      } else {
        throw new Error(result.error || '生成失败');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '生成图片时发生错误';
      setError(errorMessage);
      message.error(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async (imageUrl: string, index: number) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `generated-image-${imageType}-${index + 1}-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      message.success('图片下载成功');
    } catch (err) {
      message.error('下载失败');
    }
  };

  const handleDownloadAll = async () => {
    for (let i = 0; i < generatedImages.length; i++) {
      await handleDownload(generatedImages[i].url, i);
      // 添加延迟避免浏览器阻止多个下载
      if (i < generatedImages.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* 页面标题 */}
        <div style={{ textAlign: 'center' }}>
          <Title level={2}>
            <PictureOutlined style={{ marginRight: '8px' }} />
            AI 图片生成器
          </Title>
          <Paragraph type="secondary">
            使用 Google AI Studio 生成高质量的AI图片
          </Paragraph>
        </div>

        {/* 配置面板 */}
        <Card title="生成配置" extra={<BgColorsOutlined />}>
          <Form layout="vertical">
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Form.Item label="图片类型">
                  <Select
                    value={imageType}
                    onChange={setImageType}
                    style={{ width: '100%' }}
                  >
                    {imageTypes.map(type => (
                      <Option key={type.value} value={type.value}>
                        {type.label}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label={`生成数量: ${numberOfImages}`}>
                  <Slider
                    min={1}
                    max={4}
                    value={numberOfImages}
                    onChange={setNumberOfImages}
                    marks={{
                      1: '1',
                      2: '2',
                      3: '3',
                      4: '4'
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item label="图片描述">
              <TextArea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="请描述您想要生成的图片..."
                rows={4}
                maxLength={500}
                showCount
              />
            </Form.Item>

            {promptSuggestions.length > 0 && (
              <Form.Item label="提示词建议">
                <Space wrap>
                  {promptSuggestions.map((suggestion, index) => (
                    <Tag
                      key={index}
                      style={{ cursor: 'pointer' }}
                      onClick={() => setPrompt(prev => prev + (prev ? ', ' : '') + suggestion)}
                    >
                      {suggestion}
                    </Tag>
                  ))}
                </Space>
              </Form.Item>
            )}

            <Form.Item label="API 密钥">
              <Input.Password
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="请输入您的 Google AI Studio API 密钥"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                size="large"
                onClick={handleGenerate}
                loading={isGenerating}
                disabled={!prompt.trim() || !apiKey.trim()}
                style={{ width: '100%' }}
              >
                {isGenerating ? '生成中...' : '生成图片'}
              </Button>
            </Form.Item>
          </Form>
        </Card>

        {/* 错误提示 */}
        {error && (
          <Alert
            message="生成失败"
            description={error}
            type="error"
            showIcon
            closable
            onClose={() => setError(null)}
          />
        )}

        {/* 生成的图片 */}
        {generatedImages.length > 0 && (
          <Card
            title={`生成的图片 (${generatedImages.length})`}
            extra={
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                onClick={handleDownloadAll}
              >
                下载全部
              </Button>
            }
          >
            <Row gutter={[16, 16]}>
              {generatedImages.map((image, index) => (
                <Col xs={24} sm={12} md={8} lg={6} key={`${image.timestamp}-${index}`}>
                  <Card
                    hoverable
                    cover={
                      <Image
                        src={image.url}
                        alt={`Generated ${index + 1}`}
                        style={{ height: '200px', objectFit: 'cover' }}
                        preview={{
                          mask: '预览'
                        }}
                      />
                    }
                    actions={[
                      <Button
                        type="text"
                        icon={<DownloadOutlined />}
                        onClick={() => handleDownload(image.url, index)}
                      >
                        下载
                      </Button>
                    ]}
                  >
                    <Card.Meta
                      description={
                        <Text ellipsis={{ tooltip: image.prompt }}>
                          {image.prompt}
                        </Text>
                      }
                    />
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        )}

        {/* 加载状态 */}
        {isGenerating && (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Spin size="large" />
            <div style={{ marginTop: '16px' }}>
              <Text>正在生成图片，请稍候...</Text>
            </div>
          </div>
        )}
      </Space>
    </div>
  );
};

export default ImageGenerator;