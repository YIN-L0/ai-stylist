# 🚀 AI Stylist - Render 部署指南

本指南将帮助您将 AI Stylist 项目部署到 Render 平台。

## 📋 部署准备

### 1. 代码准备
- ✅ 前端API配置已支持环境变量
- ✅ 后端端口配置已支持环境变量
- ✅ CORS配置已支持生产环境
- ✅ 文件URL生成已支持生产环境

### 2. 前提条件
- GitHub账号
- Render账号 (可用GitHub登录)
- 项目代码已推送到GitHub

## 🔧 部署步骤

### 第一部分：部署后端服务

1. **登录Render控制台**
   - 访问 [render.com](https://render.com)
   - 使用GitHub账号登录

2. **创建新的Web Service**
   - 点击 "New" → "Web Service"
   - 连接您的GitHub仓库
   - 选择包含项目的仓库

3. **配置后端服务**
   ```
   Name: ai-stylist-backend
   Environment: Node
   Region: Oregon (或离用户最近的地区)
   Branch: main
   Root Directory: backend-express
   Build Command: npm install
   Start Command: npm start
   ```

4. **设置环境变量**
   在 "Environment Variables" 部分添加：
   ```
   NODE_ENV=production
   PORT=10000 (Render会自动设置，通常不需要手动设置)
   BASE_URL=https://ai-stylist-backend.onrender.com (替换为您的实际域名)
   FRONTEND_URL=https://ai-stylist-frontend.onrender.com (稍后设置)
   ```

5. **部署后端**
   - 点击 "Create Web Service"
   - 等待构建和部署完成（约3-5分钟）
   - 记录后端URL，格式为：`https://ai-stylist-backend.onrender.com`

### 第二部分：部署前端应用

1. **创建新的Static Site**
   - 在Render控制台点击 "New" → "Static Site"
   - 选择同一个GitHub仓库

2. **配置前端服务**
   ```
   Name: ai-stylist-frontend
   Branch: main
   Root Directory: my-react-app
   Build Command: npm install && npm run build
   Publish Directory: build
   ```

3. **设置环境变量**
   在 "Environment Variables" 部分添加：
   ```
   REACT_APP_API_BASE_URL=https://ai-stylist-backend.onrender.com/api
   ```
   (替换为您的实际后端URL)

4. **部署前端**
   - 点击 "Create Static Site"
   - 等待构建和部署完成（约3-5分钟）

### 第三部分：更新后端环境变量

1. **获取前端URL**
   - 前端部署完成后，记录前端URL，格式为：`https://ai-stylist-frontend.onrender.com`

2. **更新后端CORS配置**
   - 返回后端服务设置页面
   - 在环境变量中更新 `FRONTEND_URL` 为实际的前端URL
   - 保存设置并重新部署

## 🎯 验证部署

### 检查后端
- 访问 `https://your-backend-url.onrender.com/api/health`
- 应该看到：`{"status":"OK","message":"AI Stylist Backend is running"}`

### 检查前端
- 访问前端URL
- 检查页面右上角是否显示 "✅ 后端已连接"
- 测试提交表单功能
- 测试管理员页面功能

## ⚙️ 环境变量总结

### 后端环境变量
```
NODE_ENV=production
BASE_URL=https://your-backend-url.onrender.com
FRONTEND_URL=https://your-frontend-url.onrender.com
```

### 前端环境变量
```
REACT_APP_API_BASE_URL=https://your-backend-url.onrender.com/api
```

## 🔄 自动部署

Render会自动监控您的GitHub仓库：
- 当您推送代码到main分支时，会自动触发重新部署
- 可以在Render控制台查看部署日志
- 支持分支预览功能

## 📊 监控和日志

### 查看日志
- 在Render控制台中，点击服务名称
- 进入 "Logs" 标签页查看实时日志
- 可以下载日志文件进行详细分析

### 监控资源使用
- 在 "Metrics" 标签页查看CPU、内存使用情况
- 监控响应时间和错误率

## 🛠️ 故障排除

### 常见问题

1. **后端连接失败**
   - 检查CORS配置是否正确
   - 确认环境变量设置正确
   - 查看后端部署日志

2. **文件上传失败**
   - Render的免费计划有存储限制
   - 考虑使用外部存储服务（如AWS S3）

3. **部署超时**
   - 检查构建日志
   - 可能需要优化依赖安装过程

### 性能优化

1. **后端优化**
   - 启用文件压缩
   - 设置适当的缓存策略
   - 优化数据库查询

2. **前端优化**
   - 启用代码分割
   - 压缩图片资源
   - 使用CDN加速

## 💰 成本考虑

### 免费计划限制
- 每月750小时免费运行时间
- 服务不活跃15分钟后会自动休眠
- 有存储和带宽限制

### 升级建议
- 如果需要24/7运行，考虑升级到付费计划
- 对于生产环境，建议使用付费计划以获得更好的性能

## 🔒 安全建议

1. **环境变量安全**
   - 不要在代码中硬编码敏感信息
   - 定期更新API密钥

2. **HTTPS强制**
   - Render默认提供HTTPS
   - 确保所有API调用使用HTTPS

3. **CORS配置**
   - 仅允许可信域名
   - 不要使用通配符在生产环境

## 📞 支持

如果遇到问题：
1. 查看Render官方文档
2. 检查部署日志
3. 在GitHub仓库中提Issue
4. 联系Render支持团队

---

🎉 恭喜！您的AI Stylist应用现在已经成功部署到Render平台！ 