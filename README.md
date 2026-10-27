# Fashion Commerce — Early Multimodal Styling Prototype

An early multimodal prototype exploring how text preferences and photos can be turned into an orchestrated recommendation workflow. It is the predecessor to the Fashion Commerce agent orchestration work — kept here to show the evolution from a single-flow demo toward multi-step, production-oriented agent workflows.

What this prototype explores:

- How user preferences, expressed loosely in text, can be interpreted as structured styling constraints.
- How photos and preferences together provide richer context than either modality alone.
- How a recommendation workflow can be organized as distinct, checkable steps rather than one opaque generation step.

This is intentionally an early exploration. Its value is in the questions it raised — about intent, consistency, and verification — which the later Fashion Commerce orchestration work addresses more directly.

## English Version

### What This App Does

This app is basically your personal fashion consultant that never sleeps. You tell it your style preferences, optionally upload some photos, and it gives you tailored fashion advice including color palettes, outfit suggestions, and brand recommendations from JD.com's partner stores.

*Important Note:** This application uses **Mock API** for demonstration purposes. The styling recommendations are generated using predefined templates and logic rather than actual AI services. This makes it perfect for showcasing the user interface and user experience without requiring expensive AI API integrations.

The whole thing started as a way to help people who wants to put together outfits better or just want to try something new. Instead of spending hours scrolling through fashion blogs or asking friends for advice, you get instant, personalized recommendations.

### Features

**Core Functionality:**
- Personal information collection (name, email)
- 8 different style preferences to choose from
- Optional photo upload (up to 3 images) with editing capabilities
- AI-powered style analysis with bilingual reports
- Brand recommendations focusing on JD.com partners
- Responsive design that works on phones, tablets, and desktop

**Style Categories Available:**
- Casual & Comfortable
- Business Professional  
- Trendy & Fashion-forward
- Classic & Elegant
- Bohemian & Artistic
- Sporty & Active
- Minimalist & Clean
- Vintage & Retro

**Technical Features:**
- Real-time image cropping and editing
- Form validation and error handling
- Backend connection status monitoring
- Admin dashboard for data management
- Mobile-optimized interface

### Tech Stack

**Frontend:**
- React 18.2.0
- Ant Design 5.26.4 (UI components)
- Axios for API calls
- react-image-crop for photo editing

**Backend:**
- Node.js with Express 4.18.2
- Multer for file uploads
- CORS for cross-origin requests
- File-based data storage (JSON files)

### Quick Setup

**Requirements:**
- Node.js 18 or higher
- npm or yarn

**Getting it running locally:**

1. Clone this repo:
```bash
git clone https://github.com/YIN-L0/ai-stylist.git
cd ai-stylist
```

2. Start the backend server:
```bash
cd backend-express
npm install
npm start
```
The backend runs on http://localhost:5001

3. In another terminal, start the frontend:
```bash
cd my-react-app
npm install
npm start
```
The frontend runs on http://localhost:3000

**Quick start script (if you're on Mac/Linux):**
```bash
chmod +x start-servers.sh
./start-servers.sh
```

### How To Use

1. Open http://localhost:3000 in your browser
2. Fill out the form with your name and email
3. Pick your style preference from the dropdown
4. Add any additional style notes (optional)
5. Upload photos if you want more personalized advice (optional)
6. Click "Get My Styling Report"
7. Check out your personalized recommendations

### API Reference

**Health Check:**
```
GET /api/health
Response: {"status":"OK","message":"AI Stylist Backend is running"}
```

**Submit Styling Request:**
```
POST /api/submit-styling-request
Content-Type: multipart/form-data

Form Fields:
- name: string (required)
- email: string (required) 
- stylePreference: string (required)
- additionalPreferences: string (optional)
- photos: File[] (optional, max 3 files)

Response: Complete styling report with recommendations
```

**Get All Reports (Admin):**
```
GET /api/styling-reports
Response: Array of all styling reports
```

**Get Statistics (Admin):**
```
GET /api/statistics
Response: Usage statistics and metrics
```

### Deployment

This app is set up to deploy on Render.com. Check out the deployment guides in the project:
- `RENDER_DEPLOYMENT_GUIDE.md` - Detailed step-by-step instructions
- `deploy-to-render.md` - Quick 5-minute deployment guide

**Environment Variables for Production:**
- `BASE_URL` - Your production domain
- `NODE_ENV` - Set to "production"
- `PORT` - Usually handled automatically by hosting platforms

### Development Notes

**File Structure:**
```
ai-stylist/
├── my-react-app/          # React frontend
├── backend-express/       # Express backend
├── start-servers.sh       # Development startup script
└── deployment guides      # Various .md files for deployment
```

**Common Issues:**

*Port already in use error:*
```bash
lsof -ti:5001
kill -9 [process-id]
```

*Frontend not connecting to backend:*
Check that both servers are running and the API base URL in `my-react-app/src/api/apiService.js` is correct.

*ESLint warnings:*
Most are handled, but if you see new ones, they're usually about missing dependencies in useEffect hooks.

### Contributing
---

## 中文版本

### 这个应用是做什么的

这基本上就是数字个人时尚顾问。你告诉它你的风格喜好，可选择上传一些照片，然后它会给你量身定制的时尚建议，包括色彩搭配、服装建议和京东合作品牌推荐。

开发这个应用的初衷是帮助那些在搭配服装上有需求和创意的人，或者想要尝试新风格的人。不用花几个小时浏览时尚博客或者问朋友建议，你可以立即获得个性化的推荐。
这个应用使用**模拟API (Mock API)**来演示功能。造型建议是通过预定义的模板和逻辑生成的，而不是真正的AI服务。这样设计使得应用非常适合展示用户界面和用户体验，而无需昂贵的AI API集成。


### 功能特点

**核心功能：**
- 个人信息收集（姓名、邮箱）
- 8种不同风格偏好可选
- 可选照片上传（最多3张）带编辑功能
- AI驱动的风格分析和双语报告
- 重点推荐京东合作品牌
- 响应式设计，支持手机、平板和桌面

**风格分类：**
- 休闲舒适 (Casual & Comfortable)
- 商务专业 (Business Professional)
- 时尚前卫 (Trendy & Fashion-forward)
- 经典优雅 (Classic & Elegant)
- 波西米亚艺术 (Bohemian & Artistic)
- 运动活力 (Sporty & Active)
- 极简干净 (Minimalist & Clean)
- 复古怀旧 (Vintage & Retro)

**技术特性：**
- 实时图片裁剪和编辑
- 表单验证和错误处理
- 后端连接状态监控
- 管理员数据管理面板
- 移动端优化界面

### 技术栈

**前端：**
- React 18.2.0
- Ant Design 5.26.4（UI组件库）
- Axios 处理API调用
- react-image-crop 图片编辑

**后端：**
- Node.js + Express 4.18.2
- Multer 文件上传
- CORS 跨域处理
- 基于文件的数据存储（JSON文件）

### 快速安装

**环境要求：**
- Node.js 18或更高版本
- npm或yarn

**本地运行步骤：**

1. 克隆这个仓库：
```bash
git clone https://github.com/YIN-L0/ai-stylist.git
cd ai-stylist
```

2. 启动后端服务器：
```bash
cd backend-express
npm install
npm start
```
后端运行在 http://localhost:5001

3. 在另一个终端启动前端：
```bash
cd my-react-app
npm install
npm start
```
前端运行在 http://localhost:3000

**快速启动脚本（Mac/Linux）：**
```bash
chmod +x start-servers.sh
./start-servers.sh
```

### 使用方法

1. 在浏览器中打开 http://localhost:3000
2. 填写表单中的姓名和邮箱
3. 从下拉菜单选择你的风格偏好
4. 添加其他风格说明（可选）
5. 如果想要更个性化的建议可以上传照片（可选）
6. 点击"Get My Styling Report"
7. 查看你的个性化推荐

### API接口文档

**健康检查：**
```
GET /api/health
返回: {"status":"OK","message":"AI Stylist Backend is running"}
```

**提交造型请求：**
```
POST /api/submit-styling-request
Content-Type: multipart/form-data

表单字段：
- name: string（必填）
- email: string（必填）
- stylePreference: string（必填）
- additionalPreferences: string（可选）
- photos: File[]（可选，最多3个文件）

返回：完整的造型报告和推荐
```

**获取所有报告（管理员）：**
```
GET /api/styling-reports
返回：所有造型报告的数组
```

**获取统计数据（管理员）：**
```
GET /api/statistics
返回：使用统计和指标
```

### 部署

这个应用配置为在Render.com上部署。查看项目中的部署指南：
- `RENDER_DEPLOYMENT_GUIDE.md` - 详细的分步说明
- `deploy-to-render.md` - 5分钟快速部署指南

**生产环境变量：**
- `BASE_URL` - 你的生产域名
- `NODE_ENV` - 设置为"production"
- `PORT` - 通常由托管平台自动处理

### 开发说明

**文件结构：**
```
ai-stylist/
├── my-react-app/          # React前端
├── backend-express/       # Express后端
├── start-servers.sh       # 开发启动脚本
└── deployment guides      # 各种部署指南.md文件
```

**常见问题：**

*端口被占用错误：*
```bash
lsof -ti:5001
kill -9 [进程ID]
```

*前端无法连接后端：*
检查两个服务器都在运行，并且`my-react-app/src/api/apiService.js`中的API基础URL正确。

*ESLint警告：*
大部分已经处理，如果看到新的警告，通常是关于useEffect钩子中缺少依赖项。

### 贡献

欢迎fork这个项目并改进它。代码结构比较直观 - 风格推荐的主要逻辑在`backend-express/server.js`的`getStyleAdvice`函数中。

如果想要添加新的风格分类或更改品牌推荐，那就是你需要查看的地方。

### 测试访问地址

**本地开发：**
- 前端：http://localhost:3000
- 后端：http://localhost:5001
- 手机访问：http://192.168.1.31:3000（需要在同一WiFi网络）

**移动端测试：**
使用浏览器开发者工具的设备模拟器，或者在真实手机上访问网络地址进行测试。

---

## License

MIT License - feel free to use this however you want.

## Contact

If you run into issues or have questions, check the existing issues on GitHub or create a new one.
