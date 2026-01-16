@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul
title WellBot - Mobile Mental Health Chatbot
echo ============================================
echo 🧠 WellBot - Mobile App
echo ============================================
echo.

:: Get WiFi IP address
echo [1/4] 🔍 Finding your WiFi IP address...
set IP=
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /C:"IPv4"') do (
    set TEMP_IP=%%a
    set TEMP_IP=!TEMP_IP: =!
    echo !TEMP_IP! | findstr /R "^10\." >nul && set IP=!TEMP_IP! && goto :found
    echo !TEMP_IP! | findstr /R "^192\.168\." >nul && set IP=!TEMP_IP! && goto :found
    echo !TEMP_IP! | findstr /R "^172\." >nul && set IP=!TEMP_IP! && goto :found
)
:found
if "%IP%"=="" (
    echo ❌ Could not find WiFi IP address!
    echo Please connect to WiFi and try again.
    pause
    exit /b 1
)
echo     ✅ WiFi IP: %IP%
echo.

:: Kill old processes on port 4000
echo [2/4] 🔄 Cleaning up old processes...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :4000') do (
    echo     Killing backend process (PID: %%a)
    taskkill /F /PID %%a >nul 2>&1
)
echo     ✅ Old processes cleaned
echo.

:: Auto-update mobile API configuration
echo [3/4] 📝 Updating mobile API configuration...
powershell -Command "$ip='%IP%'.Trim(); (Get-Content mobile\constants\api.ts) -replace 'const YOUR_COMPUTER_IP = ''.*'';', \"const YOUR_COMPUTER_IP = '$ip';\" | Set-Content mobile\constants\api.ts"
echo     ✅ API config updated to: %IP%
echo.

:: Start Backend Server
echo [4/4] 🚀 Starting servers...
start "WellBot Backend" cmd /k "cd /d %~dp0Backend && echo ============================================ && echo 🟢 Backend Server Running && echo ============================================ && echo API URL: http://%IP%:4000 && echo Database: healthbot (MySQL) && echo ============================================ && echo. && node index.js"
timeout /t 3 /nobreak >nul
echo     ✅ Backend started at http://%IP%:4000

:: Start Mobile App
echo     ✅ Starting Mobile App...
start "WellBot Mobile" cmd /k "cd /d %~dp0mobile && echo ============================================ && echo 🟢 Mobile App Running && echo ============================================ && echo Backend URL: http://%IP%:4000 && echo Scan QR code with Expo Go app && echo ============================================ && echo. && npm start"

echo.
echo ============================================
echo ✅ WellBot Started Successfully!
echo ============================================
echo.
echo 📡 Backend API:   http://%IP%:4000
echo 📱 Mobile App:    Scan QR in Expo Go
echo.
echo 💡 Tips:
echo    - Make sure MySQL is running
echo    - Mobile and PC must be on same WiFi
echo    - For firewall: Run enable-mobile-access.bat as Admin
echo.
echo Press any key to exit launcher...
pause >nul
