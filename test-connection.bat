@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul
title Network Diagnostic
echo ============================================
echo 🔍 Network Connection Diagnostic
echo ============================================
echo.

:: Get IP
echo [1] Getting WiFi IP...
set IP=
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /C:"IPv4"') do (
    set TEMP_IP=%%a
    set TEMP_IP=!TEMP_IP: =!
    echo !TEMP_IP! | findstr /R "^10\." >nul && set IP=!TEMP_IP! && goto :found
    echo !TEMP_IP! | findstr /R "^192\.168\." >nul && set IP=!TEMP_IP! && goto :found
)
:found
if "%IP%"=="" (
    echo ❌ No WiFi IP found
    goto :end
)
echo ✅ WiFi IP: %IP%
echo.

:: Check backend port
echo [2] Checking backend port 4000...
netstat -ano | findstr :4000 | findstr LISTENING >nul
if %errorlevel% equ 0 (
    echo ✅ Backend is running on port 4000
) else (
    echo ❌ Backend NOT running on port 4000
    echo    Run start.bat to start backend
)
echo.

:: Check firewall
echo [3] Checking firewall rule...
netsh advfirewall firewall show rule name="Node.js Backend Port 4000" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Firewall rule exists
) else (
    echo ❌ Firewall rule NOT found
    echo    Run enable-mobile-access.bat as Admin
)
echo.

:: Check API config
echo [4] Checking mobile API configuration...
findstr /C:"YOUR_COMPUTER_IP" mobile\constants\api.ts
echo.

:: Test connection
echo [5] Testing backend connection...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://%IP%:4000/goodthoughts' -Method GET -TimeoutSec 5; Write-Host '✅ Connection successful!' -ForegroundColor Green; Write-Host '   Response:' $response.Content } catch { Write-Host '❌ Connection failed!' -ForegroundColor Red; Write-Host '   Error:' $_.Exception.Message }"
echo.

:end
echo ============================================
echo.
echo 📝 Summary:
echo    Backend URL: http://%IP%:4000
echo    Test URL:    http://%IP%:4000/goodthoughts
echo.
echo 💡 If connection failed:
echo    1. Make sure backend is running (start.bat)
echo    2. Run enable-mobile-access.bat as Admin
echo    3. Check mobile and PC on same WiFi
echo.
pause
