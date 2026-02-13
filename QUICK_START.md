# 🚀 Quick Start Guide - Resume Analyzer

## ✅ Setup Complete!

Your Python backend has been successfully created with:
- ✅ Flask server with CORS enabled
- ✅ SBERT (Sentence Transformers) for semantic analysis
- ✅ TF-IDF for keyword matching
- ✅ PDF & DOCX support
- ✅ Skill extraction

---

## 🎯 How to Start

### **Terminal 1: Backend (Python)**
```bash
cd backend
start.bat
```
✨ Wait for "Loading SBERT model..." to complete (~10 seconds)
📍 Backend runs on: `http://127.0.0.1:5000`

### **Terminal 2: Frontend (React)**
```bash
cd frontend
npm run dev
```
📍 Frontend runs on: `http://localhost:5173`

---

## 🧪 Test It

1. Open `http://localhost:5173` in your browser
2. Upload a resume (PDF or DOCX)
3. Paste a job description
4. Click "Analyze"
5. See the magic happen! ✨

---

## 📊 What You'll Get

- **Overall Match Score** (0-100%)
- **Breakdown**: Keyword (40%) + Semantic (60%)
- **Skills Found**: Green chips
- **Skills Missing**: Red chips

---

## 🔧 Tech Stack

**Backend:**
- Flask (Python web framework)
- SBERT (`all-MiniLM-L6-v2`) - 80MB AI model
- scikit-learn (TF-IDF)
- pypdf, python-docx

**Frontend:**
- React + Vite
- Tailwind CSS
- Axios

---

## 🐛 Troubleshooting

### Backend won't start?
```bash
cd backend
pip install -r requirements.txt
python --version  # Should be 3.8+
```

### Frontend can't connect?
Check that:
1. Backend is running on port 5000
2. No CORS errors in browser console
3. `App.jsx` points to `http://localhost:5000/analyze`

### "Model not found" error?
First run downloads the SBERT model (~80MB). Ensure internet connection.

---

## 📝 API Endpoint

**POST** `http://127.0.0.1:5000/analyze`

**Request:**
```javascript
const formData = new FormData();
formData.append('files', resumeFile);
formData.append('job_description', jdText);
```

**Response:**
```json
{
  "results": [{
    "filename": "resume.pdf",
    "score": 85,
    "breakdown": { "keyword": 70, "semantic": 95 },
    "found_skills": ["Python", "AWS"],
    "missing_skills": ["React"]
  }]
}
```

---

## 🎉 You're All Set!

Python's AI libraries > Node.js for NLP. You made the right choice! 🐍✨
