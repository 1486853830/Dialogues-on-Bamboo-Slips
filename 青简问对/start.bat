@echo off
title 青简问对启动器
color 0B

REM 进入项目目录
cd /d "%~dp0"

REM 启动Node.js后端服务
start "API_Server" cmd /c "node server.js && pause"

REM 等待3秒确保后端就绪
timeout /t 3 /nobreak >nul

REM 启动本地主页面
start "" "index.html"

echo 启动完成！按任意键退出...
pause >nul
