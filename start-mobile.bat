@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul
title WellBot - Mobile Only
echo ============================================
echo 🧠 WellBot - Mobile Mode
echo ============================================
echo.

:: Get WiFi IP
echo Finding WiFi IP...
set IP=
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /C:"IPv4"') do (
    set TEMP_IP=%%a
    set TEMP_IP=!TEMP_IP: =!
    echo !TEMP_IP! | findstr /R "^10\." >nul && set IP=!TEMP_IP! && goto :found
    echo !TEMP_IP! | findstr /R "^192\.168\." >nul && set IP=!TEMP_IP! && goto :found
)
:found
if "%IP%"=="" (
    echo ❌ WiFi IP not found!
    pause
    exit /b 1
)
echo ✅ WiFi IP: %IP%
echo.

:: Kill old processes
echo Cleaning old processes...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :4000') do taskkill /F /PID %%a >nul 2>&1
echo.

:: Update API config with trimmed IP
echo Updating API configuration...
powershell -Command "$ip='%IP%'.Trim(); (Get-Content mobile\constants\api.ts) -replace 'const YOUR_COMPUTER_IP = ''.*'';', \"const YOUR_COMPUTER_IP = '$ip';\" | Set-Content mobile\constants\api.ts"
echo ✅ API: http://%IP%:4000
echo.

:: Start Backend
echo Starting Backend...
start "Backend" cmd /k "cd /d %~dp0Backend && node index.js"
timeout /t 3 /nobreak >nul

:: Start Mobile
echo Starting Mobile App...
start "Mobile" cmd /k "cd /d %~dp0mobile && npm start"

echo.
echo ✅ Started!
echo 📡 Backend: http://%IP%:4000
echo 📱 Mobile:  Scan QR with Expo Go
echo.
echo 💡 Make sure mobile is on same WiFi!
echo 💡 If connection fails, run enable-mobile-access.bat as Admin
pause
