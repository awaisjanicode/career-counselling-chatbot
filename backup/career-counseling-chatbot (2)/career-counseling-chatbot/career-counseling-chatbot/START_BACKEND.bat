@echo off
echo Starting AI Career Counseling Chatbot Backend...
cd backend
call venv2\Scripts\activate
uvicorn app.main:app --reload --port 8000
pause

