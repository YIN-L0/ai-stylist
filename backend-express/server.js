const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const dataManager = require('./dataManager');
const photoMetadataExtractor = require('./photoMetadata');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

// 确保uploads目录存在
const uploadsDir = path.join(__dirname, 'uploads');
fs.ensureDirSync(uploadsDir);

// 中间件配置
const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? [process.env.FRONTEND_URL] 
  : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 静态文件服务
app.use('/uploads', express.static(uploadsDir));

// 配置multer进行文件上传
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 20 * 1024 * 1024 // 20MB限制
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('只允许上传图片文件'));
    }
  }
});

// 数据现在通过dataManager进行文件存储
console.log('📊 数据管理器已初始化，使用文件存储');

// API路由

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'AI Stylist Backend is running' });
});

// 文件上传API
app.post('/api/upload', upload.array('photos', 3), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: '没有上传文件' });
    }

    const filesWithMetadata = await Promise.all(req.files.map(async file => {
      const fileUrl = `${BASE_URL}/uploads/${file.filename}`;
      const metadata = await photoMetadataExtractor.getCompleteMetadata(
        file.path, 
        file.originalname, 
        fileUrl
      );

      return {
        filename: file.filename,
        originalname: file.originalname,
        url: fileUrl,
        size: file.size,
        metadata: metadata,
        summary: photoMetadataExtractor.generateSummary(metadata)
      };
    }));

    res.json({
      success: true,
      message: '文件上传成功',
      files: filesWithMetadata
    });
  } catch (error) {
    console.error('文件上传错误:', error);
    res.status(500).json({ error: '文件上传失败' });
  }
});

// 提交用户信息和照片
app.post('/api/submit-styling-request', upload.array('photos', 3), async (req, res) => {
  try {
    const { name, email, stylePreference, additionalPreferences } = req.body;
    
    // 验证必填字段
    if (!name || !email || !stylePreference) {
      return res.status(400).json({ 
        error: '缺少必填字段', 
        required: ['name', 'email', 'stylePreference'] 
      });
    }

    // 处理上传的照片
    let photoUrls = [];
    if (req.files && req.files.length > 0) {
      photoUrls = await Promise.all(req.files.map(async file => {
        const fileUrl = `${BASE_URL}/uploads/${file.filename}`;
        const metadata = await photoMetadataExtractor.getCompleteMetadata(
          file.path,
          file.originalname,
          fileUrl
        );

        return {
          filename: file.filename,
          originalname: file.originalname,
          url: fileUrl,
          size: file.size,
          metadata: metadata,
          summary: photoMetadataExtractor.generateSummary(metadata)
        };
      }));
    }

    // 创建用户记录
    const userId = Date.now().toString();
    const userRecord = {
      id: userId,
      name,
      email,
      stylePreference,
      additionalPreferences,
      photos: photoUrls,
      createdAt: new Date().toISOString()
    };

    // 保存用户数据到文件
    dataManager.addUser(userRecord);

    // 生成造型报告（模拟AI分析）
    const stylingReport = generateStylingReport(userRecord);
    const reportRecord = {
      id: Date.now().toString(),
      userId,
      report: stylingReport,
      createdAt: new Date().toISOString()
    };
    
    // 保存报告数据到文件
    dataManager.addReport(reportRecord);

    res.json({
      success: true,
      message: '造型请求提交成功',
      data: {
        userId,
        user: userRecord,
        stylingReport
      }
    });

  } catch (error) {
    console.error('提交造型请求错误:', error);
    res.status(500).json({ error: '服务器错误，请稍后重试' });
  }
});

// 获取用户信息
app.get('/api/users/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const user = dataManager.getUserById(userId);
    
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    console.error('获取用户信息错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 获取造型报告
app.get('/api/styling-report/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const report = dataManager.getReportByUserId(userId);
    
    if (!report) {
      return res.status(404).json({ error: '造型报告不存在' });
    }

    res.json({ success: true, data: report });
  } catch (error) {
    console.error('获取造型报告错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 获取所有造型报告（管理端）
app.get('/api/styling-reports', (req, res) => {
  try {
    const reportsWithUsers = dataManager.getAllReportsWithUsers();
    res.json({ 
      success: true, 
      data: reportsWithUsers
    });
  } catch (error) {
    console.error('获取造型报告列表错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 获取统计信息（管理端）
app.get('/api/statistics', (req, res) => {
  try {
    const statistics = dataManager.getStatistics();
    res.json({ 
      success: true, 
      data: statistics 
    });
  } catch (error) {
    console.error('获取统计信息错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 手动备份数据
app.post('/api/backup', (req, res) => {
  try {
    const backup = dataManager.backupData();
    if (backup) {
      res.json({ 
        success: true, 
        message: '数据备份成功',
        data: backup
      });
    } else {
      res.status(500).json({ error: '数据备份失败' });
    }
  } catch (error) {
    console.error('备份数据错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 获取照片元数据API
app.get('/api/photo-metadata/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(uploadsDir, filename);
    
    // 检查文件是否存在
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: '文件不存在' });
    }

    const fileUrl = `${BASE_URL}/uploads/${filename}`;
    const metadata = await photoMetadataExtractor.getCompleteMetadata(
      filePath,
      null,
      fileUrl
    );

    if (!metadata) {
      return res.status(500).json({ error: '无法提取文件元数据' });
    }

    res.json({
      success: true,
      data: {
        metadata: metadata,
        summary: photoMetadataExtractor.generateSummary(metadata)
      }
    });
  } catch (error) {
    console.error('获取照片元数据错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
});

// 模拟AI生成造型报告的函数
function generateStylingReport(user) {
  const { name, stylePreference, additionalPreferences } = user;
  
  // 根据风格偏好生成建议
  const styleAdvice = getStyleAdvice(stylePreference);
  
  return {
    personalInfo: {
      name,
      stylePreference,
      additionalPreferences
    },
    analysis: {
      bodyType: "基于您的照片分析，我们为您量身定制了以下建议",
      colorPalette: styleAdvice.colors,
      recommendations: styleAdvice.recommendations
    },
    outfitSuggestions: styleAdvice.outfits,
    shoppingSuggestions: styleAdvice.shopping,
    aiStyleAnalysis: styleAdvice.aiDescription,
    summary: `亲爱的${name}，根据您${stylePreference}的风格偏好，我们为您精心策划了个性化的造型方案。

✨ AI个性化分析：
${styleAdvice.aiDescription}

这些建议将帮助您展现最佳的自己，在京东商城即可找到推荐的品牌商品。`
  };
}

// 根据风格偏好获取造型建议
function getStyleAdvice(stylePreference) {
  const adviceMap = {
    'Casual & Comfortable': {
      colors: ['浅蓝色', '白色', '米色', '浅灰色', '薄荷绿'],
      recommendations: [
        '选择舒适的面料，如棉质和针织材料',
        '投资优质的基础单品，如白色T恤和牛仔裤',
        '选择舒适的运动鞋或平底鞋',
        '添加简单的配饰如手表或帽子'
      ],
      outfits: [
        '白色T恤 + 蓝色牛仔裤 + 白色运动鞋',
        '针织毛衣 + 休闲裤 + 乐福鞋',
        '连帽卫衣 + 运动裤 + 运动鞋'
      ],
      shopping: ['优衣库 Uniqlo', 'Gap', 'Levi\'s', 'Converse'],
      aiDescription: 'You have a casual style with urban influence and comfort-first mindset. Try JD brands like Uniqlo, Gap, and Levi\'s. Outfit suggestion: light jeans, oversized cotton top, white sneakers.'
    },
    'Business Professional': {
      colors: ['深蓝色', '黑色', '灰色', '白色', '深红色'],
      recommendations: [
        '投资高质量的西装和正装',
        '选择经典的商务色彩',
        '注重细节，如领带和袖扣',
        '选择优质的皮鞋'
      ],
      outfits: [
        '深蓝色西装 + 白色衬衫 + 深色领带',
        '灰色套装 + 浅蓝色衬衫 + 黑色皮鞋',
        '黑色西装 + 白色衬衫 + 简约配饰'
      ],
      shopping: ['Calvin Klein', 'Tommy Hilfiger', 'Hugo Boss', 'Brooks Brothers'],
      aiDescription: 'You have a business professional style with executive presence and classic sophistication. Try JD brands like Calvin Klein, Tommy Hilfiger, and Hugo Boss. Outfit suggestion: navy suit, crisp white shirt, leather oxford shoes.'
    },
    'Trendy & Fashion-forward': {
      colors: ['亮色系', '撞色搭配', '金属色', '渐变色'],
      recommendations: [
        '关注最新时尚趋势',
        '敢于尝试大胆的搭配',
        '选择有设计感的单品',
        '投资时尚配饰'
      ],
      outfits: [
        '设计师外套 + 修身裤 + 时尚靴子',
        '印花上衣 + 高腰裤 + 声明耳环',
        '不对称裙子 + 时尚上衣 + 高跟鞋'
      ],
      shopping: ['Zara', 'H&M', 'COS', 'Mango'],
      aiDescription: 'You have a trendy fashion-forward style with cutting-edge aesthetics and bold statement pieces. Try JD brands like Zara, H&M, and COS. Outfit suggestion: statement blazer, wide-leg trousers, chunky sneakers.'
    },
    'Classic & Elegant': {
      colors: ['象牙白', '海军蓝', '驼色', '珍珠灰', '酒红色'],
      recommendations: [
        '投资经典永不过时的单品',
        '选择高质量的天然面料如羊毛、丝绸',
        '注重剪裁和细节工艺',
        '选择精致优雅的配饰'
      ],
      outfits: [
        '驼色大衣 + 白色丝绸衬衫 + 直筒裤',
        '小黑裙 + 珍珠项链 + 经典高跟鞋',
        '羊绒毛衣 + A字裙 + 芭蕾平底鞋'
      ],
      shopping: ['Ralph Lauren', 'Brooks Brothers', '优衣库 Uniqlo', 'Massimo Dutti'],
      aiDescription: 'You have a classic elegant style with timeless sophistication and refined taste. Try JD brands like Ralph Lauren, Brooks Brothers, and Uniqlo. Outfit suggestion: camel coat, silk blouse, tailored trousers.'
    },
    'Bohemian & Artistic': {
      colors: ['大地色系', '深绿色', '芥末黄', '紫色', '焦糖色'],
      recommendations: [
        '选择有民族风情的印花和图案',
        '层次搭配不同质感的面料',
        '添加手工艺品和复古配饰',
        '选择自然材质如麻、棉、皮革'
      ],
      outfits: [
        '印花长裙 + 牛仔外套 + 流苏靴',
        '刺绣上衣 + 阔腿裤 + 编织腰带',
        '民族风开衫 + 基础T恤 + 麂皮短靴'
      ],
      shopping: ['Zara', 'Mango', 'Free People', 'Anthropologie'],
      aiDescription: 'You have a bohemian artistic style with free-spirited creativity and eclectic mix patterns. Try JD brands like Zara, Mango, and Free People. Outfit suggestion: flowy maxi dress, denim jacket, fringe ankle boots.'
    },
    'Sporty & Active': {
      colors: ['运动蓝', '活力橙', '清新绿', '纯净白', '炭灰色'],
      recommendations: [
        '选择透气排汗的功能性面料',
        '投资专业的运动装备',
        '注重舒适性和灵活性',
        '选择支撑性好的运动鞋'
      ],
      outfits: [
        '运动上衣 + 瑜伽裤 + 跑步鞋',
        '连帽卫衣 + 运动短裤 + 篮球鞋',
        '运动夹克 + 紧身裤 + 训练鞋'
      ],
      shopping: ['Nike', 'Adidas', 'Under Armour', 'Lululemon'],
      aiDescription: 'You have a sporty active style with athletic performance and dynamic energy. Try JD brands like Nike, Adidas, and Under Armour. Outfit suggestion: moisture-wicking top, yoga leggings, running sneakers.'
    },
    'Minimalist & Clean': {
      colors: ['纯白色', '经典黑', '中性灰', '自然米', '简约蓝'],
      recommendations: [
        '选择简洁线条的基础款',
        '注重质感和剪裁的精致',
        '保持配色的统一和谐',
        '投资多功能的万能单品'
      ],
      outfits: [
        '白色衬衫 + 黑色直筒裤 + 简约皮鞋',
        '灰色毛衣 + 白色阔腿裤 + 小白鞋',
        '黑色T恤 + 牛仔裤 + 简约手表'
      ],
      shopping: ['优衣库 Uniqlo', 'COS', 'MUJI', '无印良品'],
      aiDescription: 'You have a minimalist clean style with modern simplicity and functional aesthetics. Try JD brands like Uniqlo, COS, and MUJI. Outfit suggestion: white button-down, straight black pants, sleek white sneakers.'
    },
    'Vintage & Retro': {
      colors: ['复古红', '怀旧黄', '经典蓝', '古董绿', '奶油色'],
      recommendations: [
        '寻找经典年代的设计元素',
        '选择复古印花和图案',
        '添加怀旧感的配饰',
        '关注二手和古着单品'
      ],
      outfits: [
        '复古印花裙 + 牛仔夹克 + 复古靴',
        '格纹衬衫 + 高腰裤 + 复古眼镜',
        '复古毛衣 + A字裙 + 玛丽珍鞋'
      ],
      shopping: ['Zara', 'H&M', 'Urban Outfitters', 'Vintage Stores'],
      aiDescription: 'You have a vintage retro style with nostalgic charm and timeless character. Try JD brands like Zara, H&M, and vintage collections. Outfit suggestion: high-waisted jeans, retro band tee, classic denim jacket.'
    }
  };

  return adviceMap[stylePreference] || adviceMap['Casual & Comfortable'];
}

// 错误处理中间件
app.use((error, req, res, next) => {
  console.error('服务器错误:', error);
  res.status(500).json({ error: '服务器内部错误' });
});

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({ error: '接口不存在' });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 AI Stylist Backend 服务器运行在端口 ${PORT}`);
  console.log(`📊 API地址: ${BASE_URL}/api`);
  console.log(`📁 文件上传目录: ${uploadsDir}`);
}); 