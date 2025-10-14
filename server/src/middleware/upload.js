const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// 确保上传目录存在
const uploadDir = path.join(__dirname, '../../uploads');
const assetsDir = path.join(uploadDir, 'assets');
const thumbnailsDir = path.join(uploadDir, 'thumbnails');

[uploadDir, assetsDir, thumbnailsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// 配置存储
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, assetsDir);
  },
  filename: function (req, file, cb) {
    // 生成唯一文件名
    const uniqueSuffix = uuidv4();
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  }
});

// 文件过滤器
const fileFilter = (req, file, cb) => {
  // 允许的文件类型
  const allowedTypes = {
    // 图片
    'image/jpeg': true,
    'image/jpg': true,
    'image/png': true,
    'image/gif': true,
    'image/webp': true,
    'image/svg+xml': true,
    
    // 文档
    'application/pdf': true,
    'application/msword': true,
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': true,
    'application/vnd.ms-excel': true,
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': true,
    'application/vnd.ms-powerpoint': true,
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': true,
    'text/plain': true,
    'text/csv': true,
    
    // 音频
    'audio/mpeg': true,
    'audio/wav': true,
    'audio/mp3': true,
    'audio/ogg': true,
    
    // 视频
    'video/mp4': true,
    'video/avi': true,
    'video/mov': true,
    'video/wmv': true,
    'video/webm': true,
    
    // 压缩文件
    'application/zip': true,
    'application/x-rar-compressed': true,
    'application/x-7z-compressed': true,
    
    // 设计文件
    'application/postscript': true, // .ai
    'image/vnd.adobe.photoshop': true, // .psd
  };

  if (allowedTypes[file.mimetype]) {
    cb(null, true);
  } else {
    cb(new Error(`不支持的文件类型: ${file.mimetype}`), false);
  }
};

// 创建multer实例
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
    files: 10 // 最多10个文件
  }
});

// 获取文件类型
const getFileType = (mimetype) => {
  if (mimetype.startsWith('image/')) return 'image';
  if (mimetype.startsWith('video/')) return 'video';
  if (mimetype.startsWith('audio/')) return 'audio';
  if (mimetype.includes('pdf') || 
      mimetype.includes('word') || 
      mimetype.includes('excel') || 
      mimetype.includes('powerpoint') ||
      mimetype.includes('text/')) return 'document';
  if (mimetype.includes('zip') || 
      mimetype.includes('rar') || 
      mimetype.includes('7z')) return 'archive';
  if (mimetype.includes('photoshop') || 
      mimetype.includes('postscript')) return 'design';
  return 'other';
};

// 获取文件分类
const getFileCategory = (mimetype, originalname) => {
  const type = getFileType(mimetype);
  const ext = path.extname(originalname).toLowerCase();
  
  if (type === 'image') return 'image';
  if (type === 'video') return 'video';
  if (type === 'audio') return 'audio';
  if (type === 'design') return 'branding';
  
  if (type === 'document') {
    if (ext === '.ppt' || ext === '.pptx') return 'presentation';
    if (ext === '.xls' || ext === '.xlsx' || ext === '.csv') return 'analytics';
    return 'document';
  }
  
  return 'other';
};

module.exports = {
  upload,
  getFileType,
  getFileCategory,
  uploadDir,
  assetsDir,
  thumbnailsDir
};