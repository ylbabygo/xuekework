const fetch = require('node-fetch');

module.exports = async function handler(req, res) {
  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // 处理预检请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 只允许 POST 请求
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: '只允许 POST 请求'
    });
  }

  try {
    const { 
      prompt, 
      imageType = 'general', 
      numberOfImages = 1, 
      apiKey 
    } = req.body;

    // 验证输入
    if (!prompt) {
      return res.status(400).json({
        success: false,
        message: '提示词不能为空'
      });
    }

    if (!apiKey) {
      return res.status(400).json({
        success: false,
        message: 'API密钥不能为空'
      });
    }

    // 根据图片类型调整提示词
    const enhancedPrompt = enhancePromptByType(prompt, imageType);

    // 调用 Google AI Studio API
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:generateImages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        prompt: enhancedPrompt,
        config: {
          numberOfImages: Math.min(numberOfImages, 4), // 限制最多4张
          aspectRatio: getAspectRatioByType(imageType),
          safetySettings: [
            {
              category: 'HARM_CATEGORY_HATE_SPEECH',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
              category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            }
          ]
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Google AI Studio API错误:', errorData);
      return res.status(response.status).json({
        success: false,
        message: '图片生成失败',
        error: errorData
      });
    }

    const data = await response.json();

    // 处理生成的图片
    const generatedImages = data.generatedImages || [];
    const imageResults = generatedImages.map((img, index) => ({
      id: `img_${Date.now()}_${index}`,
      url: img.uri || img.url,
      prompt: enhancedPrompt,
      type: imageType,
      createdAt: new Date().toISOString()
    }));

    return res.status(200).json({
      success: true,
      message: '图片生成成功',
      data: {
        images: imageResults,
        prompt: enhancedPrompt,
        type: imageType,
        count: imageResults.length
      }
    });

  } catch (error) {
    console.error('图片生成错误:', error);
    return res.status(500).json({
      success: false,
      message: '服务器内部错误',
      error: error.message
    });
  }
};

// 根据图片类型增强提示词
function enhancePromptByType(prompt, imageType) {
  const typeEnhancements = {
    poster: `Create a professional promotional poster design: ${prompt}. High quality, eye-catching, commercial design, vibrant colors, clear typography space`,
    social: `Create a social media post image: ${prompt}. Instagram-style, trendy, engaging, perfect for social sharing, modern aesthetic`,
    banner: `Create a web banner design: ${prompt}. Professional web banner, clean layout, suitable for website header, modern design`,
    logo: `Create a logo design: ${prompt}. Simple, memorable, scalable vector-style, professional branding, clean minimalist design`,
    illustration: `Create a detailed illustration: ${prompt}. Artistic illustration, detailed artwork, creative visual storytelling`,
    product: `Create a product showcase image: ${prompt}. Professional product photography style, clean background, commercial quality`,
    avatar: `Create a profile avatar: ${prompt}. Professional headshot style, clean background, suitable for profile picture`,
    background: `Create a background image: ${prompt}. Seamless background pattern, suitable for wallpaper or backdrop`,
    general: prompt
  };

  return typeEnhancements[imageType] || prompt;
}

// 根据图片类型获取合适的宽高比
function getAspectRatioByType(imageType) {
  const aspectRatios = {
    poster: '2:3',      // 海报比例
    social: '1:1',      // 社交媒体正方形
    banner: '16:9',     // 横幅比例
    logo: '1:1',        // 标志正方形
    illustration: '4:3', // 插画比例
    product: '1:1',     // 产品展示
    avatar: '1:1',      // 头像正方形
    background: '16:9', // 背景横向
    general: '1:1'      // 默认正方形
  };

  return aspectRatios[imageType] || '1:1';
}