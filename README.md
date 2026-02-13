# 🎯 AI-Powered Resume Analyzer

An intelligent resume screening application that uses AI to match resumes against job descriptions. Built with Python (Flask + SBERT) for the backend and React for the frontend.

## ✨ Features

- **AI-Powered Matching**: Uses Sentence-BERT for semantic understanding and TF-IDF for keyword matching
- **Multi-Format Support**: Accepts PDF, DOCX, and TXT files
- **Skill Extraction**: Automatically identifies 35+ technical skills
- **Real-Time Analysis**: Fast processing with optimized model loading
- **Dual Scoring System**: 
  - Keyword Score (40%): Exact term matching
  - Semantic Score (60%): Contextual understanding
- **Visual Results**: Color-coded skill chips (green for found, red for missing)

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd T-2
   ```

2. **Backend Setup**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   ```

### Running the Application

**Terminal 1: Start Backend**
```bash
cd backend
python app.py
```
Backend runs on: `http://127.0.0.1:5000`

**Terminal 2: Start Frontend**
```bash
cd frontend
npm run dev
```
Frontend runs on: `http://localhost:5173` (or next available port)

### Usage

1. Open `http://localhost:5173` in your browser
2. Upload one or more resumes (PDF, DOCX, or TXT)
3. Paste the job description
4. Click "Analyze"
5. View match scores and skill breakdowns

## 📊 Scoring System

**Final Score = (Keyword Score × 0.4) + (Semantic Score × 0.6)**

- **Keyword Score**: TF-IDF cosine similarity for exact term matching
- **Semantic Score**: SBERT embeddings for contextual understanding

### Example Interpretation:
- **80-100%**: Excellent match
- **60-79%**: Good match with some gaps
- **40-59%**: Moderate match, significant skills missing
- **0-39%**: Poor match

## 🛠️ Tech Stack

### Backend
- **Flask**: Web framework
- **Sentence Transformers**: SBERT model (`all-MiniLM-L6-v2`)
- **scikit-learn**: TF-IDF vectorization
- **pypdf**: PDF text extraction
- **python-docx**: DOCX text extraction

### Frontend
- **React 18**: UI framework
- **Vite**: Build tool
- **Tailwind CSS**: Styling
- **Axios**: HTTP client

## 🎯 Tracked Skills

The system identifies 35+ skills including:
- **Languages**: Python, Java, JavaScript, TypeScript
- **Frameworks**: React, Node.js, Flask, Django, Spring Boot, Angular, Vue
- **Databases**: SQL, PostgreSQL, MongoDB, Redis, MySQL
- **Cloud/DevOps**: AWS, Azure, GCP, Docker, Kubernetes, Jenkins, CI/CD
- **Other**: Machine Learning, AI, GraphQL, REST API, Git, Agile, Scrum

## ⚡ Performance

- **Startup Time**: ~1 second (lazy model loading)
- **First Request**: ~30 seconds (model initialization)
- **Subsequent Requests**: ~2-3 seconds per resume
- **Memory Usage**: ~300MB

## 📝 API Reference

### POST `/analyze`

**Request:**
```javascript
const formData = new FormData();
formData.append('files', resumeFile);
formData.append('job_description', jobDescriptionText);
```

**Response:**
```json
{
  "results": [
    {
      "id": 1,
      "filename": "resume.pdf",
      "score": 75.5,
      "breakdown": {
        "keyword": 68.2,
        "semantic": 80.1
      },
      "found_skills": ["Python", "AWS", "Docker"],
      "missing_skills": ["React", "TypeScript"]
    }
  ]
}
```

### GET `/health`

**Response:**
```json
{
  "status": "healthy",
  "model": "all-MiniLM-L6-v2"
}
```

## 🔧 Configuration

### Backend (app.py)
- **Port**: Change `port=5000` in `app.run()`
- **Weights**: Adjust `keyword * 0.4` and `semantic * 0.6` ratios
- **Skills**: Modify `SKILL_KEYWORDS` list
- **Text Limit**: Change `[:500]` in `calculate_semantic_score()`

### Frontend (src/App.jsx)
- **Backend URL**: Update `http://localhost:5000/analyze` if port changes

## 📄 License

MIT License - Feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues or questions, please open an issue on GitHub.

---

**Built with ❤️ using Python and React**
