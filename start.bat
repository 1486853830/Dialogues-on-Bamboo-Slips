@echo off
title Dialogues-on-Bamboo-Slips
color 0B

REM 先切到项目目录，免得一会儿找不到文件
cd /d "%~dp0"

REM 检查Node.js在不在，不在就报错
if not exist ".\node\node-v20.14.0-win-x64\node.exe" (
    echo error: Node.js executable not found.
    pause
    exit /b 1
)

REM 开后端服务，开个新窗口跑node，关了窗口服务就停了
start "API_Server" cmd /c ".\node\node-v20.14.0-win-x64\node.exe server.js && pause"

REM 等3秒，给后端点时间启动，太快前端连不上
timeout /t 3 /nobreak >nul

REM 自动打开前端页面，默认浏览器直接弹出来
start http://localhost:3000

REM 如果你用Vite开发前端，把下面两行注释去掉就行
REM start "Frontend_Server" cmd /c "npm run dev"
REM start http://localhost:5173

echo finished
pause >nul
