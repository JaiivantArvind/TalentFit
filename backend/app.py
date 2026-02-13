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

app = Flask(__name__)
CORS(app)

# Lazy load SBERT model only when needed (saves startup time)
sbert_model = None

def get_sbert_model():
    """Lazy load SBERT model on first use"""
    global sbert_model
    if sbert_model is None:
        print("Loading SBERT model (first request only)...", flush=True)
        sbert_model = SentenceTransformer('all-MiniLM-L6-v2', device='cpu')
        sbert_model.max_seq_length = 128  # Reduce from default 256 for faster inference
        print("✓ Model loaded successfully!", flush=True)
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
    """Calculate keyword overlap score using TF-IDF"""
    try:
        if not resume_text.strip() or not jd_text.strip():
            return 0.0
        vectorizer = TfidfVectorizer(stop_words='english', max_features=100, ngram_range=(1, 2))
        vectors = vectorizer.fit_transform([resume_text, jd_text])
        similarity = cosine_similarity(vectors[0:1], vectors[1:2])[0][0]
        return round(float(similarity) * 100, 2)  # Convert numpy float to Python float
    except Exception as e:
        print(f"Keyword score error: {e}", flush=True)
        return 0.0

def calculate_semantic_score(resume_text, jd_text):
    """Calculate semantic similarity using SBERT"""
    try:
        model = get_sbert_model()
        # Truncate long texts for faster processing (keep first 500 words)
        resume_text = ' '.join(resume_text.split()[:500])
        jd_text = ' '.join(jd_text.split()[:500])
        
        embeddings = model.encode([resume_text, jd_text], show_progress_bar=False, convert_to_numpy=True)
        similarity = cosine_similarity([embeddings[0]], [embeddings[1]])[0][0]
        return round(float(similarity) * 100, 2)  # Convert numpy float to Python float
    except Exception as e:
        print(f"Semantic score error: {e}", flush=True)
        return 0.0

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

@app.route('/analyze', methods=['POST'])
def analyze():
    """Main endpoint to analyze resumes against job description"""
    try:
        print(f"\n{'='*60}", flush=True)
        print("📥 New analyze request received", flush=True)
        
        # Get job description from form
        job_description = request.form.get('job_description', '')
        
        if not job_description:
            return jsonify({'error': 'Job description is required'}), 400
        
        print(f"📋 Job description length: {len(job_description)} chars", flush=True)
        
        # Get uploaded files
        files = request.files.getlist('files')
        
        if not files:
            return jsonify({'error': 'No files uploaded'}), 400
        
        print(f"📁 Files received: {len(files)}", flush=True)
        
        results = []
        
        for idx, file in enumerate(files, start=1):
            print(f"\n⏳ Processing file {idx}/{len(files)}: {file.filename}", flush=True)
            
            # Extract text from resume
            resume_text = extract_text(file)
            
            if not resume_text:
                print(f"❌ Failed to extract text from {file.filename}", flush=True)
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
            
            print(f"✓ Extracted {len(resume_text)} characters", flush=True)
            
            # Calculate scores
            print("🔍 Calculating keyword score...", flush=True)
            keyword_score = calculate_keyword_score(resume_text, job_description)
            print(f"✓ Keyword score: {keyword_score}%", flush=True)
            
            print("🧠 Calculating semantic score...", flush=True)
            semantic_score = calculate_semantic_score(resume_text, job_description)
            print(f"✓ Semantic score: {semantic_score}%", flush=True)
            
            # Weighted average (40% keyword, 60% semantic)
            final_score = round((keyword_score * 0.4) + (semantic_score * 0.6), 2)
            
            # Extract skills
            found_skills, missing_skills = extract_skills(resume_text)
            
            print(f"🎯 Final score: {final_score}%", flush=True)
            print(f"✅ Found skills: {len(found_skills)}", flush=True)
            print(f"❌ Missing skills: {len(missing_skills)}", flush=True)
            
            results.append({
                'id': idx,
                'filename': file.filename,
                'score': final_score,
                'breakdown': {
                    'keyword': keyword_score,
                    'semantic': semantic_score
                },
                'found_skills': found_skills,
                'missing_skills': missing_skills
            })
        
        # Sort by score descending
        results.sort(key=lambda x: x['score'], reverse=True)
        
        print(f"\n✅ Analysis complete! Processed {len(results)} file(s)", flush=True)
        print(f"{'='*60}\n", flush=True)
        
        return jsonify({'results': results}), 200
    
    except Exception as e:
        print(f"❌ Error in /analyze: {e}", flush=True)
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'model': 'all-MiniLM-L6-v2'}), 200

if __name__ == '__main__':
    print("🚀 Starting Flask Backend Server...", flush=True)
    print("📍 Server will be available at: http://127.0.0.1:5000", flush=True)
    print("⚡ Model will load on first request (lazy loading for faster startup)", flush=True)
    print("-" * 60, flush=True)
    # Disable Flask reloader in production to prevent double loading
    app.run(host='127.0.0.1', port=5000, debug=False, threaded=True)
