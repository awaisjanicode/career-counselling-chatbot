@echo off
echo Starting AI Career Counseling Chatbot Backend...
cd career-counseling-chatbot\backend
call venv2\Scripts\activate
uvicorn app.main:app --reload
pause
