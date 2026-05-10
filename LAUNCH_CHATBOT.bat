@echo off
title CareerPath AI - Master Launcher
echo ==========================================
echo   CareerPath AI: Starting Services...
echo ==========================================

:: Kill any existing processes on ports 8000 and 3000
echo [1/3] Cleaning up old sessions...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000') do taskkill /f /pid %%a >nul 2>&1

:: Start Backend
echo [2/3] Starting Backend (Port 8000)...
cd backend
start /min cmd /c "..\backend\venv2\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000"
cd ..

:: Wait for backend to warm up
timeout /t 5 /nobreak >nul

:: Start Frontend
echo [3/3] Starting Frontend (Port 3000)...
cd frontend_simple
start /min cmd /c "python -m http.server 3000"
cd ..

echo.
echo ==========================================
echo   SUCCESS: CareerPath AI is now running!
echo ==========================================
echo   Frontend: http://127.0.0.1:3000
echo   Backend Docs: http://127.0.0.1:8000/docs
echo.
echo Opening browser...
start http://127.0.0.1:3000
echo.
echo Press any key to stop all services and exit.
pause >nul

:: Cleanup on exit
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000') do taskkill /f /pid %%a >nul 2>&1
echo Services stopped.
exit
