@echo off
echo Starting Wardrobe API Backend...
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo Python is not installed or not in PATH
    echo Please install Python 3.8+ and try again
    pause
    exit /b 1
)

REM Install dependencies if requirements.txt exists
if exist requirements.txt (
    echo Installing dependencies...
    pip install -r requirements.txt
    if errorlevel 1 (
        echo Failed to install dependencies
        pause
        exit /b 1
    )
    echo.
)

REM Set the Gemini API key
set GEMINI_API_KEY=AIzaSyAlcWWC-kNx2JJ4JsE78m_ri_MwB-5ltj8

echo Starting Flask server on http://localhost:5000
echo Press Ctrl+C to stop the server
echo.
python run.py

pause

