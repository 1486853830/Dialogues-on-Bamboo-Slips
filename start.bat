@echo off
title 青简问对启动器
color 0B

REM 进入项目目录
cd /d "%~dp0"

REM 启动Node.js后端服务
start "API_Server" cmd /c "node server.js && pause"

REM 等待3秒确保后端就绪
timeout /t 3 /nobreak >nul

REM 启动前端页面（默认浏览器打开）
start http://localhost:3000

REM 如果使用Vite前端服务则取消下面两行注释
REM start "Frontend_Server" cmd /c "npm run dev"
REM start http://localhost:5173

echo finished
pause >nul
