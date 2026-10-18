import os
import google.generativeai as genai
import resend
from app.config import Config

# Initialize Resend API key if present
if Config.RESEND_API_KEY:
    resend.api_key = Config.RESEND_API_KEY
    print("[SUCCESS] Resend API configured!", flush=True)
else:
    print("[WARNING] RESEND_API_KEY not set in environment. Dynamic resolution will be used.", flush=True)

from dotenv import dotenv_values, find_dotenv

# Lazy singletons
_gemini_model = None
_supabase_client = None

def get_supabase_client():
    """Lazy load Supabase client for database operations and token verification."""
    global _supabase_client
    if _supabase_client is None and Config.SUPABASE_URL and Config.SUPABASE_KEY:
        try:
            from supabase import create_client
            _supabase_client = create_client(Config.SUPABASE_URL, Config.SUPABASE_KEY)
            print("[SUCCESS] Supabase client configured successfully!", flush=True)
        except Exception as e:
            print(f"[ERROR] Failed to init Supabase: {e}", flush=True)
    return _supabase_client

def get_current_gemini_key():
    # 1. Supabase app_config (Cloud store)
    try:
        sb = get_supabase_client()
        if sb:
            res = sb.table('app_config').select('value').eq('key', 'gemini_api_key').execute()
            if res.data and len(res.data) > 0:
                val = (res.data[0].get('value') or '').strip()
                if val and not val.startswith('your_'):
                    return val
    except Exception:
        pass

    # 2. Local .env
    env_file = find_dotenv()
    if env_file:
        vals = dotenv_values(env_file)
        key = vals.get('GEMINI_API_KEY', '') or ''
        if key and not key.startswith('your_'):
            return key.strip()

    # 3. Environment variable
    key = os.getenv('GEMINI_API_KEY', '')
    if key and not key.startswith('your_'):
        return key.strip()

    return ''

# Initialize Gemini API for embeddings if present
initial_gemini_key = get_current_gemini_key()
if initial_gemini_key:
    try:
        genai.configure(api_key=initial_gemini_key)
        print("[SUCCESS] Gemini API configured for embeddings!", flush=True)
    except Exception as e:
        print(f"[ERROR] Failed to configure Gemini: {e}", flush=True)
else:
    print("[WARNING] GEMINI_API_KEY not set. Semantic scoring will fallback.", flush=True)

def get_gemini_model():
    """Lazy load generative model for AI summaries and email generation."""
    global _gemini_model
    key = get_current_gemini_key()
    if not key or key.startswith('your_'):
        return None
    if _gemini_model is None:
        try:
            genai.configure(api_key=key)
            _gemini_model = genai.GenerativeModel('gemini-2.5-flash')
            print("[SUCCESS] Gemini 2.5 Flash generative model loaded!", flush=True)
        except Exception as e:
            try:
                _gemini_model = genai.GenerativeModel('gemini-1.5-flash')
                print("[SUCCESS] Gemini 1.5 Flash generative model loaded!", flush=True)
            except Exception as e2:
                print(f"[ERROR] Failed to load Gemini model: {e2}", flush=True)
                return None
    return _gemini_model
