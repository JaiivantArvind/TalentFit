import json
from app.extensions import get_gemini_model

def generate_ai_summary(candidate_data, jd_text):
    """
    Generates a 2-sentence professional fit summary and standard recommendation label
    using gemini-2.5-flash, with a clean structured evaluation fallback.
    """
    score = candidate_data.get('score', 0)
    found_skills = candidate_data.get('found_skills', [])

    if score >= 70:
        rec = "Strong Match"
    elif score >= 40:
        rec = "Good Match"
    else:
        rec = "Weak Match"

    skills_text = ', '.join(found_skills[:4]) if found_skills else 'core technical requirements'
    fallback_summary = (
        f"Candidate demonstrates solid competence in {skills_text}, achieving an overall role match score of {score}%. "
        f"Recommendation: {rec}"
    )

    model = get_gemini_model()
    if not model:
        return fallback_summary

    try:
        prompt = f"""Analyze this candidate for the job role below.

Job Description (excerpt): {jd_text[:300]}
Overall Match Score: {score}%
Matched Skills: {', '.join(found_skills[:8])}

Write a 2-sentence professional summary of the candidate's fit.
Then output a single Recommendation label using EXACTLY these thresholds:
- Score >= 70%  -> Recommendation: Strong Match
- Score 40-69%  -> Recommendation: Good Match
- Score < 40%   -> Recommendation: Weak Match

Current score is {score}%, so apply the correct label."""
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        print(f"[WARN] Live AI summary unavailable ({e}), using structured evaluation.", flush=True)
        return fallback_summary

def generate_recruiting_email_text(candidate_name, job_title, missing_skills, resume_summary=''):
    """
    Generates a personalized recruiting email subject and body in JSON format.
    Falls back to a structured template if AI generation is unavailable.
    """
    skills_note = f" We would love to discuss your background and potential growth in {', '.join(missing_skills[:3])}." if missing_skills else ""
    fallback_data = {
        "subject": f"Interview Invitation: {job_title} Opportunity",
        "body": f"Hi {candidate_name},\n\nThank you for sharing your resume. We were impressed with your experience and qualifications for the {job_title} position.{skills_note}\n\nWe would love to schedule a brief 20-minute introductory conversation to learn more about your goals and share details about our team.\n\nPlease let us know what times work best for you this week.\n\nBest regards,\nRecruiting Team"
    }

    model = get_gemini_model()
    if not model:
        return fallback_data, None

    try:
        prompt = f"""Write a recruiting email to {candidate_name} for {job_title}.
Mention missing skills: {', '.join(missing_skills) if missing_skills else 'None'}.
Return ONLY valid JSON: {{"subject": "...", "body": "..."}}"""

        response = model.generate_content(prompt)
        text = response.text.replace('```json', '').replace('```', '').strip()
        data = json.loads(text)
        return data, None
    except Exception as e:
        print(f"[WARN] AI email generation unavailable ({e}), using personalized template.", flush=True)
        return fallback_data, None
