@echo off
setlocal
echo ============================================
echo   AI Career Counseling Chatbot - Setup
echo   FYP - AWKUM Computer Science
echo ============================================
echo.

REM Step 1: Create virtualenv
echo [1/4] Creating Python virtual environment...
cd backend
python -m venv venv2
call venv2\Scripts\activate

REM Step 2: Install packages
echo [2/4] Installing Python packages...
python -m pip install --upgrade pip
pip install -r requirements.txt

REM Step 3: Copy .env
echo [3/4] Setting up .env file...
if not exist .env (
    copy .env.example .env
    echo.
    echo IMPORTANT: Please edit backend\.env and add your GOOGLE_API_KEY.
    echo.
)

REM Step 4: Frontend Install
echo [4/4] Installing Frontend dependencies...
cd ..\frontend
call npm install

echo.
echo ============================================
echo   Setup Complete!
echo.
echo   1. Make sure PostgreSQL is running.
echo   2. Ensure backend\.env has your API key.
echo   3. Run 'RUN_ALL.bat' to start the app.
echo ============================================
pause
