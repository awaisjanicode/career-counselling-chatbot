@echo off
echo ==========================================
echo   LAUNCHING CAREER COUNSELING CHATBOT
echo ==========================================

start "Chatbot Backend" cmd /k "cd backend && call .\venv2\Scripts\activate && uvicorn app.main:app --reload --port 8000"

echo Backend starting... waiting 5 seconds...
timeout /t 5 /nobreak > nul

start "Chatbot Frontend" cmd /k "cd frontend && npm start"

echo.
echo ==========================================
echo   DONE! Services are starting in separate
echo   windows. Close them to stop the app.
echo ==========================================
pause

