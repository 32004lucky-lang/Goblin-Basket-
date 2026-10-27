@echo off
echo ============================================
echo   Starting Goblin Basket - All Services
echo ============================================
echo.
echo  Frontend:    http://localhost:5173
echo  Auth:        http://localhost:5000
echo  Restaurant:  http://localhost:5001
echo  Utils:       http://localhost:5002
echo  Realtime:    http://localhost:5004
echo  Rider:       http://localhost:5005
echo  Admin:       http://localhost:5006
echo.
echo ============================================
echo  Open http://localhost:5173 in your browser
echo ============================================
echo.

cd /d "%~dp0"
npm run dev:all
