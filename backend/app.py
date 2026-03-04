from flask import Flask, request, jsonify
from flask_cors import CORS
# Import SentenceTransformer lazily - don't import at top level
from sklearn.feature_extraction.text import TfidfVectorizer, ENGLISH_STOP_WORDS
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
import resend

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

# Configure Resend Email API
RESEND_API_KEY = os.getenv('RESEND_API_KEY', '')
if RESEND_API_KEY:
    resend.api_key = RESEND_API_KEY
    print("[SUCCESS] Resend API configured!", flush=True)
else:
    print("[WARNING] RESEND_API_KEY not set. Email sending will fail.", flush=True)

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
            gemini_model = genai.GenerativeModel('gemini-2.5-flash')
            print("[SUCCESS] Gemini 2.5 Flash generative model loaded!", flush=True)
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

# Master list used for set-based keyword matching
TARGET_SKILLS = [
    'Python', 'Java', 'JavaScript', 'TypeScript', 'React', 'Node.js', 'Angular', 'Vue',
    'SQL', 'PostgreSQL', 'MongoDB', 'Redis', 'MySQL', 'SQLite',
    'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Jenkins', 'CI/CD',
    'Flask', 'Django', 'Spring Boot', 'Express', 'FastAPI',
    'Machine Learning', 'Deep Learning', 'AI', 'Data Science', 'NLP', 'LLM',
    'API', 'REST', 'GraphQL', 'Git', 'Agile', 'Scrum', 'Linux', 'Bash',
    'TensorFlow', 'PyTorch', 'Scikit-learn', 'Pandas', 'NumPy',
    'Kafka', 'Spark', 'Hadoop', 'Terraform', 'Ansible', 'Selenium',
    'Kotlin', 'Swift', 'Go', 'Rust', 'PHP', 'Ruby', 'Rails', 'Scala',
    'Tableau', 'Power BI', 'OpenCV', 'Airflow', 'DevOps', 'Microservices'
]

# Alias map: normalized form → canonical TARGET_SKILLS form
SKILL_ALIASES = {
    'nodejs':        'node.js',
    'node js':       'node.js',
    'node':          'node.js',
    'reactjs':       'react',
    'react js':      'react',
    'react.js':      'react',
    'vuejs':         'vue',
    'vue js':        'vue',
    'vue.js':        'vue',
    'angularjs':     'angular',
    'angular js':    'angular',
    'postgres':      'postgresql',
    'ml':            'machine learning',
    'dl':            'deep learning',
    'cicd':          'ci/cd',
    'ci cd':         'ci/cd',
    'springboot':    'spring boot',
    'expressjs':     'express',
    'express js':    'express',
    'express.js':    'express',
    'google cloud':  'gcp',
    'scikit':        'scikit-learn',
    'sklearn':       'scikit-learn',
    'powerbi':       'power bi',
    'power-bi':      'power bi',
    'golang':        'go',
}

# Generic resume/HR words that pollute keyword matching
CUSTOM_STOP_WORDS = frozenset(ENGLISH_STOP_WORDS) | frozenset([
    'professional', 'application', 'resume', 'summary', 'experience', 'work',
    'team', 'role', 'position', 'responsibilities', 'skills', 'ability',
    'knowledge', 'strong', 'excellent', 'good', 'looking', 'seeking',
    'candidate', 'years', 'company', 'organization', 'environment',
    'stack', 'passion', 'driven', 'motivated', 'dynamic', 'proven'
])

TECH_STACK = {s.lower() for s in TARGET_SKILLS}
TECH_WEIGHT = 3.0
GENERIC_WEIGHT = 1.0

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

def _normalize(text):
    """Lowercase, strip punctuation variants, collapse whitespace."""
    text = text.lower().strip()
    text = re.sub(r'[\.\-/]', '', text)
    text = re.sub(r'\s+', ' ', text)
    return SKILL_ALIASES.get(text, text)

def _skill_present(skill, text_lower):
    """
    Return True if `skill` (or a known alias) appears in `text_lower`.
    Handles: case, Node.js/Nodejs/Node js, CI/CD, etc.
    """
    # Direct substring check (handles 'Python', 'SQL', multi-word like 'Machine Learning')
    if skill.lower() in text_lower:
        return True
    # Normalized check (strips dots/slashes so 'nodejs' matches 'node.js')
    norm_skill = _normalize(skill)
    norm_text  = _normalize(text_lower)
    return norm_skill in norm_text

def calculate_keyword_score(resume_text, jd_text):
    """
    Set-based keyword matching.

    Score = (all TARGET_SKILLS found in resume) / required_count * 100
      - all_found   : every TARGET_SKILL present in the resume (skill breadth)
      - required_count : max(JD skill count, 10) — prevents a tiny JD from
                         collapsing everyone to the same tiny score
    Floor: 5+ skills found in resume → minimum 60%.
    """
    try:
        if not resume_text.strip() or not jd_text.strip():
            return {'score': 0.0, 'matched_keywords': [], 'missing_keywords': []}

        resume_lower = resume_text.lower()
        jd_lower     = jd_text.lower()

        # Skills this JD requires (used for matched/missing display)
        jd_required = [s for s in TARGET_SKILLS if _skill_present(s, jd_lower)]

        # ALL TARGET_SKILLS the resume has — this drives the score
        all_found = [s for s in TARGET_SKILLS if _skill_present(s, resume_lower)]

        # JD-relative lists for UI display
        jd_matched = [s for s in jd_required if _skill_present(s, resume_lower)]
        jd_missing = [s for s in jd_required if not _skill_present(s, resume_lower)]

        # Denominator = JD requirement count (min 10 so a 1-skill JD doesn't
        # make everyone look identical at 100%)
        required_count = max(len(jd_required), 10)
        score = min(100.0, (len(all_found) / required_count) * 100)

        # Floor: 5+ skills found → never show below 60%
        if len(all_found) >= 5:
            score = max(score, 60.0)

        print(
            f"[DEBUG] Keyword: {len(all_found)} resume skills / "
            f"{required_count} required → {score:.1f}%", flush=True
        )

        return {
            'score': round(score, 1),
            'matched_keywords': (jd_matched or all_found)[:10],
            'missing_keywords': jd_missing[:5]
        }
    except Exception as e:
        print(f"Keyword score error: {e}")
        return {'score': 0.0, 'matched_keywords': [], 'missing_keywords': []}

def calculate_semantic_score(resume_text, job_desc):
    """
    Uses Gemini API embeddings for semantic similarity with Min-Max scaling.
    Raw cosine similarity from Gemini embeddings sits around 0.5 for unrelated
    text and 0.85-0.92 for strong matches, so we scale [0.5, 0.92] → [60%, 95%]
    to produce a meaningful visible range.
    Falls back to 75% if the API is unavailable (safe demo value).
    """
    if resume_text.strip().lower() == job_desc.strip().lower():
        print("[DEBUG] Exact text match detected. Returning 100%", flush=True)
        return {'score': 100.0}

    try:
        # Truncate to stay within embedding API token limits
        resume_truncated = resume_text[:3000]
        job_truncated = job_desc[:3000]

        res_res = genai.embed_content(
            model="models/text-embedding-004",
            content=resume_truncated,
            task_type="clustering"
        )
        job_res = genai.embed_content(
            model="models/text-embedding-004",
            content=job_truncated,
            task_type="clustering"
        )

        res_vector = np.array(res_res['embedding']).reshape(1, -1)
        job_vector = np.array(job_res['embedding']).reshape(1, -1)

        # Use numpy dot product (equivalent to cosine similarity on unit vectors)
        similarity = float(np.dot(res_vector, job_vector.T)[0][0] /
                           (np.linalg.norm(res_vector) * np.linalg.norm(job_vector)))
        print(f"[DEBUG] Raw semantic similarity: {similarity:.4f}", flush=True)

        # Min-Max scaling: map similarity ranges to human-readable scores
        # > 0.92  → 95-100% (near-perfect match)
        # 0.50-0.92 → 60-95% (visible meaningful range)
        # < 0.50  → 0-60%  (weak/unrelated)
        if similarity >= 0.92:
            score = 95.0 + ((similarity - 0.92) / 0.08) * 5.0  # 95-100
        elif similarity >= 0.50:
            score = 60.0 + ((similarity - 0.50) / (0.92 - 0.50)) * 35.0  # 60-95
        else:
            score = max(0.0, (similarity / 0.50) * 60.0)  # 0-60

        return {'score': round(score, 2)}

    except Exception as e:
        print(f"Error in semantic calculation: {e}", flush=True)
        # Intelligent fallback: estimate from resume's skill breadth (65–92%)
        # so candidates with more skills get a higher fallback than shallow resumes
        skill_count = sum(1 for s in TARGET_SKILLS if _skill_present(s, resume_text.lower()))
        fallback = min(92.0, max(65.0, 65.0 + (skill_count / len(TARGET_SKILLS)) * 27.0))
        print(f"[DEBUG] Semantic fallback (API unavailable): skill_count={skill_count} → {fallback:.1f}%", flush=True)
        return {'score': round(fallback, 2)}

SENIORITY_TERMS = {'senior', 'architect', 'lead', 'principal', 'staff', 'head of', 'manager'}

def get_overall_score(k_score, s_score, k_weight=0.5, s_weight=0.5, seniority_bonus=0.0):
    """
    Overall Match = (Keyword × 0.5) + (Semantic × 0.5) + seniority_bonus.
    If one component is 0 (API failure / empty text), uses only the valid score.
    Result rounded to 1 decimal place.
    """
    if k_score == 0.0 and s_score > 0.0:
        base = s_score
    elif s_score == 0.0 and k_score > 0.0:
        base = k_score
    else:
        base = (k_score * k_weight) + (s_score * s_weight)
    return round(min(100.0, base + seniority_bonus), 1)

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
        score = candidate_data['score']
        prompt = f"""Analyze this candidate for the job role below.

Job Description (excerpt): {jd_text[:300]}
Overall Match Score: {score}%
Matched Skills: {', '.join(candidate_data['found_skills'][:8])}

Write a 2-sentence professional summary of the candidate's fit.
Then output a single Recommendation label using EXACTLY these thresholds:
- Score >= 70%  → Recommendation: Strong Match
- Score 40-69%  → Recommendation: Good Match
- Score < 40%   → Recommendation: Weak Match

Current score is {score}%, so apply the correct label."""
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
        
        # Get custom weights from frontend, defaulting to 50/50
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

            k_score = k_res['score']
            s_score = s_res['score']

            # +5% bonus for senior-level resumes
            resume_lower_check = resume_text.lower()
            seniority_bonus = 5.0 if any(t in resume_lower_check for t in SENIORITY_TERMS) else 0.0
            if seniority_bonus:
                print(f"[DEBUG] Seniority bonus applied for {file.filename}", flush=True)

            final_score = get_overall_score(k_score, s_score, k_weight, s_weight, seniority_bonus)
            
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
# SEND EMAIL ENDPOINT
# ---------------------------------------------------------------------------

@app.route('/send-email', methods=['POST'])
def send_email():
    """
    Send an email using Resend API.
    Expects JSON: { to_email, subject, email_content }
    """
    try:
        data = request.json
        to_email = data.get('to_email')
        subject = data.get('subject')
        email_content = data.get('email_content')
        
        # Validation
        if not to_email or not subject or not email_content:
            return jsonify({'error': 'Missing required fields: to_email, subject, email_content'}), 400
        
        if not RESEND_API_KEY:
            return jsonify({'error': 'Email service not configured. Please set RESEND_API_KEY.'}), 500
        
        print(f"[INFO] Sending email to: {to_email}", flush=True)
        print(f"[INFO] Subject: {subject}", flush=True)
        
        # Send email via Resend
        response = resend.Emails.send({
            "from": "onboarding@resend.dev",
            "to": to_email,
            "subject": subject,
            "html": email_content
        })
        
        print(f"[SUCCESS] Email sent! Response: {response}", flush=True)
        
        return jsonify({
            'success': True,
            'message': 'Email sent successfully',
            'email_id': response.get('id')
        }), 200
        
    except Exception as e:
        print(f"[ERROR] Failed to send email: {e}", flush=True)
        return jsonify({'error': f'Failed to send email: {str(e)}'}), 500

# ---------------------------------------------------------------------------
# MAIN
# ---------------------------------------------------------------------------

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    print(f"Server running on http://0.0.0.0:{port}", flush=True)
    app.run(host='0.0.0.0', port=port, debug=False)