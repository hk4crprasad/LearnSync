@echo off
REM LearnSync Startup Script for Windows

echo Starting LearnSync...

REM Check if virtual environment exists
if not exist "venv\" (
    echo Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Install/upgrade dependencies
echo Installing dependencies...
pip install -r requirements.txt

REM Check if .env exists
if not exist ".env" (
    echo .env file not found. Copying from .env.example...
    copy .env.example .env
    echo Please edit .env with your configuration before running the server.
    pause
    exit /b 1
)

REM Run the application
echo Starting FastAPI server...
python main.py
