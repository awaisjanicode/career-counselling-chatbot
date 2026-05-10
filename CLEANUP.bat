@echo off
echo ==========================================
echo   CAREER CHATBOT CLEANUP SCRIPT
echo ==========================================
echo.
echo This script will remove redundant and irrelevant folders:
echo - scratch
echo - cv-analyzer-ai (Redundant after integration)
echo - All backup/copy files
echo.
pause

echo Skipping active venv deletion...

echo Deleting scratch folder...
rmdir /s /q scratch

echo Deleting copy files...
del /s /q *-Copy.env
del /s /q "*.env - Copy.example"

echo.
echo ==========================================
echo   CLEANUP COMPLETE!
echo ==========================================
pause
