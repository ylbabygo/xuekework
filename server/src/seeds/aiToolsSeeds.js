// AI工具种子数据
const aiToolsData = [
  {
    name: 'ChatGPT',
    description: 'OpenAI开发的强大对话AI，能够进行自然语言对话、文本生成、代码编写等多种任务',
    category: '对话AI',
    url: 'https://chat.openai.com',
    logo_url: 'https://cdn.openai.com/API/logo-openai.svg',
    rating: 4.8,
    pricing: 'freemium',
    features: ['自然语言对话', '文本生成', '代码编写', '翻译', '总结'],
    tags: ['对话', 'GPT', '文本生成', '代码', '翻译'],
    is_featured: true
  },
  {
    name: 'Midjourney',
    description: '基于AI的图像生成工具，能够根据文本描述创建高质量的艺术作品和图像',
    category: '图像生成',
    url: 'https://www.midjourney.com',
    logo_url: 'https://www.midjourney.com/favicon.ico',
    rating: 4.7,
    pricing: 'paid',
    features: ['文本到图像', '艺术创作', '高质量输出', '多种风格'],
    tags: ['图像生成', '艺术', '创意', 'AI绘画'],
    is_featured: true
  },
  {
    name: 'GitHub Copilot',
    description: 'AI编程助手，能够根据注释和代码上下文自动生成代码建议',
    category: '编程助手',
    url: 'https://github.com/features/copilot',
    logo_url: 'https://github.githubassets.com/images/modules/site/copilot/copilot.png',
    rating: 4.6,
    pricing: 'paid',
    features: ['代码自动完成', '函数生成', '注释转代码', '多语言支持'],
    tags: ['编程', '代码生成', '开发工具', 'GitHub'],
    is_featured: true
  },
  {
    name: 'Notion AI',
    description: '集成在Notion中的AI写作助手，帮助用户生成、编辑和优化文档内容',
    category: '写作助手',
    url: 'https://www.notion.so/product/ai',
    logo_url: 'https://www.notion.so/images/favicon.ico',
    rating: 4.5,
    pricing: 'freemium',
    features: ['文档生成', '内容优化', '翻译', '总结', '头脑风暴'],
    tags: ['写作', '文档', '笔记', '生产力'],
    is_featured: false
  },
  {
    name: 'Stable Diffusion',
    description: '开源的文本到图像生成模型，支持本地部署和自定义训练',
    category: '图像生成',
    url: 'https://stability.ai/stable-diffusion',
    logo_url: 'https://stability.ai/favicon.ico',
    rating: 4.4,
    pricing: 'free',
    features: ['开源', '本地部署', '自定义训练', '高质量图像'],
    tags: ['开源', '图像生成', '本地部署', 'AI绘画'],
    is_featured: false
  },
  {
    name: 'Claude',
    description: 'Anthropic开发的AI助手，擅长分析、写作和复杂推理任务',
    category: '对话AI',
    url: 'https://claude.ai',
    logo_url: 'https://claude.ai/favicon.ico',
    rating: 4.6,
    pricing: 'freemium',
    features: ['长文本处理', '分析推理', '安全对话', '文档分析'],
    tags: ['对话', '分析', '推理', '安全'],
    is_featured: true
  },
  {
    name: 'Runway ML',
    description: '创意AI工具套件，提供视频编辑、图像处理和生成等功能',
    category: '视频编辑',
    url: 'https://runwayml.com',
    logo_url: 'https://runwayml.com/favicon.ico',
    rating: 4.3,
    pricing: 'freemium',
    features: ['视频生成', '图像编辑', '背景移除', '风格转换'],
    tags: ['视频', '创意', '编辑', '生成'],
    is_featured: false
  },
  {
    name: 'Jasper',
    description: '专业的AI写作工具，帮助营销人员和内容创作者生成高质量文案',
    category: '写作助手',
    url: 'https://www.jasper.ai',
    logo_url: 'https://www.jasper.ai/favicon.ico',
    rating: 4.4,
    pricing: 'paid',
    features: ['营销文案', '博客写作', '社交媒体', 'SEO优化'],
    tags: ['写作', '营销', '文案', 'SEO'],
    is_featured: false
  },
  {
    name: 'Grammarly',
    description: 'AI驱动的写作助手，提供语法检查、风格建议和写作改进',
    category: '写作助手',
    url: 'https://www.grammarly.com',
    logo_url: 'https://www.grammarly.com/favicon.ico',
    rating: 4.5,
    pricing: 'freemium',
    features: ['语法检查', '拼写纠正', '风格建议', '抄袭检测'],
    tags: ['语法', '写作', '校对', '英语'],
    is_featured: false
  },
  {
    name: 'DeepL',
    description: '基于AI的高质量翻译工具，支持多种语言间的精准翻译',
    category: '翻译工具',
    url: 'https://www.deepl.com',
    logo_url: 'https://www.deepl.com/favicon.ico',
    rating: 4.7,
    pricing: 'freemium',
    features: ['高质量翻译', '多语言支持', '文档翻译', 'API接口'],
    tags: ['翻译', '多语言', '文档', 'API'],
    is_featured: true
  },
  {
    name: 'Canva AI',
    description: 'Canva集成的AI设计工具，帮助用户快速创建专业的设计作品',
    category: '设计工具',
    url: 'https://www.canva.com/ai-image-generator/',
    logo_url: 'https://www.canva.com/favicon.ico',
    rating: 4.3,
    pricing: 'freemium',
    features: ['AI设计', '模板生成', '图像编辑', '品牌套件'],
    tags: ['设计', '模板', '品牌', '创意'],
    is_featured: false
  },
  {
    name: 'Perplexity AI',
    description: 'AI搜索引擎，提供准确的答案和引用来源，结合搜索和对话功能',
    category: '搜索引擎',
    url: 'https://www.perplexity.ai',
    logo_url: 'https://www.perplexity.ai/favicon.ico',
    rating: 4.4,
    pricing: 'freemium',
    features: ['AI搜索', '引用来源', '实时信息', '对话式查询'],
    tags: ['搜索', '信息', '引用', '实时'],
    is_featured: false
  }
];

module.exports = {
  aiToolsData
};