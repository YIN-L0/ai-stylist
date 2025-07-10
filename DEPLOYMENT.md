# 🚀 AI Stylist 部署指南

## 📋 部署前检查清单

### ✅ 代码准备完成
- [x] 前端API配置支持环境变量
- [x] 后端端口配置支持环境变量  
- [x] CORS配置支持生产环境
- [x] 文件URL生成支持生产环境
- [x] 创建了.gitignore文件
- [x] 创建了环境变量示例文件

## 🌐 部署选项

### 1. Render 部署（推荐）
- **免费计划**: 每月750小时免费
- **自动部署**: GitHub集成，代码推送自动部署
- **HTTPS**: 自动提供SSL证书
- **详细指南**: 查看 `RENDER_DEPLOYMENT_GUIDE.md`
- **快速指南**: 查看 `deploy-to-render.md`

### 2. 其他平台
- **Vercel**: 适合前端部署
- **Netlify**: 适合静态网站
- **Heroku**: 全栈应用部署
- **Railway**: 简单易用的部署平台

## 🔧 项目结构

```
ai-stylist/
├── my-react-app/          # React前端应用
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
├── backend-express/       # Express后端服务
│   ├── server.js
│   ├── dataManager.js
│   ├── package.json
│   ├── .gitignore
│   ├── env.example
│   └── ...
├── RENDER_DEPLOYMENT_GUIDE.md  # 详细部署指南
├── deploy-to-render.md         # 快速部署指南
└── DEPLOYMENT.md              # 本文件
```

## ⚡ 快速开始

### 本地开发
```bash
# 启动后端
cd backend-express
npm install
npm start

# 启动前端（新终端）
cd my-react-app
npm install
npm start
```

### 部署到Render
1. 将代码推送到GitHub
2. 访问 [render.com](https://render.com)
3. 按照 `deploy-to-render.md` 的步骤操作

## 🔑 环境变量配置

### 后端环境变量
```env
NODE_ENV=production
BASE_URL=https://your-backend-url.onrender.com
FRONTEND_URL=https://your-frontend-url.onrender.com
```

### 前端环境变量
```env
REACT_APP_API_BASE_URL=https://your-backend-url.onrender.com/api
```

## 🛠️ 故障排除

### 常见问题
1. **CORS错误**: 检查后端CORS配置
2. **API连接失败**: 检查环境变量设置
3. **文件上传失败**: 检查文件大小和格式
4. **页面加载慢**: 服务可能处于休眠状态

### 解决方案
- 查看部署日志
- 检查环境变量
- 验证URL配置
- 测试API端点

## 📞 获取帮助

- 查看详细指南: `RENDER_DEPLOYMENT_GUIDE.md`
- 检查快速指南: `deploy-to-render.md`
- 查看环境变量示例: `backend-express/env.example`
- 提交Issue到GitHub仓库

---

💡 **提示**: 部署前请确保本地环境运行正常，这样可以避免很多部署问题。 