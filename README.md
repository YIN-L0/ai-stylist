# AI 时尚造型师 (AI Stylist)

一个基于AI的个性化时尚造型推荐应用，帮助用户获得专业的造型建议。

## 🌟 功能特点

- **个性化分析**: 根据用户风格偏好生成定制化造型建议
- **照片上传**: 支持上传多张照片进行分析
- **图片编辑**: 内置图片裁剪和编辑功能
- **实时报告**: 生成详细的造型分析报告
- **响应式设计**: 适配各种设备尺寸

## 🏗️ 技术架构

### 前端 (React)
- **框架**: React 19.1.0
- **UI库**: Ant Design 5.26.4
- **HTTP客户端**: Axios
- **图片处理**: react-image-crop

### 后端 (Express)
- **框架**: Express 4.18.2
- **文件上传**: Multer
- **跨域处理**: CORS
- **文件系统**: fs-extra

## 🚀 快速开始

### 方法1: 使用启动脚本 (推荐)

```bash
# 给脚本添加执行权限
chmod +x start-servers.sh

# 启动应用
./start-servers.sh
```

### 方法2: 手动启动

#### 1. 启动后端服务器

```bash
cd backend-express
npm install
npm start
```

后端将在 http://localhost:5001 启动

#### 2. 启动前端服务器

```bash
cd my-react-app
npm install
npm start
```

前端将在 http://localhost:3000 启动

## 📱 使用指南

1. **填写个人信息**
   - 输入姓名和邮箱
   - 选择风格偏好
   - 添加其他描述（可选）

2. **上传照片**
   - 点击上传区域选择照片
   - 支持上传1-3张图片
   - 可以预览和编辑图片

3. **获取报告**
   - 点击"Get My Styling Report"按钮
   - 等待AI分析生成报告
   - 查看个性化造型建议

## 🔧 API 接口

### 健康检查
```
GET /api/health
```

### 文件上传
```
POST /api/upload
Content-Type: multipart/form-data
```

### 提交造型请求
```
POST /api/submit-styling-request
Content-Type: multipart/form-data
Body: {
  name: string,
  email: string,
  stylePreference: string,
  additionalPreferences: string,
  photos: File[]
}
```

### 获取用户信息
```
GET /api/users/:userId
```

### 获取造型报告
```
GET /api/styling-report/:userId
```

## 📁 项目结构

```
ai-stylist/
├── backend-express/          # Express后端
│   ├── server.js            # 主服务器文件
│   ├── package.json         # 后端依赖
│   └── uploads/             # 文件上传目录
├── my-react-app/            # React前端
│   ├── src/
│   │   ├── App.js          # 主应用组件
│   │   ├── api/            # API服务
│   │   │   └── apiService.js
│   │   └── components/     # React组件
│   │       └── StylingReport.js
│   └── package.json        # 前端依赖
├── start-servers.sh         # 启动脚本
└── README.md               # 项目文档
```

## 🎨 风格选项

应用支持以下时尚风格：

- **Casual & Comfortable** - 休闲舒适
- **Business Professional** - 商务专业
- **Trendy & Fashion-forward** - 时尚前卫
- **Classic & Elegant** - 经典优雅
- **Bohemian & Artistic** - 波西米亚艺术
- **Sporty & Active** - 运动活力
- **Minimalist & Clean** - 极简清新
- **Vintage & Retro** - 复古怀旧

## 🛠️ 开发说明

### 环境要求
- Node.js >= 16.0.0
- npm >= 8.0.0

### 安装依赖
```bash
# 后端依赖
cd backend-express && npm install

# 前端依赖
cd my-react-app && npm install
```

### 开发模式
```bash
# 后端开发模式 (使用nodemon)
cd backend-express && npm run dev

# 前端开发模式
cd my-react-app && npm start
```

## 🔒 安全说明

- 文件上传限制为5MB
- 只允许图片文件上传
- 使用CORS保护跨域请求
- 文件存储在服务器本地uploads目录

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 📝 许可证

本项目采用 ISC 许可证。

## 🐛 问题反馈

如果遇到问题，请在项目 Issues 中提交。

---

**享受你的时尚造型之旅！** ✨👗👔 