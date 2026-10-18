import os
from dotenv import load_dotenv

# Load environment variables on module import
load_dotenv()

class Config:
    GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', '')
    RESEND_API_KEY = os.getenv('RESEND_API_KEY', '')
    SUPABASE_URL = os.getenv('SUPABASE_URL', '')
    SUPABASE_KEY = os.getenv('SUPABASE_KEY', '')
    PORT = int(os.getenv('PORT', 5000))
