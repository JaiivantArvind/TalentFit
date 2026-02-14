# Enhanced Analysis Report Setup

## Google Gemini API Integration

To enable AI-powered resume analysis summaries, you'll need a Google Gemini API key.

### Getting Your API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy your API key

### Setting Up the API Key (Recommended Method)

#### Using .env File (Easiest):

1. Navigate to the `backend` folder
2. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Or on Windows:
   ```cmd
   copy .env.example .env
   ```
3. Open `.env` file and replace `your_gemini_api_key_here` with your actual API key:
   ```
   GEMINI_API_KEY=AIzaSyC...your_actual_key_here
   ```
4. Restart the backend server

**That's it!** The backend will automatically load the API key from the `.env` file using `python-dotenv`.

### Alternative: Environment Variable

If you prefer not to use a `.env` file, you can set the environment variable manually:

#### Windows (PowerShell):
```powershell
$env:GEMINI_API_KEY="your_actual_api_key_here"
```

#### Windows (Command Prompt):
```cmd
set GEMINI_API_KEY=your_actual_api_key_here
```

#### Linux/Mac:
```bash
export GEMINI_API_KEY="your_actual_api_key_here"
```

### Running Without API Key

If no API key is set, the analysis will still work but AI summaries will show:
"AI summary unavailable. Please set GEMINI_API_KEY environment variable."

You'll see this warning when starting the backend:
```
⚠️ GEMINI_API_KEY not set. AI summaries will be disabled.
   Get your API key from: https://makersuite.google.com/app/apikey
```

### Verification

When the API key is correctly configured, you'll see:
```
✅ Gemini API configured successfully!
```

## New Features

### 1. Detailed TF-IDF Analysis
- Shows keyword match score with percentage
- Lists top matched keywords from resume
- Displays match statistics (matched/total keywords)
- Explains what TF-IDF analysis found

### 2. Enhanced SBERT Semantic Analysis
- Shows semantic similarity score
- Displays embedding norms and dot product
- Explains contextual understanding beyond keywords

### 3. Correlation Explanation
- Shows how both scores combine (40% keyword + 60% semantic)
- Explains why this weighting provides better results

### 4. AI-Powered Summary (Requires API Key)
- Professional summary of why candidate matches
- Key strengths and gaps highlighted
- Match recommendation (Strong/Good/Moderate/Weak)
- Easy-to-understand language for recruiters

## Testing

1. Create `.env` file with your GEMINI_API_KEY
2. Start the backend: `python app.py`
3. Look for the success message: `✅ Gemini API configured successfully!`
4. Upload resumes through the frontend
5. View detailed analysis reports with AI summaries
