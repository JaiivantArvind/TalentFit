# 🧪 Testing Your Full-Stack Application

## Step-by-Step Testing Guide

### **Prerequisites:**
- ✅ Supabase `history` table created
- ✅ RLS policies enabled
- ✅ Frontend and Backend running
- ✅ Logged in to your account

---

## **Test 1: Run Your First Analysis**

### **Step 1: Go to Dashboard**
- Navigate to: http://localhost:5175/dashboard
- Make sure you're logged in

### **Step 2: Prepare Test Files**
You need:
1. **Resume file** (PDF, DOCX, or TXT)
2. **Job Description** (can paste text or upload file)

**Don't have test files?** Here's a quick job description to paste:

```
Senior Full-Stack Developer

We're looking for an experienced developer with:
- 5+ years of experience with JavaScript, React, and Node.js
- Strong knowledge of Python and Flask
- Experience with PostgreSQL databases
- Familiarity with REST APIs and authentication
- Git version control experience
- Cloud deployment knowledge (AWS, Heroku, or similar)
- Strong problem-solving skills
```

### **Step 3: Upload and Analyze**
1. Drag and drop a resume file (or click to upload)
2. Paste the job description above
3. Click **"Analyze Resumes"**
4. Wait for the results (should take 5-15 seconds)

### **Step 4: Check Console**
1. Open browser console (F12)
2. Look for these messages:
   - ✅ `"Analysis Results:"` (followed by data)
   - ✅ `"Analysis saved to history successfully!"`
   
**If you see errors instead:**
- 🔴 `"Error saving to history:"` → There's a problem with Supabase
- 🔴 Authentication errors → Check if you're logged in

---

## **Test 2: View History**

### **Step 1: Navigate to History Page**
- Click **"History"** in the navbar
- URL: http://localhost:5175/history

### **Step 2: What You Should See**

**If data saved successfully:**
```
┌──────────────────────────────────────────┐
│  📄 Job Analysis                         │
│  📅 Feb 14, 2026 at 11:05 AM            │
│                                          │
│  👥 Candidates: 1                        │
│  🏆 Top Score: 85%                       │
│  📈 Status: Completed                    │
│                                          │
│  [View Details]  [🗑️]                   │
└──────────────────────────────────────────┘
```

**If empty:**
```
No History Yet
Your past analyses will appear here...
[Start Analyzing]
```

---

## **Test 3: Check Supabase Directly**

If the History page is empty but you ran an analysis:

### **Step 1: Open Supabase Table Editor**
- Go to: https://supabase.com/dashboard/project/ccvyhwxecktlapzzetbm/editor
- Click on the **`history`** table

### **Step 2: Check for Records**
You should see rows with:
- `id` (UUID)
- `created_at` (timestamp)
- `user_id` (your user UUID)
- `job_title` (e.g., "Job Analysis")
- `candidate_count` (number)
- `top_match_score` (percentage)
- `results` (JSON data)

**If you see records:**
- ✅ Data is saving correctly
- ❌ Frontend might not be fetching correctly

**If you DON'T see records:**
- ❌ Data is not being saved
- Check browser console for errors

---

## **Test 4: Browser Console Debugging**

### **Open Console and Run:**

```javascript
// Check if user is logged in
console.log('Current user:', await (await fetch('/_supabase/auth/v1/user', {
  headers: { 'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}` }
})).json());

// Check what History page is fetching
const { data, error } = await window.supabase.from('history').select('*');
console.log('History data:', data);
console.log('History error:', error);
```

This will help identify if:
- User authentication is working
- Database queries are succeeding
- RLS policies are allowing access

---

## **Common Issues & Solutions**

### **Issue 1: "No History Yet" After Running Analysis**

**Possible Causes:**
1. Analysis failed to save
2. RLS policies blocking access
3. User not logged in properly

**Solution:**
1. Check browser console for errors
2. Verify you're logged in (should see user email in navbar area)
3. Re-run the SQL to create RLS policies
4. Try logging out and back in

---

### **Issue 2: Console Shows "Error saving to history"**

**Possible Causes:**
1. Supabase URL or key incorrect
2. RLS policies not created
3. Table structure mismatch

**Solution:**
1. Check `frontend/.env` has correct Supabase credentials
2. Re-run the `supabase_setup.sql` script
3. Verify table exists in Supabase dashboard

---

### **Issue 3: History Page Shows Loading Forever**

**Possible Causes:**
1. Supabase query failing
2. Network error

**Solution:**
1. Open browser console and look for errors
2. Check if Supabase is accessible (visit supabase.com)
3. Verify internet connection

---

### **Issue 4: Can See Data in Supabase But Not on History Page**

**Possible Causes:**
1. User IDs don't match
2. RLS policies too restrictive
3. Frontend query filtering wrong user

**Solution:**
1. Check `user_id` in Supabase table matches your logged-in user ID
2. Run this SQL to check:
```sql
SELECT id, email FROM auth.users;
-- Compare with user_id in history table
SELECT user_id, job_title FROM history;
```

---

## **Quick Verification Checklist**

Before asking for help, verify:

- [ ] Backend is running (http://localhost:5000/health returns 200)
- [ ] Frontend is running (http://localhost:5175 loads)
- [ ] Logged in successfully (can see protected pages)
- [ ] Supabase table exists and has correct structure
- [ ] RLS policies are enabled
- [ ] `.env` file has correct Supabase credentials
- [ ] Browser console shows no errors
- [ ] Ran at least one analysis after creating the table

---

## **Next Steps**

1. **Run a test analysis now**
2. **Check browser console for the success message**
3. **Go to History page and look for your record**
4. **If still empty, check Supabase Table Editor to see if data was saved**

Let me know what you see! 🚀
