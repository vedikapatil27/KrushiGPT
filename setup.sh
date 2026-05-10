#!/bin/bash

# KrushiGPT Setup Script
# This script sets up the KrushiGPT project on a new machine

echo "🌾 Setting up KrushiGPT - Agricultural Assistant"
echo "=============================================="

# Check if Python 3.11+ is installed
if ! command -v python3.11 &> /dev/null; then
    echo "❌ Python 3.11 is not installed. Please install Python 3.11 or higher."
    exit 1
fi

echo "✅ Python 3.11 found"

# Create virtual environment
echo "📦 Creating virtual environment..."
python3.11 -m venv venv

# Activate virtual environment
echo "🔄 Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
echo "⬆️ Upgrading pip..."
pip install --upgrade pip

# Install requirements
echo "📚 Installing dependencies..."
pip install -r requirements.txt

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p static/uploads
mkdir -p audio

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚙️ Creating .env file template..."
    cat > .env << EOL
# KrushiGPT Environment Variables
# Please replace the placeholder values with your actual API keys

# Google Gemini API Key
# Get your key from: https://aistudio.google.com/app/apikey
GEMINI_API_KEY=your_gemini_api_key_here

# OpenWeatherMap API Key
# Get your key from: https://openweathermap.org/api
WEATHER_API_KEY=your_openweathermap_api_key_here

# Babel Configuration
BABEL_DEFAULT_LOCALE=en
BABEL_SUPPORTED_LOCALES=en,hi,mr,ta,te,gu,kn,bn,ml,pa,ur,or,as
EOL
    echo "⚠️  Please update the .env file with your API keys before running the application."
else
    echo "✅ .env file already exists"
fi

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📋 Next Steps:"
echo "1. Update the .env file with your API keys"
echo "2. Run the application: python3.11 app.py"
echo "3. Open your browser and go to: http://127.0.0.1:5000"
echo ""
echo "📖 For more information, see README.md"
