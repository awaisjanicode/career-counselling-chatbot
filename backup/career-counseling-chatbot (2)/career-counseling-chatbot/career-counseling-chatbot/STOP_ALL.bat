@echo off
echo ==========================================
echo   STOPPING CAREER COUNSELING CHATBOT
echo ==========================================
echo.

echo Stopping Backend (Python/Uvicorn)...
taskkill /F /IM python.exe /T 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] Backend processes terminated.
) else (
    echo [INFO] No active Python processes found.
)

echo.
echo Stopping Frontend (Node/NPM)...
taskkill /F /IM node.exe /T 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] Frontend processes terminated.
) else (
    echo [INFO] No active Node processes found.
)

echo.
echo Cleaning up any orphaned uvicorn processes on port 8000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000') do taskkill /F /PID %%a 2>nul

echo.
echo ==========================================
echo   ALL ACTIVITY STOPPED
echo ==========================================
pause
