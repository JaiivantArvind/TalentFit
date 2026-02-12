from flask import Flask, request, jsonify
from flask_cors import CORS
import PyPDF2
from PyPDF2 import PdfReader
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sentence_transformers import SentenceTransformer
import numpy as np
import io
import os
import re
from packaging import version # For version checking

app = Flask(__name__)
CORS(app) # Enable CORS for all routes

# --- Configuration ---
# Global model loading for SentenceTransformer
try:
    # Ensure 'all-MiniLM-L6-v2' is a valid and accessible model.
    # If this fails, it could be a reason for server startup issues.
    sbert_model = SentenceTransformer('all-MiniLM-L6-v2')
    print("SBERT model loaded successfully.")
except Exception as e:
    print(f"Error loading SBERT model: {e}")
    sbert_model = None # Handle case where model loading fails

# Define a list of common skills to look for. This list can be expanded.
# Skills are converted to lowercase for matching, but stored capitalized.
COMMON_SKILLS = [
    "python", "java", "sql", "aws", "docker", "kubernetes", "django", "flask",
    "fastapi", "postgresql", "mongodb", "react", "javascript", "html", "css",
    "git", "linux", "api", "rest", "agile", "scrum", "testing", "ci/cd",
    "software engineer", "developer", "senior", "lead", "manager", "data science",
    "machine learning", "artificial intelligence", "backend", "frontend", "full-stack",
    "node.js", "typescript", "c++", "c#", "ruby", "go", "azure", "gcp", "cloud",
    "databases", "networking", "security", "data analysis", "project management",
    "ui", "ux", "design", "troubleshooting", "debugging", "performance tuning",
    "algorithms", "data structures", "object-oriented programming", "functional programming",
    "system design", "architecture", "devops", "cybersecurity", "data engineering"
]

# --- Helper Functions ---

def extract_text_from_pdf(pdf_file_obj):
    """
    Extracts text from a PDF file object.
    """
    try:
        # PyPDF2.PdfReader expects a file-like object, BytesIO is suitable.
        reader = PdfReader(pdf_file_obj)
        text = ""
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text: # Ensure page_text is not None or empty
                text += page_text + "\n"
        return text
    except Exception as e:
        print(f"Error extracting text from PDF: {e}")
        return None

def extract_candidate_name(text):
    """
    Heuristic to extract candidate name from resume text.
    Looks for lines that appear to be a name (e.g., 1-3 capitalized words at the start).
    This is a basic heuristic and might not work for all name formats.
    """
    lines = text.split('\n')
    for line in lines:
        stripped_line = line.strip()
        if not stripped_line:
            continue

        words = stripped_line.split()
        if not words:
            continue

        # Check if the line looks like a typical name (e.g., "John Doe", "John D. Doe", "John Doe Jr.")
        # Allows for middle initials and common suffixes. Assumes names start with Capital letters.
        # Also, avoid common section headers that might coincidentally fit the pattern.
        if all(word[0].isupper() for word in words if len(word) > 0) and len(words) <= 4:
            # Further check to avoid lines that are clearly not names, like section headers
            # (e.g., "Summary", "Skills", "Experience", "Education", "Contact", "Professional Experience")
            if len(stripped_line) < 60 and not any(kw in stripped_line.lower() for kw in ["summary", "skills", "experience", "education", "contact", "professional", "references", "portfolio", "projects", "awards"]):
                return stripped_line
    return "Unknown Candidate"

def extract_skills_from_text(text, skill_list):
    """
    Extracts skills from text based on a predefined list.
    Uses word boundaries for more precise matching.
    """
    text_lower = text.lower()
    present_skills = set()
    for skill in skill_list:
        # Use word boundaries to avoid partial matches (e.g., 'java' in 'javascript')
        # Escape special regex characters in skill names
        pattern = r'\b' + re.escape(skill.lower()) + r'\b'
        if re.search(pattern, text_lower):
            present_skills.add(skill.capitalize()) # Store capitalized for consistency
    return present_skills

def calculate_match_scores(job_description: str, resume_text: str):
    """
    Calculates keyword (TF-IDF) and semantic (SBERT) similarity scores.
    Returns a tuple: (keyword_score_percent, semantic_score_percent)
    """
    keyword_similarity = 0.0
    semantic_similarity = 0.0

    # 1. TF-IDF Keyword Matching
    if job_description.strip() and resume_text.strip(): # Ensure texts are not empty
        try:
            documents = [job_description, resume_text]
            tfidf_vectorizer = TfidfVectorizer(stop_words='english')
            tfidf_matrix = tfidf_vectorizer.fit_transform(documents)
            keyword_similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
        except ValueError: # Handles cases where documents might be empty after cleaning
            keyword_similarity = 0.0
    
    # 2. SBERT Semantic Context Similarity
    if sbert_model and job_description.strip() and resume_text.strip():
        try:
            jd_embedding = sbert_model.encode(job_description, convert_to_tensor=False)
            resume_embedding = sbert_model.encode(resume_text, convert_to_tensor=False)
            semantic_similarity = cosine_similarity([jd_embedding], [resume_embedding])[0][0]
        except Exception as e:
            print(f"Error during SBERT encoding or similarity calculation: {e}")
            semantic_similarity = 0.0
    
    return round(keyword_similarity * 100, 2), round(semantic_similarity * 100, 2)

# --- Flask Routes ---

@app.route('/analyze', methods=['POST'])
def analyze_resume_endpoint():
    # Ensure job description is present
    if 'job_description' not in request.form:
        return jsonify({"error": "Job description text is missing."}), 400
    # Use the general key 'resume_file' for file uploads
    if 'resume_file' not in request.files:
        return jsonify({"error": "Resume file is missing."}), 400

    job_description = request.form['job_description']
    resume_file_obj = request.files['resume_file']

    # Validate job description
    if not job_description.strip():
        return jsonify({"error": "Job description cannot be empty."}), 400

    # Validate resume file
    if resume_file_obj.filename == '':
        return jsonify({"error": "No selected resume file."}), 400

    # Get file extension and check if it's supported
    file_name, file_extension = os.path.splitext(resume_file_obj.filename)
    file_extension = file_extension.lower() # Ensure lowercase for comparison

    resume_text = ""

    if file_extension == '.pdf':
        # Read the PDF file content
        try:
            resume_text = extract_text_from_pdf(io.BytesIO(resume_file_obj.read()))
            if resume_text is None:
                return jsonify({"error": "Failed to extract text from resume PDF."}), 500
        except Exception as e:
            print(f"Error processing PDF file: {e}")
            return jsonify({"error": "An error occurred processing the PDF file."}), 500
    elif file_extension == '.txt':
        try:
            # Read TXT file content directly
            resume_text = resume_file_obj.read().decode('utf-8')
        except Exception as e:
            print(f"Error reading TXT file: {e}")
            return jsonify({"error": "Failed to read text from resume TXT file."}), 500
    else:
        return jsonify({"error": "Unsupported file type. Only PDF and TXT files are supported."}), 400

    # Check if resume text extraction was successful and not empty
    if not resume_text.strip():
        return jsonify({"error": "Extracted resume text is empty. Cannot analyze."}), 400

    try:
        # --- Perform Analysis ---
        # 1. Extract Candidate Name
        candidate_name = extract_candidate_name(resume_text)

        # 2. Calculate Scores
        keyword_score_percent, semantic_score_percent = calculate_match_scores(job_description, resume_text)
        
        # Calculate overall score (e.g., average)
        overall_score = round(((keyword_score_percent + semantic_score_percent) / 2), 2)

        # 3. Extract Skills
        job_skills_set = extract_skills_from_text(job_description, COMMON_SKILLS)
        resume_skills_set = extract_skills_from_text(resume_text, COMMON_SKILLS)

        found_skills = sorted(list(job_skills_set.intersection(resume_skills_set)))
        missing_skills = sorted(list(job_skills_set.difference(resume_skills_set)))
        
        # --- Construct the JSON response ---
        results_data = {
            "results": [
                {
                    "id": 1, # Static ID for now, could be generated if multiple resumes are processed
                    "name": candidate_name,
                    "score": overall_score,
                    "breakdown": {
                        "keyword_score": keyword_score_percent,
                        "semantic_score": semantic_score_percent
                    },
                    "found_skills": found_skills,
                    "missing_skills": missing_skills
                }
            ]
        }
        
        return jsonify(results_data), 200

    except Exception as e:
        # Log the full error for debugging on the server side
        print(f"An unexpected error occurred during analysis: {e}")
        # Return a generic error to the client
        return jsonify({"error": "An error occurred during resume analysis."}), 500

@app.route('/', methods=['GET'])
def health_check():
    # Basic health check endpoint
    return jsonify({"status": "TalentFit AI Backend is running!"}), 200

if __name__ == '__main__':
    # Flask development server setup
    # host='0.0.0.0' makes the server accessible from any IP address on the network
    # debug=True enables auto-reloading and detailed error pages (useful for development)
    print("Starting Flask development server...")
    app.run(host='0.0.0.0', port=5000, debug=True)
