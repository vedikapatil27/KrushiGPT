from flask import Flask, request, jsonify, render_template, send_file
from flask_cors import CORS
from flask_babel import Babel, get_locale
import google.generativeai as genai
import requests
import mimetypes
import os
import uuid
from gtts import gTTS
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
CORS(app)

# Config from .env
app.config['BABEL_DEFAULT_LOCALE'] = os.getenv('BABEL_DEFAULT_LOCALE', 'en')
app.config['BABEL_SUPPORTED_LOCALES'] = os.getenv('BABEL_SUPPORTED_LOCALES', 'en').split(',')

# Configure Gemini API
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("models/gemini-1.5-flash-latest")
print(os.getenv("GEMINI_API_KEY"))

# Weather API
WEATHER_API_KEY = os.getenv("WEATHER_API_KEY")

# Folders
UPLOAD_FOLDER = os.path.join("static", "uploads")
AUDIO_FOLDER = 'audio'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(AUDIO_FOLDER, exist_ok=True)

babel = Babel(app)

@app.context_processor
def inject_locale():
    return dict(get_locale=get_locale)

@app.route('/')
def home():
    return render_template('home.html')

@app.route('/index')
def index():
    return render_template('index.html')

chat_history = []

@app.route("/chat", methods=["POST"])
def chat():
    try:
        data = request.json
        user_message = data.get("message", "")
        selected_lang = data.get("language", "en")
        image_filename = data.get("imageFilename")
        chat_history = data.get("history", [])

        chat_context = ""
        for entry in chat_history[-5:]:
            chat_context += f"User: {entry['user']}\nBot: {entry['bot']}\n"

        instruction = (
            "You are a warm, friendly, and intelligent agriculture assistant named KrushiGPT. "
            "Your main job is to answer agriculture-related questions about crops, soil, weather, fertilizers, pests, irrigation, and farming techniques. "
            "If the user engages in small talk, respond in a friendly way before gently guiding the conversation back to agriculture. "
            "If the question is unrelated to agriculture, respond politely and shift the topic back to farming.\n\n"
            f"Respond in this language: {selected_lang}.\n\n"
            f"Previous conversation:\n{chat_context}\n"
            f"User: {user_message}\nBot:"
        )

        if image_filename:
            instruction += (
                f"\n\nAlso consider the uploaded image located at: {image_filename}. "
                "Provide answers based on both the text and image content."
            )

        response = model.generate_content(instruction)
        gemini_reply = response.text.strip() if hasattr(response, "text") else "Sorry, I couldn't generate a response."

        chat_history.append({
            "user": user_message,
            "bot": gemini_reply
        })

        return jsonify({
            "reply": gemini_reply,
            "history": chat_history[-10:]
        })

    except Exception as e:
        print("❌ Error in /chat route:", e)
        return jsonify({
            "reply": "Something went wrong. Please try again.",
            "history": chat_history[-10:]
        })

@app.route("/upload", methods=["POST"])
def upload():
    try:
        if "image" not in request.files:
            return jsonify({"message": "No image found!"})

        image = request.files["image"]
        if image.filename == "":
            return jsonify({"message": "Image not selected."})

        filename = f"{uuid.uuid4().hex}_{image.filename}"
        image_path = os.path.join(UPLOAD_FOLDER, filename)
        image.save(image_path)

        return jsonify({
            "message": "Image uploaded successfully.",
            "filename": filename,
            "url": f"/static/uploads/{filename}"
        })

    except Exception as e:
        print("Upload error:", e)
        return jsonify({"message": "Failed to upload the image."})

@app.route("/image-processing", methods=["POST"])
def image_processing():
    try:
        data = request.json
        filename = data.get("filename")
        user_message = data.get("message", "").strip()
        selected_lang = data.get("language", "en")

        if not filename or not user_message:
            return jsonify({"message": "Missing filename or question."})

        image_path = os.path.join(UPLOAD_FOLDER, filename)
        if not os.path.exists(image_path):
            return jsonify({"message": "Image not found on server."})

        with open(image_path, "rb") as img_file:
            image_data = img_file.read()
            mime_type = mimetypes.guess_type(image_path)[0] or "image/jpeg"

            instruction = (
                "You are a smart, friendly agriculture assistant. "
                "Analyze the uploaded image in the context of the user's question. "
                "Give a helpful and accurate answer related to agriculture.\n\n"
                f"Respond in this language: {selected_lang}.\n\n"
                f"User's Question: {user_message}\n\nBased on the image and message, your reply:"
            )

            response = model.generate_content([
                instruction,
                {
                    "mime_type": mime_type,
                    "data": image_data
                }
            ])

        reply = response.text.strip() if hasattr(response, "text") else "Image received but analysis failed."
        related = "not related" not in reply.lower()

        return jsonify({
            "message": reply,
            "related": related
        })

    except Exception as e:
        return jsonify({"message": "Failed to analyze the image."})

@app.route("/delete-upload", methods=["POST"])
def delete_upload():
    try:
        filename = request.json.get("filename")
        if not filename:
            return jsonify({"message": "Filename not provided."}), 400

        file_path = os.path.join(UPLOAD_FOLDER, filename)
        if os.path.exists(file_path):
            os.remove(file_path)
            return jsonify({"message": "File deleted successfully."})
        else:
            return jsonify({"message": "File not found."}), 404
    except Exception as e:
        return jsonify({"message": "Failed to delete the file.", "error": str(e)}), 500

@app.route("/delete-all-uploads", methods=["POST"])
def delete_all_uploads():
    try:
        for folder in [UPLOAD_FOLDER, AUDIO_FOLDER]:
            for filename in os.listdir(folder):
                file_path = os.path.join(folder, filename)
                if os.path.isfile(file_path):
                    os.remove(file_path)
        return jsonify({"message": "All uploads deleted successfully."})
    except Exception as e:
        return jsonify({"message": "Failed to delete uploads.", "error": str(e)}), 500

@app.route("/weather")
def weather():
    city = request.args.get("city", "")
    lang = request.args.get("lang", "en")

    if not city:
        return jsonify({"error": "City not provided"})

    url = f"http://api.openweathermap.org/data/2.5/weather?q={city}&appid={WEATHER_API_KEY}&units=metric&lang={lang}"

    try:
        res = requests.get(url).json()

        if res.get("cod") != 200:
            return jsonify({"error": res.get("message", "Invalid city or API issue")})

        location_name = res.get("name", city)
        weather_desc = res["weather"][0]["description"]
        temperature = res["main"]["temp"]
        humidity = res["main"]["humidity"]
        wind_speed = res["wind"]["speed"]

        return jsonify({
            "location": location_name,
            "description": weather_desc,
            "temperature": temperature,
            "humidity": humidity,
            "wind_speed": wind_speed
        })

    except Exception as e:
        print("❌ Weather error:", e)
        return jsonify({"error": "Failed to fetch weather info"})

@app.route('/text-to-speech', methods=['POST'])
def text_to_speech():
    data = request.json
    text = data.get('text')
    lang = data.get('lang', 'en')

    if not text:
        return {'error': 'No text provided'}, 400

    filename = os.path.join(AUDIO_FOLDER, f"tts_{uuid.uuid4().hex}.mp3")
    tts = gTTS(text=text, lang=lang)
    tts.save(filename)

    response = send_file(filename, mimetype='audio/mpeg')

    @response.call_on_close
    def cleanup():
        if os.path.exists(filename):
            os.remove(filename)

    return response

if __name__ == "__main__":
    app.run(debug=True)
