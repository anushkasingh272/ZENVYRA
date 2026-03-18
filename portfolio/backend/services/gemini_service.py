import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

# Configure Gemini on import - uses whatever key is in env
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
print(f"[Gemini] API Key Loaded: {GEMINI_API_KEY is not None} | Key prefix: {GEMINI_API_KEY[:8] if GEMINI_API_KEY else 'MISSING'}...")

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

# Initialize model once at module level for reuse
_model = None

# Use gemini-2.5-flash — confirmed available and working (verified via live test)
GEMINI_MODEL = "gemini-2.5-flash"

def get_model():
    global _model
    if _model is None:
        _model = genai.GenerativeModel(GEMINI_MODEL)
    return _model

def generate_response(prompt: str) -> str:
    """
    Calls the real Gemini API. No mock fallbacks.
    If the API key is missing or invalid, returns a descriptive error.
    """
    if not GEMINI_API_KEY:
        print("[Gemini] ERROR: GEMINI_API_KEY is not set in environment.")
        return "Error: GEMINI_API_KEY is not configured. Please set it in your .env file."

    print(f"[Gemini] Sending prompt ({len(prompt)} chars): {prompt[:100]}...")

    try:
        model = get_model()
        response = model.generate_content(prompt)

        print(f"[Gemini] Raw response received. Has parts: {bool(response.parts)}")

        if response.parts:
            result = response.text
            print(f"[Gemini] Response text ({len(result)} chars): {result[:100]}...")
            return result
        else:
            # This occurs when Gemini blocks the content via safety filters
            print("[Gemini] WARNING: Response was blocked by safety filters or empty.")
            return "I was unable to generate a response for this input. Please try rephrasing."

    except Exception as e:
        print(f"[Gemini] API Error: {type(e).__name__}: {e}")
        return f"Error communicating with AI service: {str(e)}"
