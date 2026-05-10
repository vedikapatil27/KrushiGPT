@echo off
REM KrushiGPT Setup Script for Windows
REM This script sets up the KrushiGPT project on a new Windows machine

echo 🌾 Setting up KrushiGPT - Agricultural Assistant
echo ==============================================

REM Check if Python 3.11+ is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python is not installed. Please install Python 3.11 or higher.
    pause
    exit /b 1
)

echo ✅ Python found

REM Create virtual environment
echo 📦 Creating virtual environment...
python -m venv venv

REM Activate virtual environment
echo 🔄 Activating virtual environment...
call venv\Scripts\activate.bat

REM Upgrade pip
echo ⬆️ Upgrading pip...
python -m pip install --upgrade pip

REM Install requirements
echo 📚 Installing dependencies...
pip install -r requirements.txt

REM Create necessary directories
echo 📁 Creating necessary directories...
if not exist "static\uploads" mkdir static\uploads
if not exist "audio" mkdir audio

REM Check if .env file exists
if not exist ".env" (
    echo ⚙️ Creating .env file template...
    (
        echo # KrushiGPT Environment Variables
        echo # Please replace the placeholder values with your actual API keys
        echo.
        echo # Google Gemini API Key
        echo # Get your key from: https://aistudio.google.com/app/apikey
        echo GEMINI_API_KEY=your_gemini_api_key_here
        echo.
        echo # OpenWeatherMap API Key
        echo # Get your key from: https://openweathermap.org/api
        echo WEATHER_API_KEY=your_openweathermap_api_key_here
        echo.
        echo # Babel Configuration
        echo BABEL_DEFAULT_LOCALE=en
        echo BABEL_SUPPORTED_LOCALES=en,hi,mr,ta,te,gu,kn,bn,ml,pa,ur,or,as
    ) > .env
    echo ⚠️  Please update the .env file with your API keys before running the application.
) else (
    echo ✅ .env file already exists
)

echo.
echo 🎉 Setup completed successfully!
echo.
echo 📋 Next Steps:
echo 1. Update the .env file with your API keys
echo 2. Run the application: python app.py
echo 3. Open your browser and go to: http://127.0.0.1:5000
echo.
echo 📖 For more information, see README.md
pause
