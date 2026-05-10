# KrushiGPT - Agricultural Assistant

## Overview
KrushiGPT is an intelligent agricultural assistant powered by Google's Gemini AI. It provides farmers with instant answers to agriculture-related questions, weather information, image analysis for crop diseases, and multilingual support.

## Features

- 🌾 **Agricultural Q&A**: Get answers about crops, soil, fertilizers, pests, and farming techniques
- 🌤️ **Weather Information**: Real-time weather data for any location
- 🖼️ **Image Analysis**: Upload plant/crop images for disease and pest identification
- 🌍 **Multilingual Support**: Available in multiple languages
- 🔊 **Text-to-Speech**: Convert responses to audio
- 💬 **Chat History**: Maintains conversation context

## Technology Stack

- **Backend**: Flask (Python)
- **AI**: Google Gemini API
- **Weather**: OpenWeatherMap API
- **Text-to-Speech**: Google Text-to-Speech (gTTS)
- **Internationalization**: Flask-Babel
- **CORS**: Flask-Cors for cross-origin requests

## Prerequisites

- Python 3.11 or higher
- Google Gemini API key
- OpenWeatherMap API key

## Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd Krushigpt
```

### 2. Create virtual environment
```bash
python3.11 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Install dependencies
```bash
pip install -r requirements.txt
```

### 4. Set up environment variables
Create a `.env` file in the root directory:

```env
GEMINI_API_KEY=your_gemini_api_key_here
WEATHER_API_KEY=your_openweathermap_api_key_here
BABEL_DEFAULT_LOCALE=en
BABEL_SUPPORTED_LOCALES=en,hi,mr,ta,te,gu,kn,bn,ml,pa,ur,or,as
```

### 5. Create necessary directories
```bash
mkdir -p static/uploads
mkdir -p audio
```

## API Keys Setup

### Google Gemini API
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create a new API key
3. Copy the key to your `.env` file

### OpenWeatherMap API
1. Go to [OpenWeatherMap](https://openweathermap.org/api)
2. Sign up and get a free API key
3. Copy the key to your `.env` file

## Running the Application

### Development Mode
```bash
python3.11 app.py
```
The application will start at `http://127.0.0.1:5000`

### Production Mode
```bash
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

## API Endpoints

### Chat Endpoint
- **URL**: `/chat`
- **Method**: POST
- **Body**: 
```json
{
  "message": "Your question here",
  "language": "en",
  "history": []
}
```

### Weather Endpoint
- **URL**: `/weather`
- **Method**: GET
- **Query Parameters**: `city`, `lang`
- **Example**: `/weather?city=mumbai&lang=en`

### Image Upload Endpoint
- **URL**: `/upload`
- **Method**: POST
- **Form Data**: Image file

### Image Analysis Endpoint
- **URL**: `/image-processing`
- **Method**: POST
- **Body**:
```json
{
  "filename": "uploaded_image.jpg",
  "message": "What disease is this?",
  "language": "en"
}
```

### Text-to-Speech Endpoint
- **URL**: `/text-to-speech`
- **Method**: POST
- **Body**:
```json
{
  "text": "Text to convert",
  "lang": "en"
}
```

## Project Structure

```
Krushigpt/
├── app.py                 # Main Flask application
├── requirements.txt       # Python dependencies
├── .env                  # Environment variables (create this)
├── README.md             # This file
├── static/
│   ├── uploads/          # Uploaded images
│   └── css/              # CSS files
├── templates/            # HTML templates
├── audio/                # Generated audio files
└── .venv/               # Virtual environment
```

## Supported Languages

- English (en)
- Hindi (hi)
- Marathi (mr)
- Tamil (ta)
- Telugu (te)
- Gujarati (gu)
- Kannada (kn)
- Bengali (bn)
- Malayalam (ml)
- Punjabi (pa)
- Urdu (ur)
- Odia (or)
- Assamese (as)

## Troubleshooting

### Common Issues

1. **ModuleNotFoundError**: Ensure all dependencies are installed with `pip install -r requirements.txt`
2. **API Key Errors**: Verify your API keys in the `.env` file
3. **Weather API Not Working**: Check OpenWeatherMap API key and city name spelling
4. **Image Upload Issues**: Ensure `static/uploads` directory exists and is writable
5. **Audio Issues**: Ensure `audio` directory exists and is writable

### Port Already in Use
```bash
# Find process using port 5000
lsof -i :5000
# Kill the process
kill -9 <PID>
```

## Deployment

### Heroku Deployment
1. Create a `Procfile`:
```
web: gunicorn -w 4 -b 0.0.0.0:$PORT app:app
```

2. Set environment variables in Heroku dashboard
3. Deploy using Heroku CLI

### Docker Deployment
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5000

CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "app:app"]
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Contact

For support or questions, please create an issue in the repository.

## Acknowledgments

- Google Gemini AI for powering the agricultural assistant
- OpenWeatherMap for weather data
- Flask community for the web framework