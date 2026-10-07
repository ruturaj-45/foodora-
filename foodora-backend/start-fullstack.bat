@echo off
echo ==============================================
echo   Foodora Fullstack Server (Express + MySQL + Frontend)
echo ==============================================
cd /d "%~dp0foodora-backend\foodora-backend"
node dist/server.js
pause
