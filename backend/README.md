# Python Flask Backend for Resume Analyzer

## Overview
This backend uses **SBERT (Sentence-BERT)** and **TF-IDF** to analyze resumes against job descriptions.

## Tech Stack
- **Flask** - Web framework
- **Sentence Transformers** - Semantic similarity (SBERT model: `all-MiniLM-L6-v2`)
- **scikit-learn** - TF-IDF vectorization and cosine similarity
- **pypdf** - PDF text extraction
- **python-docx** - DOCX text extraction

## Installation

### 1. Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

This will download:
- Flask and Flask-CORS
- SBERT model (~80MB)
- scikit-learn, numpy
- PDF/DOCX parsers

### 2. Start the Server

#### Option A: Using the batch file (Windows)
```bash
start.bat
```

#### Option B: Directly with Python
```bash
python app.py
```

The server will start on `http://127.0.0.1:5000`

## API Endpoints

### `POST /analyze`
Analyzes resumes against a job description.

**Request:**
- Content-Type: `multipart/form-data`
- Fields:
  - `files`: Array of resume files (PDF or DOCX)
  - `job_description`: Text string of the job description

**Response:**
```json
{
  "results": [
    {
      "id": 1,
      "filename": "john_doe.pdf",
      "score": 85.5,
      "breakdown": {
        "keyword": 70.2,
        "semantic": 95.3
      },
      "found_skills": ["Python", "AWS", "Docker"],
      "missing_skills": ["React", "Java", "SQL", "TypeScript", "Node.js"]
    }
  ]
}
```

**Scoring Logic:**
- **Keyword Score (40%)**: TF-IDF based word overlap
- **Semantic Score (60%)**: SBERT cosine similarity
- **Final Score**: Weighted average

**Skills Checked:**
`Python, React, Java, SQL, AWS, Docker, TypeScript, Node.js`

### `GET /health`
Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "model": "all-MiniLM-L6-v2"
}
```

## File Structure
```
backend/
├── app.py              # Main Flask application
├── requirements.txt    # Python dependencies
├── start.bat          # Windows startup script
└── README.md          # This file
```

## Troubleshooting

### Port Already in Use
If port 5000 is occupied:
```python
# In app.py, change the last line to:
app.run(host='127.0.0.1', port=5001, debug=True)
```

### Model Download Issues
The SBERT model downloads automatically on first run. If it fails:
1. Check your internet connection
2. Try manually downloading:
```python
from sentence_transformers import SentenceTransformer
model = SentenceTransformer('all-MiniLM-L6-v2')
```

### CORS Errors
Ensure `flask-cors` is installed and the frontend is running on the correct port.

## Performance Notes
- **First request**: ~2-3 seconds (model loading)
- **Subsequent requests**: ~500ms per resume
- **Model size**: ~80MB in memory
- **Supports**: Batch processing of multiple resumes

## Development
To enable debug mode with auto-reload:
```python
app.run(host='127.0.0.1', port=5000, debug=True)
```

## Production Considerations
For production deployment:
1. Disable `debug=True`
2. Use a production WSGI server (gunicorn, waitress)
3. Add rate limiting
4. Implement authentication
5. Add input validation/sanitization
