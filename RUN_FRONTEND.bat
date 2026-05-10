@echo off
echo ==========================================
echo   SETTING UP FRONTEND
echo ==========================================
cd frontend

echo [1/2] Installing npm packages...
call npm install

echo [2/2] Starting Frontend...
npm start
pause
