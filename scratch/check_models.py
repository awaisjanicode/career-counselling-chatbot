import google.generativeai as genai
import os
from dotenv import load_dotenv

# Load .env from the backend folder
load_dotenv('backend/.env')

api_key = os.getenv("GOOGLE_API_KEY")
if not api_key:
    print("API Key not found in .env")
else:
    try:
        genai.configure(api_key=api_key)
        print(f"Checking models for API Key: {api_key[:10]}...")
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                print(m.name)
    except Exception as e:
        print(f"Error listing models: {e}")
