@echo off
title ElevenLabs Narration Studio - Development Mode
color 0A
echo =======================================================
echo    🎙️  ElevenLabs AI Studio - Development Mode
echo =======================================================
echo.
echo Starting concurrent development servers (Vite + Node API)...
echo.

cd /d "%~dp0"

:: Launch browser after short delay
timeout /t 3 /nobreak >nul
start "" "http://localhost:3000"

npm run dev

pause
