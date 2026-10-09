@echo off
title Beta AI Narration Studio - Live
color 0B
echo =======================================================
echo    🎙️  Beta AI — Neural Narration Studio
echo =======================================================
echo.
echo Launching fullstack application (Backend: 5000, Frontend: 5173)...
echo.

cd /d "%~dp0"

:: Start the browser to frontend
timeout /t 3 /nobreak >nul
start "" "http://localhost:5173"

npm run live

pause
