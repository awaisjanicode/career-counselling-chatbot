@echo off
echo ==========================================
echo   MASTER RESTRUCTURE & CLEANUP
echo ==========================================
echo.
echo This script will:
echo 1. Move all project files to the root directory.
echo 2. Remove redundant folders (venv2, scratch, etc.)
echo 3. Delete all backup/copy files.
echo.
echo [IMPORTANT] Close all code editors and terminals before continuing.
echo.
pause

:: Move all contents to the root (two levels up)
echo Moving files...
xcopy /E /I /Y /H /K * "..\..\"

:: Change directory to the root
cd /d "..\.."

:: Remove the redundant folders
echo Cleaning up...
rmdir /s /q "career-counseling-chatbot"
rmdir /s /q "venv2"
rmdir /s /q "backend\venv2"
rmdir /s /q "scratch"

:: Remove backup files
del /s /q "*-Copy.env"
del /s /q "*.env - Copy.example"

echo.
echo ==========================================
echo   RESTRUCTURE COMPLETE!
echo   Your project is now clean and flat.
echo ==========================================
pause
