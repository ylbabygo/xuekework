const aiService = require('../services/aiService');
const aiManager = require('../services/aiManager');

class ContentController {
  // 生成文案
  async generateContent(req, res) {
    try {
      const { type, prompt, model = 'gpt-3.5-turbo', options = {} } = req.body;
      const userId = req.user.id;

      if (!type || !prompt) {
        return res.status(400).json({
          success: false,
          message: '请提供内容类型和提示词'
        });
      }

      // 根据内容类型构建系统提示词
      const systemPrompts = {
        article: '你是一个专业的文章写作助手。请根据用户的要求创作高质量的文章内容，确保逻辑清晰、结构合理、语言流畅。',
        social: '你是一个社交媒体内容创作专家。请创作吸引人的社交媒体文案，要求简洁有力、富有创意、能够引起用户互动。',
        email: '你是一个专业的邮件写作助手。请创作正式、礼貌、清晰的邮件内容，确保表达准确、语气得体。',
        ad: '你是一个广告文案创作专家。请创作有说服力的广告文案，要求突出产品优势、吸引目标客户、促进转化。',
        blog: '你是一个博客写作专家。请创作有价值的博客文章，要求内容丰富、观点独特、对读者有帮助。',
        product: '你是一个产品描述写作专家。请创作详细、准确、吸引人的产品描述，突出产品特点和优势。',
        news: '你是一个新闻写作专家。请创作客观、准确、及时的新闻内容，确保事实清楚、表达中性。',
        story: '你是一个故事创作专家。请创作引人入胜的故事内容，要求情节生动、人物鲜明、语言优美。'
      };

      const systemPrompt = systemPrompts[type] || '你是一个专业的内容创作助手。请根据用户的要求创作高质量的内容。';

      // 构建完整的提示词
      const fullPrompt = `${systemPrompt}\n\n用户要求：${prompt}`;

      // 调用AI服务生成内容 - 使用AI管理器智能选择模型
      const response = await aiManager.callAI(userId, [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ], {
        model: model,
        taskType: 'content_generation',
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 2000,
        ...options
      });

      res.json({
        success: true,
        data: {
          content: response.content,
          type,
          model,
          usage: response.usage || null
        }
      });

    } catch (error) {
      console.error('内容生成失败:', error);
      res.status(500).json({
        success: false,
        message: '内容生成失败',
        error: error.message
      });
    }
  }

  // 获取内容模板
  async getTemplates(req, res) {
    try {
      const templates = {
        article: [
          {
            id: 'tech-article',
            name: '技术文章',
            description: '专业的技术文章模板',
            prompt: '请写一篇关于{topic}的技术文章，包括背景介绍、核心概念、实际应用和未来发展趋势。文章应该结构清晰，逻辑严谨，适合技术人员阅读。'
          },
          {
            id: 'tutorial',
            name: '教程指南',
            description: '详细的教程指南模板',
            prompt: '请写一篇{topic}的详细教程，包括准备工作、步骤说明、注意事项和常见问题解答。教程应该通俗易懂，步骤清晰。'
          },
          {
            id: 'research-article',
            name: '研究报告',
            description: '学术研究报告模板',
            prompt: '请写一篇关于{topic}的研究报告，包括研究背景、方法论、数据分析、结论和建议。报告应该客观严谨，数据支撑。'
          },
          {
            id: 'industry-analysis',
            name: '行业分析',
            description: '行业分析文章模板',
            prompt: '请写一篇{topic}行业分析文章，包括市场现状、发展趋势、竞争格局和投资机会。分析应该深入全面。'
          }
        ],
        social: [
          {
            id: 'product-launch',
            name: '产品发布',
            description: '产品发布社交媒体文案',
            prompt: '为{product}产品发布创作一条社交媒体文案，突出产品亮点，激发用户兴趣，包含适当的话题标签和互动元素。'
          },
          {
            id: 'event-promotion',
            name: '活动推广',
            description: '活动推广社交媒体文案',
            prompt: '为{event}活动创作推广文案，包括活动亮点、参与方式和优惠信息，语言要有感染力和紧迫感。'
          },
          {
            id: 'brand-story',
            name: '品牌故事',
            description: '品牌故事社交媒体文案',
            prompt: '为{brand}创作品牌故事文案，展现品牌价值观和文化，增强用户情感连接。'
          },
          {
            id: 'user-testimonial',
            name: '用户见证',
            description: '用户见证社交媒体文案',
            prompt: '创作关于{product}的用户见证文案，展现真实用户体验和产品价值，增强可信度。'
          }
        ],
        email: [
          {
            id: 'business-proposal',
            name: '商务提案',
            description: '正式的商务提案邮件',
            prompt: '写一封关于{topic}的商务提案邮件，包括背景说明、解决方案和合作建议。语气要专业正式，结构清晰。'
          },
          {
            id: 'follow-up',
            name: '跟进邮件',
            description: '客户跟进邮件模板',
            prompt: '写一封跟进邮件，关于{topic}，保持专业礼貌的语气，体现关怀和专业性。'
          },
          {
            id: 'welcome-email',
            name: '欢迎邮件',
            description: '新用户欢迎邮件模板',
            prompt: '为{service}新用户写一封欢迎邮件，介绍服务特色、使用指南和联系方式，语气要友好热情。'
          },
          {
            id: 'newsletter',
            name: '新闻通讯',
            description: '定期新闻通讯邮件模板',
            prompt: '创作关于{topic}的新闻通讯邮件，包括最新动态、行业资讯和实用建议，内容要有价值。'
          }
        ],
        ad: [
          {
            id: 'product-ad',
            name: '产品广告',
            description: '产品推广广告文案',
            prompt: '为{product}创作广告文案，突出产品优势和用户价值，包含强有力的行动号召。'
          },
          {
            id: 'service-ad',
            name: '服务广告',
            description: '服务推广广告文案',
            prompt: '为{service}服务创作广告文案，强调专业性和可靠性，突出服务优势。'
          },
          {
            id: 'brand-ad',
            name: '品牌广告',
            description: '品牌形象广告文案',
            prompt: '为{brand}创作品牌形象广告文案，传达品牌理念和价值主张，提升品牌认知度。'
          },
          {
            id: 'promotion-ad',
            name: '促销广告',
            description: '促销活动广告文案',
            prompt: '为{promotion}促销活动创作广告文案，突出优惠力度和限时性，激发购买欲望。'
          }
        ],
        blog: [
          {
            id: 'how-to-guide',
            name: '操作指南',
            description: '实用的操作指南博客',
            prompt: '写一篇关于{topic}的操作指南博客，提供详细步骤和实用技巧，帮助读者解决实际问题。'
          },
          {
            id: 'opinion-piece',
            name: '观点文章',
            description: '个人观点博客文章',
            prompt: '写一篇关于{topic}的观点文章，表达独特见解和深度思考，引发读者讨论。'
          },
          {
            id: 'case-study',
            name: '案例分析',
            description: '案例分析博客文章',
            prompt: '写一篇{topic}的案例分析文章，包括背景介绍、问题分析、解决方案和经验总结。'
          }
        ],
        product: [
          {
            id: 'feature-description',
            name: '功能描述',
            description: '产品功能详细描述',
            prompt: '为{product}的{feature}功能写详细描述，突出功能优势和使用场景，吸引目标用户。'
          },
          {
            id: 'comparison-guide',
            name: '对比指南',
            description: '产品对比指南',
            prompt: '创作{product}与竞品的对比指南，客观分析优劣势，帮助用户做出选择。'
          }
        ],
        news: [
          {
            id: 'breaking-news',
            name: '突发新闻',
            description: '突发新闻报道模板',
            prompt: '写一篇关于{event}的突发新闻报道，包括事件经过、影响分析和后续发展，保持客观中立。'
          },
          {
            id: 'feature-story',
            name: '特写报道',
            description: '深度特写报道模板',
            prompt: '写一篇关于{topic}的特写报道，深入挖掘背景故事，展现人物或事件的深层意义。'
          }
        ],
        story: [
          {
            id: 'brand-story',
            name: '品牌故事',
            description: '企业品牌故事模板',
            prompt: '为{brand}创作品牌故事，讲述创立历程、价值理念和发展愿景，增强品牌感染力。'
          },
          {
            id: 'success-story',
            name: '成功案例',
            description: '客户成功故事模板',
            prompt: '写一个关于{customer}使用{product}获得成功的故事，展现产品价值和客户收益。'
          }
        ]
      };

      res.json({
        success: true,
        data: templates
      });

    } catch (error) {
      console.error('获取模板失败:', error);
      res.status(500).json({
        success: false,
        message: '获取模板失败',
        error: error.message
      });
    }
  }

  // 优化内容
  async optimizeContent(req, res) {
    try {
      const { content, type, requirements } = req.body;
      const userId = req.user.id;

      if (!content) {
        return res.status(400).json({
          success: false,
          message: '请提供要优化的内容'
        });
      }

      const optimizationPrompts = {
        grammar: '请检查并修正以下内容的语法错误，保持原意不变：',
        style: '请优化以下内容的写作风格，使其更加流畅和专业：',
        seo: '请优化以下内容的SEO效果，增加关键词密度和可读性：',
        length: '请调整以下内容的长度，使其更加简洁有力：',
        tone: '请调整以下内容的语气，使其更加符合目标受众：'
      };

      const prompt = `${optimizationPrompts[type] || '请优化以下内容：'}\n\n${content}\n\n${requirements ? `优化要求：${requirements}` : ''}`;

      const response = await aiManager.callAI(userId, [
        { role: 'user', content: prompt }
      ], {
        taskType: 'content_generation'
      });

      res.json({
        success: true,
        data: {
          originalContent: content,
          optimizedContent: response.content,
          type,
          usage: response.usage || null
        }
      });

    } catch (error) {
      console.error('内容优化失败:', error);
      res.status(500).json({
        success: false,
        message: '内容优化失败',
        error: error.message
      });
    }
  }
}

module.exports = new ContentController();