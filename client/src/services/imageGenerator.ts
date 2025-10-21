import { apiRequest } from './api';

export interface GenerateImageRequest {
  prompt: string;
  imageType?: string;
  numberOfImages?: number;
  apiKey: string;
}

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  type: string;
  createdAt: string;
}

export interface GenerateImageResponse {
  success: boolean;
  message: string;
  data: {
    images: GeneratedImage[];
    prompt: string;
    type: string;
    count: number;
  };
}

class ImageGeneratorService {
  /**
   * 生成图片
   */
  async generateImages(request: GenerateImageRequest): Promise<GenerateImageResponse> {
    try {
      const response = await apiRequest('/ai/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: request.prompt,
          imageType: request.imageType || 'general',
          numberOfImages: request.numberOfImages || 1,
          apiKey: request.apiKey
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '图片生成失败');
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error('图片生成服务错误:', error);
      throw new Error(error.message || '网络错误，请重试');
    }
  }

  /**
   * 获取支持的图片类型
   */
  getImageTypes() {
    return [
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
  }

  /**
   * 验证API密钥格式
   */
  validateApiKey(apiKey: string): boolean {
    return apiKey && apiKey.trim().length > 0 && apiKey.startsWith('AIza');
  }

  /**
   * 获取提示词建议
   */
  getPromptSuggestions(imageType: string): string[] {
    const suggestions: Record<string, string[]> = {
      poster: [
        '电影海报风格',
        '复古宣传海报',
        '现代简约海报',
        '音乐会海报',
        '产品宣传海报'
      ],
      social: [
        'Instagram风格',
        '朋友圈配图',
        '微博头图',
        '社交媒体封面',
        '节日祝福图'
      ],
      banner: [
        '网站横幅',
        '广告横幅',
        '活动横幅',
        '促销横幅',
        '品牌横幅'
      ],
      logo: [
        '简约标志',
        '科技公司logo',
        '餐厅标志',
        '运动品牌logo',
        '创意图标'
      ],
      illustration: [
        '卡通插画',
        '手绘风格',
        '数字艺术',
        '概念插画',
        '儿童插画'
      ],
      product: [
        '产品摄影',
        '电商主图',
        '产品展示',
        '包装设计',
        '产品细节'
      ],
      avatar: [
        '专业头像',
        '卡通头像',
        '艺术肖像',
        '商务头像',
        '创意头像'
      ],
      background: [
        '抽象背景',
        '纹理背景',
        '渐变背景',
        '几何背景',
        '自然背景'
      ],
      general: [
        '科技感',
        '卡通风格',
        '简约设计',
        '复古风格',
        '未来主义'
      ]
    };

    return suggestions[imageType] || suggestions.general;
  }

  /**
   * 格式化图片文件名
   */
  formatImageFileName(image: GeneratedImage): string {
    const timestamp = new Date(image.createdAt).getTime();
    const type = image.type || 'image';
    return `${type}_${timestamp}`;
  }

  /**
   * 下载图片
   */
  async downloadImage(imageUrl: string, fileName: string): Promise<void> {
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error('下载失败');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${fileName}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('下载图片失败:', error);
      throw new Error('下载失败，请重试');
    }
  }

  /**
   * 批量下载图片
   */
  async downloadImages(images: GeneratedImage[]): Promise<void> {
    for (const image of images) {
      const fileName = this.formatImageFileName(image);
      await this.downloadImage(image.url, fileName);
      // 添加延迟避免浏览器阻止多个下载
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
}

export const imageGeneratorService = new ImageGeneratorService();

// 导出常用函数以便直接使用
export const getImageTypes = () => imageGeneratorService.getImageTypes();
export const validateApiKey = (apiKey: string) => imageGeneratorService.validateApiKey(apiKey);
export const getPromptSuggestions = (imageType: string) => imageGeneratorService.getPromptSuggestions(imageType);