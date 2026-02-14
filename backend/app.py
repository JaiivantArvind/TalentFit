from flask import Flask, request, jsonify
from flask_cors import CORS
from sentence_transformers import SentenceTransformer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import pypdf
from docx import Document
import numpy as np
import io
import os
import sys
import time  # For API rate limiting
from dotenv import load_dotenv  # <--- CRUCIAL for loading .env file
import google.generativeai as genai

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
CORS(app)

# Configure Google Gemini API
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', '')
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    # Use gemini-2.5-flash for fast, free tier performance (15 RPM free)
    gemini_model = genai.GenerativeModel('models/gemini-2.5-flash')
    print("[SUCCESS] Gemini API configured successfully! (Using gemini-2.5-flash)", flush=True)
else:
    gemini_model = None
    print("[WARNING] GEMINI_API_KEY not set. AI summaries will be disabled.", flush=True)
    print("          Get your API key from: https://makersuite.google.com/app/apikey", flush=True)

# Lazy load SBERT model only when needed (saves startup time)
sbert_model = None

def get_sbert_model():
    """Lazy load SBERT model on first use"""
    global sbert_model
    if sbert_model is None:
        print("Loading SBERT model (first request only)...", flush=True)
        sbert_model = SentenceTransformer('all-MiniLM-L6-v2', device='cpu')
        sbert_model.max_seq_length = 128  # Reduce from default 256 for faster inference
        print("[OK] Model loaded successfully!", flush=True)
    return sbert_model

# Extended skill keywords for better matching
SKILL_KEYWORDS = [
    'Python', 'Java', 'JavaScript', 'TypeScript', 'React', 'Node.js', 'Angular', 'Vue',
    'SQL', 'PostgreSQL', 'MongoDB', 'Redis', 'MySQL',
    'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Jenkins', 'CI/CD',
    'Flask', 'Django', 'Spring Boot', 'Express',
    'Machine Learning', 'AI', 'Data Science', 'API', 'REST', 'GraphQL',
    'Git', 'Agile', 'Scrum', 'Linux', 'Bash'
]

def extract_text_from_pdf(file_content):
    """Extract text from PDF file"""
    try:
        pdf_reader = pypdf.PdfReader(io.BytesIO(file_content))
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
        return text.strip()
    except Exception as e:
        print(f"PDF extraction error: {e}")
        return ""

def extract_text_from_docx(file_content):
    """Extract text from DOCX file"""
    try:
        doc = Document(io.BytesIO(file_content))
        text = "\n".join([paragraph.text for paragraph in doc.paragraphs])
        return text.strip()
    except Exception as e:
        print(f"DOCX extraction error: {e}")
        return ""

def extract_text(file):
    """Extract text from uploaded file based on extension"""
    filename = file.filename.lower()
    file_content = file.read()
    
    if filename.endswith('.pdf'):
        return extract_text_from_pdf(file_content)
    elif filename.endswith('.docx'):
        return extract_text_from_docx(file_content)
    elif filename.endswith('.txt'):
        try:
            return file_content.decode('utf-8').strip()
        except Exception as e:
            print(f"TXT extraction error: {e}")
            return ""
    else:
        return ""

def calculate_keyword_score(resume_text, jd_text):
    """Calculate keyword overlap score using TF-IDF with detailed analysis"""
    try:
        if not resume_text.strip() or not jd_text.strip():
            return {
                'score': 0.0,
                'top_keywords': [],
                'matched_keywords': [],
                'missing_keywords': [],
                'explanation': 'Insufficient text for analysis'
            }
        
        vectorizer = TfidfVectorizer(stop_words='english', max_features=100, ngram_range=(1, 2))
        vectors = vectorizer.fit_transform([resume_text, jd_text])
        similarity = cosine_similarity(vectors[0:1], vectors[1:2])[0][0]
        
        # Get feature names and scores
        feature_names = vectorizer.get_feature_names_out()
        jd_scores = vectors[1].toarray()[0]
        resume_scores = vectors[0].toarray()[0]
        
        # Find top keywords from JD
        jd_keyword_scores = [(feature_names[i], jd_scores[i]) for i in range(len(feature_names)) if jd_scores[i] > 0]
        jd_keyword_scores.sort(key=lambda x: x[1], reverse=True)
        top_keywords = [kw for kw, score in jd_keyword_scores[:10]]
        
        # Find matched keywords (present in both resume and JD)
        matched = [(feature_names[i], resume_scores[i], jd_scores[i]) 
                   for i in range(len(feature_names)) 
                   if resume_scores[i] > 0 and jd_scores[i] > 0]
        matched.sort(key=lambda x: x[1] + x[2], reverse=True)
        matched_keywords = [kw for kw, _, _ in matched[:10]]
        
        # Find missing keywords (present in JD but NOT in resume)
        missing = [(feature_names[i], jd_scores[i]) 
                   for i in range(len(feature_names)) 
                   if jd_scores[i] > 0 and resume_scores[i] == 0]
        missing.sort(key=lambda x: x[1], reverse=True)
        missing_keywords = [kw for kw, _ in missing[:5]]  # Top 5 missing keywords
        
        return {
            'score': round(float(similarity) * 100, 2),
            'top_keywords': top_keywords,
            'matched_keywords': matched_keywords,
            'missing_keywords': missing_keywords,
            'match_count': len(matched),
            'total_keywords': len(jd_keyword_scores),
            'explanation': f'TF-IDF analysis found {len(matched)} matching keyword patterns out of {len(jd_keyword_scores)} key terms in the job description.'
        }
    except Exception as e:
        print(f"Keyword score error: {e}", flush=True)
        return {
            'score': 0.0,
            'top_keywords': [],
            'matched_keywords': [],
            'missing_keywords': [],
            'explanation': f'Error during analysis: {str(e)}'
        }

def calculate_semantic_score(resume_text, jd_text):
    """Calculate semantic similarity using SBERT with detailed analysis"""
    try:
        model = get_sbert_model()
        # Truncate long texts for faster processing
        resume_text_truncated = ' '.join(resume_text.split()[:500])
        jd_text_truncated = ' '.join(jd_text.split()[:500])
        
        embeddings = model.encode([resume_text_truncated, jd_text_truncated], show_progress_bar=False, convert_to_numpy=True)
        similarity = cosine_similarity([embeddings[0]], [embeddings[1]])[0][0]
        
        # Calculate embedding statistics
        resume_embedding_norm = float(np.linalg.norm(embeddings[0]))
        jd_embedding_norm = float(np.linalg.norm(embeddings[1]))
        dot_product = float(np.dot(embeddings[0], embeddings[1]))
        
        return {
            'score': round(float(similarity) * 100, 2),
            'resume_embedding_norm': round(resume_embedding_norm, 4),
            'jd_embedding_norm': round(jd_embedding_norm, 4),
            'dot_product': round(dot_product, 4),
            'explanation': f'SBERT semantic analysis computed contextual understanding with {round(float(similarity) * 100, 2)}% similarity. This captures meaning beyond exact keyword matches.'
        }
    except Exception as e:
        print(f"Semantic score error: {e}", flush=True)
        return {
            'score': 0.0,
            'explanation': f'Error during analysis: {str(e)}'
        }

def extract_skills(text):
    """Extract found and missing skills from text"""
    text_lower = text.lower()
    found_skills = []
    missing_skills = []
    
    for skill in SKILL_KEYWORDS:
        if skill.lower() in text_lower:
            found_skills.append(skill)
        else:
            missing_skills.append(skill)
    
    return found_skills, missing_skills

def generate_ai_summary(candidate_data, job_description):
    """Generate AI-powered summary using Google Gemini"""
    if not gemini_model:
        return "AI summary unavailable. Please set GEMINI_API_KEY environment variable."
    
    try:
        prompt = f"""You are an expert HR analyst providing professional resume screening insights. Analyze this candidate's match with the job requirements.

Job Description Summary: {job_description[:500]}...

Candidate Analysis:
- Filename: {candidate_data['filename']}
- Overall Match Score: {candidate_data['score']}%
- Keyword Match (TF-IDF): {candidate_data['breakdown']['keyword']['score']}%
  - Matched Keywords: {', '.join(candidate_data['breakdown']['keyword']['matched_keywords'][:5])}
- Semantic Match (SBERT): {candidate_data['breakdown']['semantic']['score']}%
- Skills Found: {', '.join(candidate_data['found_skills'][:10])}
- Skills Missing: {', '.join(candidate_data['missing_skills'][:5])}

INSTRUCTIONS:
1. Write a 2-3 sentence professional summary in PLAIN TEXT (no markdown, no asterisks, no bold formatting)
2. Explain why this candidate matches or doesn't match well
3. Highlight key strengths or critical gaps
4. End with a clear recommendation using one of these exact phrases:
   - "Recommendation: Strong Match" (80%+ score)
   - "Recommendation: Good Match" (60-79% score)
   - "Recommendation: Moderate Match" (40-59% score)
   - "Recommendation: Weak Match" (below 40% score)

Use natural, flowing language. Be direct and actionable. Do NOT use any special formatting characters."""

        response = gemini_model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        print(f"AI summary error: {e}", flush=True)
        return f"AI summary generation failed: {str(e)}"

@app.route('/analyze', methods=['POST'])
def analyze():
    """Main endpoint to analyze resumes against job description"""
    try:
        print(f"\n{'='*60}", flush=True)
        print("[REQUEST] New analyze request received", flush=True)
        
        # Get job description - prefer file over text
        jd_file = request.files.get('jd_file')
        jd_text = request.form.get('job_description', '')
        
        job_description = ''
        
        # Priority: If file is provided, use it; otherwise use text
        if jd_file:
            print(f"[JD-FILE] JD File received: {jd_file.filename}", flush=True)
            job_description = extract_text(jd_file)
            if not job_description:
                return jsonify({'error': 'Could not extract text from JD file'}), 400
            print(f"[OK] Extracted {len(job_description)} chars from JD file", flush=True)
        elif jd_text:
            job_description = jd_text
            print(f"[JD-TEXT] JD text received: {len(job_description)} chars", flush=True)
        else:
            return jsonify({'error': 'Job description (text or file) is required'}), 400
        
        print(f"[INFO] Job description length: {len(job_description)} chars", flush=True)
        
        # Get uploaded files
        files = request.files.getlist('files')
        
        if not files:
            return jsonify({'error': 'No files uploaded'}), 400
        
        print(f"[FILES] Files received: {len(files)}", flush=True)
        
        results = []
        
        for idx, file in enumerate(files, start=1):
            print(f"\n[PROCESS] Processing file {idx}/{len(files)}: {file.filename}", flush=True)
            
            # Extract text from resume
            resume_text = extract_text(file)
            
            if not resume_text:
                print(f"[ERROR] Failed to extract text from {file.filename}", flush=True)
                results.append({
                    'id': idx,
                    'filename': file.filename,
                    'score': 0,
                    'breakdown': {'keyword': 0, 'semantic': 0},
                    'found_skills': [],
                    'missing_skills': SKILL_KEYWORDS,
                    'error': 'Could not extract text from file'
                })
                continue
            
            print(f"[OK] Extracted {len(resume_text)} characters", flush=True)
            
            # Calculate scores with detailed analysis
            print("[KEYWORD] Calculating keyword score...", flush=True)
            keyword_analysis = calculate_keyword_score(resume_text, job_description)
            print(f"[OK] Keyword score: {keyword_analysis['score']}%", flush=True)
            
            print("[SEMANTIC] Calculating semantic score...", flush=True)
            semantic_analysis = calculate_semantic_score(resume_text, job_description)
            print(f"[OK] Semantic score: {semantic_analysis['score']}%", flush=True)
            
            # Weighted average (40% keyword, 60% semantic)
            final_score = round((keyword_analysis['score'] * 0.4) + (semantic_analysis['score'] * 0.6), 2)
            
            # Extract skills
            found_skills, missing_skills = extract_skills(resume_text)
            
            print(f"[SCORE] Final score: {final_score}%", flush=True)
            print(f"[SKILLS-FOUND] Found skills: {len(found_skills)}", flush=True)
            print(f"[SKILLS-MISS] Missing skills: {len(missing_skills)}", flush=True)
            
            # Build candidate data
            candidate_data = {
                'id': idx,
                'filename': file.filename,
                'score': final_score,
                'breakdown': {
                    'keyword': keyword_analysis,
                    'semantic': semantic_analysis,
                    'weight_explanation': 'Final score calculated as: (Keyword × 40%) + (Semantic × 60%). This weighting prioritizes contextual understanding over exact keyword matches.'
                },
                'found_skills': found_skills,
                'missing_skills': missing_skills
            }
            
            # Generate AI summary
            print("[AI] Generating AI summary...", flush=True)
            ai_summary = generate_ai_summary(candidate_data, job_description)
            candidate_data['ai_summary'] = ai_summary
            print(f"[OK] AI summary generated", flush=True)
            
            # Rate limiting: Sleep 1 second to avoid hitting Gemini API limits (15 RPM for free tier)
            time.sleep(1)
            
            results.append(candidate_data)
        
        # Sort by score descending
        results.sort(key=lambda x: x['score'], reverse=True)
        
        print(f"\n[COMPLETE] Analysis complete! Processed {len(results)} file(s)", flush=True)
        print(f"{'='*60}\n", flush=True)
        
        return jsonify({'results': results}), 200
    
    except Exception as e:
        print(f"[ERROR] Error in /analyze: {e}", flush=True)
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'model': 'all-MiniLM-L6-v2'}), 200

if __name__ == '__main__':
    print("[START] Starting Flask Backend Server...", flush=True)
    print("[INFO] Server will be available at: http://127.0.0.1:5000", flush=True)
    print("[INFO] Model will load on first request (lazy loading for faster startup)", flush=True)
    print("-" * 60, flush=True)
    # Disable Flask reloader in production to prevent double loading
    app.run(host='127.0.0.1', port=5000, debug=False, threaded=True)
