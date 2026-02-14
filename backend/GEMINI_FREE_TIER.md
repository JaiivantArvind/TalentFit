# 🎯 Gemini API Configuration Guide

## ✅ Current Configuration (Working)

Your TalentFit backend is now configured with the **`gemini-2.5-flash`** model, which is available in your API key.

---

## 📊 Model Information: `gemini-2.5-flash`

### Why gemini-2.5-flash?

This is the **latest fast model** available in your Gemini API:

| Feature | **gemini-2.5-flash** (✅ CURRENT) |
|---------|----------------------------------|
| **API Compatibility** | ✅ Works with your API key |
| **Speed** | ⚡ Ultra-fast |
| **Quality** | Excellent for AI summaries |
| **Status** | Latest generation |

### Available Models:
Your API key has access to these models (listed by `genai.list_models()`):
- ✅ `models/gemini-2.5-flash` (CURRENT - fast & efficient)
- `models/gemini-2.5-pro` (slower, more powerful)
- `models/gemini-2.0-flash` (previous generation)
- And many more specialized models

---

## 🛡️ Rate Limiting Protection

The backend includes a **1-second delay** between AI summary calls:

```python
# In app.py (line ~318)
ai_summary = generate_ai_summary(candidate_data, job_description)
candidate_data['ai_summary'] = ai_summary

# Rate limiting: Sleep 1 second to avoid hitting Gemini API limits
time.sleep(1)
```

### Rate Limit Info:
- Check your specific limits at: https://aistudio.google.com/app/apikey
- Free tier typically allows 15 RPM (requests per minute)
- Paid tier can go up to 360+ RPM

---

## 🔧 Configuration Details

### Current Setup in `backend/app.py`:

```python
# Line 22-27
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    # Use gemini-2.5-flash for fast, free tier performance
    gemini_model = genai.GenerativeModel('models/gemini-2.5-flash')
    print("[SUCCESS] Gemini API configured successfully! (Using gemini-2.5-flash)")
```

**Important:** The model name must include the `models/` prefix!

---

## ⚠️ What If You Hit the Limit?

### Symptoms:
- Backend logs show: `429 Too Many Requests`
- Frontend shows: "AI summary generation failed"

### Solutions:
1. **Wait 1 minute** (rate limit resets)
2. **Increase sleep time:** Change `time.sleep(1)` to `time.sleep(5)` in `app.py`
3. **Check your quota:** Visit https://aistudio.google.com/app/apikey
4. **Upgrade to Paid Tier** (if needed)

---

## 🚀 Model Naming Convention

### Correct Format:
```python
# ✅ CORRECT - includes "models/" prefix
gemini_model = genai.GenerativeModel('models/gemini-2.5-flash')

# ❌ WRONG - missing prefix (causes 404 error)
gemini_model = genai.GenerativeModel('gemini-2.5-flash')
```

### Why This Matters:
The `google.generativeai` package requires the full model path including the `models/` prefix.

---

## 🎉 Summary

✅ **Model:** `models/gemini-2.5-flash` (latest fast model)  
✅ **API Version:** v1beta (google.generativeai package)  
✅ **Rate Limiting:** 1-second delay between calls  
✅ **Status:** **Working and ready!**

---

## 🚦 Current Status

- ✅ Backend: Running on http://localhost:5000
- ✅ Gemini API: Configured with `gemini-2.5-flash`
- ✅ Model Available: Verified via `list_models()`
- ✅ AI Summaries: **Should work now!**

**Try uploading resumes to test the AI summaries!** 🚀


