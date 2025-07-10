#!/bin/bash

# AI Stylist 应用启动脚本

echo "🚀 启动 AI 时尚造型师应用..."

# 检查是否安装了依赖
if [ ! -d "backend-express/node_modules" ]; then
    echo "📦 安装后端依赖..."
    cd backend-express && npm install && cd ..
fi

if [ ! -d "my-react-app/node_modules" ]; then
    echo "📦 安装前端依赖..."
    cd my-react-app && npm install && cd ..
fi

echo "🖥️  启动后端服务器 (端口 5001)..."
cd backend-express && npm start &
BACKEND_PID=$!

# 等待后端启动
sleep 3

echo "🌐 启动前端服务器 (端口 3000)..."
cd ../my-react-app && npm start &
FRONTEND_PID=$!

echo "✅ 应用已启动！"
echo "📊 后端 API: http://localhost:5001/api"
echo "🌐 前端应用: http://localhost:3000"
echo ""
echo "按 Ctrl+C 停止所有服务器"

# 设置清理函数
cleanup() {
    echo ""
    echo "🛑 正在停止服务器..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "✅ 所有服务器已停止"
    exit 0
}

# 捕获中断信号
trap cleanup SIGINT SIGTERM

# 等待进程
wait 