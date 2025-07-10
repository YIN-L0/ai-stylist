# ⚡ 快速部署到 Render

## 🎯 5分钟快速部署

### 步骤1：准备代码
```bash
# 确保代码已推送到GitHub
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

### 步骤2：部署后端
1. 打开 [render.com](https://render.com)
2. 点击 "New" → "Web Service"
3. 连接GitHub仓库
4. 设置：
   - **Root Directory**: `backend-express`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. 添加环境变量：
   ```
   NODE_ENV=production
   BASE_URL=https://你的后端域名.onrender.com
   FRONTEND_URL=https://你的前端域名.onrender.com
   ```

### 步骤3：部署前端
1. 点击 "New" → "Static Site"
2. 选择同一仓库
3. 设置：
   - **Root Directory**: `my-react-app`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `build`
4. 添加环境变量：
   ```
   REACT_APP_API_BASE_URL=https://你的后端域名.onrender.com/api
   ```

### 步骤4：更新后端CORS
回到后端服务，更新 `FRONTEND_URL` 环境变量为实际的前端域名。

## ✅ 完成！
- 后端URL: `https://你的后端域名.onrender.com`
- 前端URL: `https://你的前端域名.onrender.com`
- 健康检查: `https://你的后端域名.onrender.com/api/health`

## 🔧 环境变量模板

**后端环境变量**：
```
NODE_ENV=production
BASE_URL=https://ai-stylist-backend-xxxx.onrender.com
FRONTEND_URL=https://ai-stylist-frontend-xxxx.onrender.com
```

**前端环境变量**：
```
REACT_APP_API_BASE_URL=https://ai-stylist-backend-xxxx.onrender.com/api
```

> 💡 提示：用您的实际Render域名替换上述URL中的 `xxxx` 部分。 