import re
from app.utils.constants import TARGET_SKILLS, SKILL_KEYWORDS, SKILL_ALIASES

def normalize(text):
    """Lowercase, strip punctuation variants, collapse whitespace, map aliases."""
    text = text.lower().strip()
    text = re.sub(r'[\.\-/]', '', text)
    text = re.sub(r'\s+', ' ', text)
    return SKILL_ALIASES.get(text, text)

def skill_present(skill, text):
    """
    Return True if `skill` (or a known alias) appears in `text`.
    Robustly handles case-insensitivity, punctuation variations (Node.js/Nodejs/Node js),
    and mapped skill aliases.
    """
    if not skill or not text:
        return False

    text_lower = text.lower()
    skill_lower = skill.lower()

    # Direct case-insensitive substring check
    if skill_lower in text_lower:
        return True

    # Punctuation/whitespace stripped comparison (e.g., 'nodejs' vs 'node.js')
    norm_skill = re.sub(r'[\.\-/\s]', '', skill_lower)
    norm_text = re.sub(r'[\.\-/\s]', '', text_lower)
    if norm_skill and norm_skill in norm_text:
        return True

    # Canonical alias check
    canonical = SKILL_ALIASES.get(norm_skill)
    if canonical:
        norm_canonical = re.sub(r'[\.\-/\s]', '', canonical)
        if norm_canonical in norm_text:
            return True

    # Reverse alias check: check if any alias for this skill appears in text
    for alias_key, alias_target in SKILL_ALIASES.items():
        if alias_target == skill_lower or re.sub(r'[\.\-/\s]', '', alias_target) == norm_skill:
            if alias_key in norm_text:
                return True

    return False

def calculate_keyword_score(resume_text, jd_text):
    """
    Set-based keyword matching.
    Score = (all TARGET_SKILLS found in resume) / required_count * 100
      - all_found: every TARGET_SKILL present in resume
      - required_count: max(JD skill count, 10)
    Floor: 5+ skills found in resume -> minimum 60%.
    """
    try:
        if not resume_text.strip() or not jd_text.strip():
            return {'score': 0.0, 'matched_keywords': [], 'missing_keywords': []}

        resume_lower = resume_text.lower()
        jd_lower = jd_text.lower()

        jd_required = [s for s in TARGET_SKILLS if skill_present(s, jd_lower)]
        all_found = [s for s in TARGET_SKILLS if skill_present(s, resume_lower)]

        jd_matched = [s for s in jd_required if skill_present(s, resume_lower)]
        jd_missing = [s for s in jd_required if not skill_present(s, resume_lower)]

        required_count = max(len(jd_required), 10)
        score = min(100.0, (len(all_found) / required_count) * 100)

        if len(all_found) >= 5:
            score = max(score, 60.0)

        print(
            f"[DEBUG] Keyword: {len(all_found)} resume skills / "
            f"{required_count} required -> {score:.1f}%", flush=True
        )

        return {
            'score': round(score, 1),
            'matched_keywords': (jd_matched or all_found)[:10],
            'missing_keywords': jd_missing[:5]
        }
    except Exception as e:
        print(f"Keyword score error: {e}", flush=True)
        return {'score': 0.0, 'matched_keywords': [], 'missing_keywords': []}

def extract_skills(text):
    """Extract found and missing skills against the base SKILL_KEYWORDS list."""
    text_lower = text.lower()
    found = [skill for skill in SKILL_KEYWORDS if skill_present(skill, text_lower)]
    missing = [skill for skill in SKILL_KEYWORDS if skill not in found]
    return found, missing
