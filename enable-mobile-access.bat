@echo off
echo ============================================
echo Enable Mobile Access to Backend Server
echo ============================================
echo.
echo This will add a Windows Firewall rule to allow
echo mobile devices to connect to port 4000
echo.
echo Please run this file as Administrator!
echo.
pause

netsh advfirewall firewall delete rule name="Node.js Backend Port 4000" >nul 2>&1
netsh advfirewall firewall add rule name="Node.js Backend Port 4000" dir=in action=allow protocol=TCP localport=4000

if %errorlevel% equ 0 (
    echo.
    echo ✓ Firewall rule added successfully!
    echo ✓ Mobile devices can now connect to: http://10.210.106.133:4000
    echo.
) else (
    echo.
    echo ✗ Failed to add firewall rule
    echo Please run this batch file as Administrator
    echo.
)

pause
