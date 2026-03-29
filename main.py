import os
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import google.generativeai as genai
from dotenv import load_dotenv

# API key load from .env file
load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

app = Flask(__name__, template_folder='templates')
CORS(app)

# 1. Functions for the main route (404 not found solution in browser)
@app.route('/', methods=['GET'])
def home():
    return render_template('index.html')

# 3. Health check root (To check if the server is OK to render)
@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "online", "developer": "Md Liton Hosain"})

# 3. The main function of an AI agent
@app.route('/agent', methods=['POST'])
def ai_agent():
    # Retrieving data from a request
    data = request.get_json()

    # Checking input
    if not data or 'text' not in data:
        return jsonify({
            "status": "error",
            "message": "Please provide 'text' in the request body"
        }), 400

    user_input = data['text']

    try:
        # Gemini model setup
        model = genai.GenerativeModel('models/gemini-2.5-flash')

        system_prompt = (
            "You are a versatile AI Agent. Based on the user's input, perform the appropriate task: "
            "1. If the user asks for a summary, provide a 2-3 sentence summary. "
            "2. If the user asks a question, answer it concisely. "
            "3. If the user provides a statement, classify its sentiment or intent. "
            "4. For general requests, provide a relevant response. "
            "Keep the response helpful and professional."
        )

        # Adding system prompts to user input
        full_prompt = f"{system_prompt}\n\nUser Input: {user_input}"

        response = model.generate_content(full_prompt)

        # Sending succes response
        return jsonify({
            "status": "success",
            "agent_response": response.text,
            "original_text_length": len(user_input)
        })

    except Exception as e:
        # If there is any problem send a message
        return jsonify({
            "status": "server_error",
            "error": str(e)
        }), 500

if __name__ == '__main__':
    # Run the server (Port 8080)
    print("Starting Gemini Agent Server on port 8080...")
    app.run(host='0.0.0.0', port=8080, debug=True)
