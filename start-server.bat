@echo off
chcp 65001 >nul
title 科学家与行业匠人精神展示平台

echo.
echo ╔═══════════════════════════════════════════════════╗
echo ║                                                   ║
echo ║     科学家与行业匠人精神展示平台                  ║
echo ║                                                   ║
echo ╚═══════════════════════════════════════════════════╝
echo.
echo 正在启动本地服务器...
echo.
echo 服务器地址: http://localhost:8000
echo.
echo 浏览器将自动打开，如未打开请手动访问上述地址
echo.
echo 按 Ctrl+C 可停止服务器
echo.
echo ════════════════════════════════════════════════════
echo.

timeout /t 2 /nobreak >nul

start http://localhost:8000

python -m http.server 8000

pause
