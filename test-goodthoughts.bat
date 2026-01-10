@echo off
echo ========================================
echo Testing Backend API - Good Thoughts
echo ========================================
echo.

echo Testing goodthoughts endpoint...
curl -s http://localhost:4000/goodthoughts
echo.
echo.

echo ========================================
echo If you see a quote above, API is working!
echo If you see an error, make sure:
echo   1. Backend is running (npm start in Backend folder)
echo   2. MySQL database is running
echo ========================================
pause
