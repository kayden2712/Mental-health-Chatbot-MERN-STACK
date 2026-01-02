@echo off
echo Starting Mental Health Chatbot Application...
echo.

:: Start Backend
echo Starting Backend Server...
start "Backend Server" cmd /k "cd Backend && npm start"

:: Wait a moment before starting frontend
timeout /t 3 /nobreak >nul

:: Start Frontend
echo Starting Frontend React App...
start "Frontend React" cmd /k "cd mobile && npm start"

echo.
echo Both servers are starting...
echo Backend: http://localhost:5000 (or your configured port)
echo Frontend: http://localhost:3000
echo.
echo Close the terminal windows to stop the servers.
pause
