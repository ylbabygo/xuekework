import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';

// 导入路由
const authRoutes = require('@/routes/auth');
const userRoutes = require('@/routes/users');
const aiRoutes = require('@/routes/ai');
const aiToolsRoutes = require('@/routes/aiTools');
const assetRoutes = require('@/routes/assets');
const noteRoutes = require('@/routes/notes');
const todoRoutes = require('@/routes/todos');
const settingsRoutes = require('@/routes/settings');
const dataRoutes = require('@/routes/data');

// 导入中间件
const { errorHandler } = require('@/middleware/errorHandler');
const { notFound } = require('@/middleware/notFound');

// 加载环境变量
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// 安全中间件
app.use(helmet());

// CORS配置
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-domain.com'] 
    : ['http://localhost:3000'],
  credentials: true
}));

// 请求限制
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15分钟
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // 限制每个IP 100个请求
  message: {
    error: '请求过于频繁，请稍后再试'
  }
});
app.use('/api/', limiter);

// 基础中间件
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 静态文件服务
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API路由 - 统一使用v1版本前缀
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/ai-tools', aiToolsRoutes);
app.use('/api/v1/assets', assetRoutes);
app.use('/api/v1/notes', noteRoutes);
app.use('/api/v1/todos', todoRoutes);
app.use('/api/v1/settings', settingsRoutes);
app.use('/api/v1/data', dataRoutes);

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// 错误处理中间件
app.use(notFound);
app.use(errorHandler);

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 学科运营AI工作台服务器启动成功`);
  console.log(`📍 服务地址: http://localhost:${PORT}`);
  console.log(`🌍 环境: ${process.env.NODE_ENV || 'development'}`);
});

export default app;