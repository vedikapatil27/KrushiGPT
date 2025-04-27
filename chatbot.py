from flask import Flask, request, jsonify, render_template , send_file
from flask_cors import CORS
import google.generativeai as genai
import requests
import mimetypes  # Add this at the top if not already
import os
import uuid
from gtts import gTTS
from flask_babel import Babel, _
from flask_babel import get_locale

app = Flask(__name__)
CORS(app)

app.config['BABEL_DEFAULT_LOCALE'] = 'en'
app.config['BABEL_SUPPORTED_LOCALES'] = ['en', 'hi', 'mr', 'gu', 'ta', 'te', 'bn', 'pa']

# 🔑 Gemini API key
genai.configure(api_key="AIzaSyCfO9vuvYMRO4dNDsQ45WN25wTNVKM_Org")

# 📌 Use Gemini 1.5 Pro for both text and image
model = genai.GenerativeModel("models/gemini-1.5-pro")

# 🌐 Weather API (OpenWeatherMap)
WEATHER_API_KEY = "a23b5e425e7b8153999b8b2369bf64c5"

# 📁 Image Uploads
UPLOAD_FOLDER = os.path.join("static", "uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

AUDIO_FOLDER = 'audio'
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

# @babel.localeselector
# def get_locale():
#     return request.args.get('lang') or 'en' 


@app.route("/chat", methods=["POST"])
def chat():
    try:
        data = request.json
        user_message = data.get("message", "")
        selected_lang = data.get("language", "en")
        image_filename = data.get("imageFilename")
        chat_history = data.get("history", [])  # Get chat history from the request

        # Include the last 5 messages for context
        chat_context = ""
        for entry in chat_history[-5:]:  # last 5 messages to maintain relevance
            chat_context += f"User: {entry['user']}\nBot: {entry['bot']}\n"

        # Gemini instruction with context
        instruction = (
            "You are a warm, friendly, and intelligent agriculture assistant named KrushiGPT. "
            "Your main job is to answer agriculture-related questions about crops, soil, weather, fertilizers, pests, irrigation, and farming techniques. "
            "If the user engages in small talk (like greetings, casual questions, or compliments), feel free to respond in a friendly way before gently guiding the conversation back to agriculture. "
            "If the question is completely unrelated to agriculture, respond politely and subtly shift the topic back to farming without rejecting the user or sounding robotic.\n\n"
            f"Respond in a helpful, conversational tone using this language: {selected_lang}.\n\n"
            f"Previous conversation:\n{chat_context}\n"
            f"User: {user_message}\nBot:"
        )

        if image_filename:
            instruction += (
                f"\n\nAlso consider the uploaded image located at: {image_filename}. "
                "Provide answers based on both the text and image content."
            )

        # Generate response from model
        response = model.generate_content(instruction)
        gemini_reply = response.text.strip() if hasattr(response, "text") else "Sorry, I couldn't generate a response."

        # Store to chat history
        chat_history.append({
            "user": user_message,
            "bot": gemini_reply
        })

        return jsonify({
            "reply": gemini_reply,
            "history": chat_history[-10:]  # Return the last 10 chat entries
        })

    except Exception as e:
        print("❌ Error in /chat route:", e)
        return jsonify({
            "reply": "Something went wrong. Please try again.",
            "history": chat_history[-10:]  # Return the last 10 chat entries
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
                "Give a helpful and accurate answer related to agriculture (e.g. crops, soil, pests, diseases, etc). "
                "If the image is not related to agriculture at all, gently inform the user.\n\n"
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

# @app.route("/upload", methods=["POST"])
# def upload():
#     try:
#         # Check if the image is in the request
#         if "image" not in request.files:
#             return jsonify({"message": "No image found!"})

#         image = request.files["image"]
#         user_message = request.form.get("message", "")  # 👈 user’s input
#         selected_lang = request.form.get("language", "en")

#         # Check if the image has a filename
#         if image.filename == "":
#             return jsonify({"message": "Image not selected."})

#         # Save the image to the upload folder
#         filename = f"{uuid.uuid4().hex}_{image.filename}"
#         image_path = os.path.join(UPLOAD_FOLDER, filename)
#         image.save(image_path)

#         # Process the image
#         with open(image_path, "rb") as img_file:
#             image_data = img_file.read()
#             mime_type = image.mimetype

#             # 🧠 Detailed instruction combining both image + user message
#             instruction = (
#                 "You are a smart, friendly agriculture assistant. "
#                 "Analyze the uploaded image in the context of the user's question. "
#                 "Give a helpful and accurate answer related to agriculture (e.g. crops, soil, pests, diseases, etc). "
#                 "If the image is not related to agriculture at all, gently inform the user.\n\n"
#                 f"Respond in this language: {selected_lang}.\n\n"
#                 f"User's Question: {user_message}\n\nBased on the image and message, your reply:"
#             )

#             response = model.generate_content([
#                 instruction,
#                 {
#                     "mime_type": mime_type,
#                     "data": image_data
#                 }
#             ])

#         reply = response.text.strip() if hasattr(response, "text") else "Image received but analysis failed."
#         related = "not related" not in reply.lower()

#         return jsonify({
#             "message": reply,
#             "filename": filename if related else None,
#             "related": related
#         })

#     except Exception as e:
#         return jsonify({"message": "Failed to analyze the image."})

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
        for filename in os.listdir(UPLOAD_FOLDER):
            file_path = os.path.join(UPLOAD_FOLDER, filename)
            if os.path.isfile(file_path):
                os.remove(file_path)
                
        for filename in os.listdir(AUDIO_FOLDER):
            file_path = os.path.join(AUDIO_FOLDER, filename)
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
    lang = data.get('lang', 'en')  # Default language is English

    if not text:
        return {'error': 'No text provided'}, 400

    # Generate unique filename
    filename = os.path.join(AUDIO_FOLDER, f"tts_{uuid.uuid4().hex}.mp3")
    tts = gTTS(text=text, lang=lang)
    tts.save(filename)

    # Return the mp3 file as a response
    response = send_file(filename, mimetype='audio/mpeg')

    # Clean up after sending
    @response.call_on_close
    def cleanup():
        if os.path.exists(filename):
            os.remove(filename)

    return response


if __name__ == "__main__":
    app.run(debug=True)
