const express = require('express');
const multer = require('multer');
const router = express.Router();
const DataController = require('../controllers/dataController');
const { authenticate } = require('../middleware/auth');

// 配置multer用于文件上传
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB限制
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.csv', '.json', '.txt', '.md'];
    const fileExtension = require('path').extname(file.originalname).toLowerCase();
    
    if (allowedTypes.includes(fileExtension)) {
      cb(null, true);
    } else {
      cb(new Error('不支持的文件格式，请上传CSV、JSON、TXT或MD文件'), false);
    }
  }
});

// 所有数据分析路由都需要认证
router.use(authenticate);

// 分析文本数据
router.post('/analyze/text', (req, res) => DataController.analyzeText(req, res));

// 分析文件数据（通过文件路径）
router.post('/analyze/file', (req, res) => DataController.analyzeFile(req, res));

// 分析上传的文件
router.post('/analyze/upload', upload.single('file'), (req, res) => DataController.analyzeUploadedFile(req, res));

// 生成数据报告
router.post('/report/generate', (req, res) => DataController.generateReport(req, res));

// 获取可视化建议
router.post('/visualization/suggestions', (req, res) => DataController.getVisualizationSuggestions(req, res));

// 生成Markdown总结
router.post('/markdown/generate', (req, res) => DataController.generateMarkdownSummary(req, res));

// 生成HTML网页
router.post('/html/generate', (req, res) => DataController.generateHtmlPage(req, res));

module.exports = router;