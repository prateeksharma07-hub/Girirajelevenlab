@echo off
title ElevenLabs Narration Studio - Live Mode
color 0A
echo =======================================================
echo    🎙️  ElevenLabs AI Studio - Live Development Mode
echo =======================================================
echo.
echo Starting backend (Port 5000) and frontend (Port 5173)...
echo.

cd /d "%~dp0"

:: Launch browser after short delay
timeout /t 3 /nobreak >nul
start "" "http://localhost:5173"

npm run live

pause
