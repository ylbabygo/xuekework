import React, { useState } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  TextField, 
  Button, 
  Grid, 
  Card, 
  CardContent, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Slider, 
  Alert,
  CircularProgress,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { 
  Image as ImageIcon, 
  Download as DownloadIcon, 
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  Palette as PaletteIcon
} from '@mui/icons-material';
import { imageGeneratorService } from '../services/imageGenerator';

interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  type: string;
  createdAt: string;
}

const ImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [imageType, setImageType] = useState('general');
  const [numberOfImages, setNumberOfImages] = useState(1);
  const [apiKey, setApiKey] = useState('AIzaSyDYS1QvxZd7UhzCooQIy8ikSvw1XHDlvz4');
  const [loading, setLoading] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [error, setError] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);

  const imageTypes = [
    { value: 'general', label: '通用图片', icon: '🖼️', description: '适合各种用途的通用图片' },
    { value: 'poster', label: '宣传海报', icon: '📋', description: '专业的宣传海报设计' },
    { value: 'social', label: '社交媒体', icon: '📱', description: '适合社交平台分享的图片' },
    { value: 'banner', label: '横幅广告', icon: '🎯', description: '网站横幅和广告设计' },
    { value: 'logo', label: '标志设计', icon: '🎨', description: '品牌标志和图标设计' },
    { value: 'illustration', label: '插画艺术', icon: '🎭', description: '艺术插画和创意图像' },
    { value: 'product', label: '产品展示', icon: '📦', description: '产品摄影和展示图片' },
    { value: 'avatar', label: '头像肖像', icon: '👤', description: '个人头像和肖像图片' },
    { value: 'background', label: '背景图案', icon: '🌅', description: '背景图片和纹理图案' }
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('请输入图片描述');
      return;
    }

    if (!apiKey.trim()) {
      setError('请设置API密钥');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await imageGeneratorService.generateImages({
        prompt: prompt.trim(),
        imageType,
        numberOfImages,
        apiKey: apiKey.trim()
      });

      if (result.success) {
        setGeneratedImages(prev => [...result.data.images, ...prev]);
      } else {
        setError(result.message || '图片生成失败');
      }
    } catch (err: any) {
      setError(err.message || '网络错误，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (imageUrl: string, imageName: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${imageName}_${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('下载失败:', error);
    }
  };

  const selectedImageType = imageTypes.find(type => type.value === imageType);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ 
          fontWeight: 'bold',
          background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          <PaletteIcon sx={{ fontSize: 40, mr: 2, verticalAlign: 'middle' }} />
          AI 图片生成器
        </Typography>
        <Typography variant="h6" color="text.secondary">
          使用 Google AI Studio 生成高质量的创意图片
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* 左侧控制面板 */}
        <Grid item xs={12} md={4}>
          <Card sx={{ position: 'sticky', top: 20 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  生成设置
                </Typography>
                <IconButton onClick={() => setSettingsOpen(true)} size="small">
                  <SettingsIcon />
                </IconButton>
              </Box>

              {/* 图片类型选择 */}
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>图片类型</InputLabel>
                <Select
                  value={imageType}
                  label="图片类型"
                  onChange={(e) => setImageType(e.target.value)}
                >
                  {imageTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <span style={{ marginRight: 8 }}>{type.icon}</span>
                        {type.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* 当前选择的类型信息 */}
              {selectedImageType && (
                <Box sx={{ mb: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    {selectedImageType.description}
                  </Typography>
                </Box>
              )}

              {/* 提示词输入 */}
              <TextField
                fullWidth
                multiline
                rows={4}
                label="图片描述"
                placeholder="请详细描述您想要生成的图片..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                sx={{ mb: 3 }}
              />

              {/* 图片数量 */}
              <Box sx={{ mb: 3 }}>
                <Typography gutterBottom>
                  生成数量: {numberOfImages}
                </Typography>
                <Slider
                  value={numberOfImages}
                  onChange={(_, value) => setNumberOfImages(value as number)}
                  min={1}
                  max={4}
                  marks
                  step={1}
                  valueLabelDisplay="auto"
                />
              </Box>

              {/* 生成按钮 */}
              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handleGenerate}
                disabled={loading || !prompt.trim()}
                startIcon={loading ? <CircularProgress size={20} /> : <ImageIcon />}
                sx={{ mb: 2 }}
              >
                {loading ? '生成中...' : '生成图片'}
              </Button>

              {/* 错误提示 */}
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              {/* 快速提示词 */}
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  快速提示词:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {[
                    '科技感海报',
                    '卡通风格',
                    '简约设计',
                    '复古风格',
                    '未来主义'
                  ].map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      size="small"
                      onClick={() => setPrompt(prev => prev ? `${prev}, ${tag}` : tag)}
                      sx={{ cursor: 'pointer' }}
                    />
                  ))}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* 右侧图片展示区域 */}
        <Grid item xs={12} md={8}>
          {generatedImages.length === 0 ? (
            <Card sx={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Box sx={{ textAlign: 'center', color: 'text.secondary' }}>
                <ImageIcon sx={{ fontSize: 80, mb: 2 }} />
                <Typography variant="h6">
                  还没有生成图片
                </Typography>
                <Typography variant="body2">
                  输入描述并选择类型开始生成
                </Typography>
              </Box>
            </Card>
          ) : (
            <Grid container spacing={2}>
              {generatedImages.map((image) => (
                <Grid item xs={12} sm={6} key={image.id}>
                  <Card sx={{ position: 'relative', overflow: 'hidden' }}>
                    <Box
                      component="img"
                      src={image.url}
                      alt={image.prompt}
                      sx={{
                        width: '100%',
                        height: 250,
                        objectFit: 'cover'
                      }}
                    />
                    <CardContent>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {image.prompt}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                        <Chip 
                          label={imageTypes.find(t => t.value === image.type)?.label || image.type} 
                          size="small" 
                        />
                        <IconButton
                          size="small"
                          onClick={() => handleDownload(image.url, image.type)}
                        >
                          <DownloadIcon />
                        </IconButton>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Grid>
      </Grid>

      {/* 设置对话框 */}
      <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>API 设置</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Google AI Studio API Key"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            sx={{ mt: 2 }}
            helperText="请输入您的 Google AI Studio API 密钥"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsOpen(false)}>取消</Button>
          <Button onClick={() => setSettingsOpen(false)} variant="contained">保存</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ImageGenerator;