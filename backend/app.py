from flask import Flask, request, jsonify
from flask_cors import CORS
# Import SentenceTransformer lazily - don't import at top level
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import pypdf
from docx import Document
import numpy as np
import io
import os
import sys
import time
import json
import re
import jwt
from dotenv import load_dotenv
import google.generativeai as genai

# Load environment variables
load_dotenv()

app = Flask(__name__)

# ---------------------------------------------------------------------------
# ✅ FIXED CORS CONFIGURATION
# ---------------------------------------------------------------------------
# We allow "*" origins to prevent development blocking.
# We explicitly allow 'Authorization' (for Supabase) and 'Content-Type' (for JSON).
CORS(app, 
     resources={r"/*": {"origins": "*"}}, 
     supports_credentials=True, 
     allow_headers=["Content-Type", "Authorization", "x-client-info", "apikey"])

# ---------------------------------------------------------------------------
# CONFIGURATION - Lazy Loading to prevent startup blocking
# ---------------------------------------------------------------------------

# Configure Google Gemini
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', '')

# Configure genai immediately for embeddings API
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    print("[SUCCESS] Gemini API configured for embeddings!", flush=True)
else:
    print("[WARNING] GEMINI_API_KEY not set. Semantic scoring will fail.", flush=True)

# Lazy load the generative model for AI summaries
gemini_model = None

def get_gemini_model():
    global gemini_model
    if gemini_model is None and GEMINI_API_KEY:
        try:
            gemini_model = genai.GenerativeModel('models/gemini-2.5-flash')
            print("[SUCCESS] Gemini generative model loaded!", flush=True)
        except Exception as e:
            print(f"[ERROR] Failed to load Gemini model: {e}", flush=True)
    return gemini_model

# Configure Supabase (lazy)
SUPABASE_URL = os.getenv('SUPABASE_URL', '')
SUPABASE_KEY = os.getenv('SUPABASE_KEY', '')
supabase = None

def get_supabase_client():
    global supabase
    if supabase is None and SUPABASE_URL and SUPABASE_KEY:
        try:
            from supabase import create_client, Client
            supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
            print("[SUCCESS] Supabase client configured successfully!", flush=True)
        except Exception as e:
            print(f"[ERROR] Failed to init Supabase: {e}", flush=True)
    return supabase

# Lazy Load SBERT - REMOVED (using Gemini embeddings instead to save RAM)
# sbert_model = None
# def get_sbert_model():
#     ... (Removed to prevent OOM on Render free tier)

SKILL_KEYWORDS = [
    'Python', 'Java', 'JavaScript', 'TypeScript', 'React', 'Node.js', 'Angular', 'Vue',
    'SQL', 'PostgreSQL', 'MongoDB', 'Redis', 'MySQL',
    'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Jenkins', 'CI/CD',
    'Flask', 'Django', 'Spring Boot', 'Express',
    'Machine Learning', 'AI', 'Data Science', 'API', 'REST', 'GraphQL',
    'Git', 'Agile', 'Scrum', 'Linux', 'Bash'
]

# ---------------------------------------------------------------------------
# HELPER FUNCTIONS
# ---------------------------------------------------------------------------

def extract_text(file):
    filename = file.filename.lower()
    file_content = file.read()
    
    try:
        if filename.endswith('.pdf'):
            pdf_reader = pypdf.PdfReader(io.BytesIO(file_content))
            text = "".join([page.extract_text() + "\n" for page in pdf_reader.pages])
            return text.strip()
        elif filename.endswith('.docx'):
            doc = Document(io.BytesIO(file_content))
            text = "\n".join([paragraph.text for paragraph in doc.paragraphs])
            return text.strip()
        elif filename.endswith('.txt'):
            return file_content.decode('utf-8').strip()
    except Exception as e:
        print(f"Extraction error for {filename}: {e}")
        return ""
    return ""

def calculate_keyword_score(resume_text, jd_text):
    try:
        if not resume_text.strip() or not jd_text.strip():
            return {'score': 0.0, 'matched_keywords': [], 'missing_keywords': []}
        
        vectorizer = TfidfVectorizer(stop_words='english', max_features=100, ngram_range=(1, 2))
        vectors = vectorizer.fit_transform([resume_text, jd_text])
        similarity = cosine_similarity(vectors[0:1], vectors[1:2])[0][0]
        
        feature_names = vectorizer.get_feature_names_out()
        jd_scores = vectors[1].toarray()[0]
        resume_scores = vectors[0].toarray()[0]
        
        matched = [feature_names[i] for i in range(len(feature_names)) if resume_scores[i] > 0 and jd_scores[i] > 0]
        missing = [feature_names[i] for i in range(len(feature_names)) if jd_scores[i] > 0 and resume_scores[i] == 0]
        
        return {
            'score': round(float(similarity) * 100, 2),
            'matched_keywords': matched[:10],
            'missing_keywords': missing[:5]
        }
    except Exception as e:
        print(f"Keyword score error: {e}")
        return {'score': 0.0, 'matched_keywords': [], 'missing_keywords': []}

def calculate_semantic_score(resume_text, job_desc):
    """
    Replaces the heavy SBERT model with Gemini API embeddings.
    Total RAM usage: ~0MB vs 500MB+
    """
    try:
        # 1. Get embeddings for both texts via API
        # Note: 'models/embedding-001' is the standard high-speed model
        res_res = genai.embed_content(
            model="models/embedding-001",
            content=resume_text,
            task_type="clustering"
        )
        job_res = genai.embed_content(
            model="models/embedding-001",
            content=job_desc,
            task_type="clustering"
        )
        
        # 2. Extract the vector lists
        res_vector = np.array(res_res['embedding']).reshape(1, -1)
        job_vector = np.array(job_res['embedding']).reshape(1, -1)
        
        # 3. Calculate similarity (Result is between 0 and 1)
        similarity = cosine_similarity(res_vector, job_vector)[0][0]
        
        # Return formatted score (0-100 scale to match existing code expectations)
        return {'score': round(float(similarity) * 100, 2)}
        
    except Exception as e:
        print(f"Error in semantic calculation: {e}", flush=True)
        return {'score': 50.0}  # Neutral fallback score if API fails

def extract_skills(text):
    text_lower = text.lower()
    found = [skill for skill in SKILL_KEYWORDS if skill.lower() in text_lower]
    missing = [skill for skill in SKILL_KEYWORDS if skill not in found]
    return found, missing

def parse_email(text):
    match = re.search(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', text)
    return match.group(0) if match else None

def generate_ai_summary(candidate_data, jd_text):
    model = get_gemini_model()
    if not model:
        return "AI Summary unavailable (No Key)."
    try:
        prompt = f"""Analyze this candidate for the job.
        Job: {jd_text[:300]}...
        Candidate Score: {candidate_data['score']}%
        Skills: {', '.join(candidate_data['found_skills'][:5])}
        
        Provide a 2 sentence professional summary and a Recommendation (Strong/Good/Weak Match)."""
        response = model.generate_content(prompt)
        return response.text.strip()
    except:
        return "AI Analysis failed."

# ---------------------------------------------------------------------------
# CORE ENDPOINTS
# ---------------------------------------------------------------------------

@app.route('/')
def home():
    """Health check endpoint for Render"""
    return jsonify({
        "status": "healthy",
        "service": "TalentFit Backend",
        "version": "1.0.0"
    }), 200

@app.route('/test', methods=['GET'])
def test_route():
    return jsonify({"message": "Test successful!"}), 200

@app.route('/analyze', methods=['POST'])
def analyze():
    try:
        jd_file = request.files.get('jd_file')
        jd_text = request.form.get('job_description', '')
        
        # Get custom weights from frontend (or default)
        try:
            k_weight = float(request.form.get('keyword_weight', 0.5))
            s_weight = float(request.form.get('semantic_weight', 0.5))
        except:
            k_weight, s_weight = 0.5, 0.5

        if jd_file:
            job_description = extract_text(jd_file)
        elif jd_text:
            job_description = jd_text
        else:
            return jsonify({'error': 'No Job Description provided'}), 400

        files = request.files.getlist('files')
        results = []

        for idx, file in enumerate(files):
            resume_text = extract_text(file)
            if not resume_text: continue

            k_res = calculate_keyword_score(resume_text, job_description)
            s_res = calculate_semantic_score(resume_text, job_description)
            
            # Apply dynamic weights
            final_score = round((k_res['score'] * k_weight) + (s_res['score'] * s_weight), 2)
            
            found, missing = extract_skills(resume_text)
            
            c_data = {
                'id': idx,
                'filename': file.filename,
                'score': final_score,
                'email': parse_email(resume_text),
                'found_skills': found,
                'missing_skills': missing,
                'breakdown': {'keyword': k_res, 'semantic': s_res}
            }
            
            c_data['ai_summary'] = generate_ai_summary(c_data, job_description)
            results.append(c_data)
            time.sleep(0.5) # Rate limit safety

        results.sort(key=lambda x: x['score'], reverse=True)
        return jsonify({'results': results}), 200

    except Exception as e:
        print(f"Analyze Error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/generate_email', methods=['POST'])
def generate_email():
    try:
        data = request.json
        model = get_gemini_model()
        if not model:
            return jsonify({'error': 'AI service unavailable'}), 503
        
        prompt = f"""Write a recruiting email to {data.get('candidate_name')} for {data.get('job_title')}.
        Mention missing skills: {', '.join(data.get('missing_skills', []))}.
        Return ONLY valid JSON: {{'subject': '...', 'body': '...'}}"""
        
        response = model.generate_content(prompt)
        text = response.text.replace('```json', '').replace('```', '').strip()
        return jsonify(json.loads(text)), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ---------------------------------------------------------------------------
# SETTINGS ENDPOINTS (SUPABASE INTEGRATION)
# ---------------------------------------------------------------------------

@app.route('/settings', methods=['GET'])
def get_settings():
    """Retrieve settings for the logged-in user"""
    auth_header = request.headers.get('Authorization')
    
    if not auth_header:
        return jsonify({'error': 'No authorization header provided'}), 401
    
    supabase = get_supabase_client()
    if not supabase:
        return jsonify({'error': 'Database unavailable'}), 500

    try:
        # 1. Verify JWT token and extract user ID securely
        if not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Invalid authorization format'}), 401
            
        token = auth_header.split('Bearer ')[1]
        print(f"[DEBUG] Token received: {token[:20]}...", flush=True)
        
        # Use Supabase auth to verify token and get user
        try:
            user = supabase.auth.get_user(token)
            user_id = user.user.id
        except Exception as auth_error:
            print(f"[DEBUG] Auth verification failed: {auth_error}", flush=True)
            return jsonify({'error': 'Invalid or expired token'}), 401
        
        if not user_id:
            return jsonify({'error': 'Invalid token - no user ID found'}), 401
            
        print(f"[DEBUG] User ID from token: {user_id}", flush=True)

        # 2. Query DB using user_configs table
        response = supabase.table('user_configs').select('*').eq('user_id', user_id).execute()
        print(f"[DEBUG] DB response: {response}", flush=True)
        
        # 3. Return Data or Auto-create with Defaults
        if response.data and len(response.data) > 0:
            print(f"[DEBUG] Returning existing settings", flush=True)
            return jsonify(response.data[0]), 200
        else:
            # No settings found - auto-create row with defaults
            print(f"[DEBUG] No settings found, auto-creating with defaults", flush=True)
            defaults = {
                'user_id': user_id,
                'keyword_weight': 0.4,
                'semantic_weight': 0.6,
                'signature_name': '',
                'signature_role': '',
                'signature_company': ''
            }
            
            supabase.table('user_configs').insert(defaults).execute()
            return jsonify(defaults), 200

    except Exception as e:
        import traceback
        print("\n" + "="*60, flush=True)
        print("❌ CRITICAL BACKEND ERROR - GET /settings", flush=True)
        print(f"Error Type: {type(e).__name__}", flush=True)
        print(f"Error Message: {str(e)}", flush=True)
        print("Full Traceback:", flush=True)
        traceback.print_exc()
        print("="*60 + "\n", flush=True)
        return jsonify({'error': str(e)}), 500

@app.route('/settings', methods=['POST'])
def save_settings():
    """Save/Update settings for the logged-in user"""
    auth_header = request.headers.get('Authorization')
    
    if not auth_header:
        return jsonify({'error': 'No authorization header provided'}), 401
    
    supabase = get_supabase_client()
    if not supabase:
        return jsonify({'error': 'Database unavailable'}), 500

    try:
        # 1. Verify JWT token and extract user ID securely
        if not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Invalid authorization format'}), 401
            
        token = auth_header.split('Bearer ')[1]
        
        # Use Supabase auth to verify token and get user
        try:
            user = supabase.auth.get_user(token)
            user_id = user.user.id
        except Exception as auth_error:
            print(f"[DEBUG] Auth verification failed: {auth_error}", flush=True)
            return jsonify({'error': 'Invalid or expired token'}), 401
        
        if not user_id:
            return jsonify({'error': 'Invalid token'}), 401
        
        print(f"[DEBUG] Saving settings for user: {user_id}", flush=True)
        
        # 2. Prepare Data for user_configs table (allowlist pattern for security)
        incoming = request.json or {}
        settings_payload = {
            'user_id': user_id,
            'keyword_weight': incoming.get('keyword_weight', 0.4),
            'semantic_weight': incoming.get('semantic_weight', 0.6),
            'signature_name': incoming.get('signature_name', ''),
            'signature_role': incoming.get('signature_role', ''),
            'signature_company': incoming.get('signature_company', '')
        }
        
        print(f"[DEBUG] Payload: {settings_payload}", flush=True)

        # 3. Upsert (Update if exists, Insert if new) to user_configs table
        response = (
            supabase
            .table('user_configs')
            .upsert(
                settings_payload,
                on_conflict='user_id',
                ignore_duplicates=False
            )
            .execute()
        )
        print(f"[DEBUG] Upsert response: {response}", flush=True)
        
        return jsonify({'message': 'Settings synced to cloud ☁️', 'data': response.data}), 200

    except Exception as e:
        import traceback
        print("\n" + "="*60, flush=True)
        print("❌ CRITICAL BACKEND ERROR - POST /settings", flush=True)
        print(f"Error Type: {type(e).__name__}", flush=True)
        print(f"Error Message: {str(e)}", flush=True)
        print("Full Traceback:", flush=True)
        traceback.print_exc()
        print("="*60 + "\n", flush=True)
        return jsonify({'error': str(e)}), 500

# ---------------------------------------------------------------------------
# MAIN
# ---------------------------------------------------------------------------

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    print(f"Server running on http://0.0.0.0:{port}", flush=True)
    app.run(host='0.0.0.0', port=port, debug=False)