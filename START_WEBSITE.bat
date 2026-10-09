@echo off
title ElevenLabs Narration Studio - VoiceCraft
color 0B
echo =======================================================
echo    🎙️  ElevenLabs AI Narration Studio (VoiceCraft)
echo =======================================================
echo.
echo Starting the web server and backend...
echo.

cd /d "%~dp0"

:: Start the server and launch browser
start "" "http://localhost:5000"
node server/server.js

pause
