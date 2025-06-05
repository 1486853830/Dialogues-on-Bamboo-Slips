@echo off
title Dialogues-on-Bamboo-Slips
color 0B

REM 进入项目目录
cd /d "%~dp0"

REM 验证Node.js可执行文件存在
if not exist ".\node\node-v20.14.0-win-x64\node.exe" (
    echo error: Node.js executable not found.
    pause
    exit /b 1
)

REM 启动Node.js后端服务
start "API_Server" cmd /c ".\node\node-v20.14.0-win-x64\node.exe server.js && pause"

REM 等待3秒确保后端就绪
timeout /t 3 /nobreak >nul

REM 启动前端页面（默认浏览器打开）
start http://localhost:3000

REM 如果使用Vite前端服务则取消下面两行注释
REM start "Frontend_Server" cmd /c "npm run dev"
REM start http://localhost:5173

echo finished
pause >nul
