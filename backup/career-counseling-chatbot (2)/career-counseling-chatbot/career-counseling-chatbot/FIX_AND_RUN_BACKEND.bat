@echo off
echo ==========================================
echo   FIXING BACKEND ENVIRONMENT
echo ==========================================
cd backend

echo [1/4] Removing broken venv2...
if exist venv2 (
    rmdir /s /q venv2
)

echo [2/4] Creating new virtual environment...
python -m venv venv2

echo [3/4] Installing dependencies (this may take a minute)...
call venv2\Scripts\activate
pip install -r requirements.txt

echo [4/4] Starting Backend...
uvicorn app.main:app --reload --port 8000
pause
