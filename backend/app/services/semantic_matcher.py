import numpy as np
import google.generativeai as genai
from app.utils.constants import TARGET_SKILLS, SENIORITY_TERMS
from app.services.keyword_matcher import skill_present

def calculate_semantic_score(resume_text, job_desc):
    """
    Uses Gemini API embeddings for semantic similarity with Min-Max scaling.
    Raw cosine similarity from Gemini embeddings sits around 0.5 for unrelated
    text and 0.85-0.92 for strong matches, so we scale [0.5, 0.92] -> [60%, 95%]
    to produce a meaningful visible range.
    Falls back to a skill-breadth heuristic if the API is unavailable.
    """
    if resume_text.strip().lower() == job_desc.strip().lower():
        print("[DEBUG] Exact text match detected. Returning 100%", flush=True)
        return {'score': 100.0}

    try:
        # Truncate to stay within embedding API token limits
        resume_truncated = resume_text[:3000]
        job_truncated = job_desc[:3000]

        res_res = genai.embed_content(
            model="models/text-embedding-004",
            content=resume_truncated,
            task_type="clustering"
        )
        job_res = genai.embed_content(
            model="models/text-embedding-004",
            content=job_truncated,
            task_type="clustering"
        )

        res_vector = np.array(res_res['embedding']).reshape(1, -1)
        job_vector = np.array(job_res['embedding']).reshape(1, -1)

        norm_product = np.linalg.norm(res_vector) * np.linalg.norm(job_vector)
        if norm_product == 0:
            return {'score': 0.0}

        similarity = float(np.dot(res_vector, job_vector.T)[0][0] / norm_product)
        print(f"[DEBUG] Raw semantic similarity: {similarity:.4f}", flush=True)

        # Min-Max scaling: map similarity ranges to human-readable scores
        # > 0.92  -> 95-100% (near-perfect match)
        # 0.50-0.92 -> 60-95% (visible meaningful range)
        # < 0.50  -> 0-60%  (weak/unrelated)
        if similarity >= 0.92:
            score = 95.0 + ((similarity - 0.92) / 0.08) * 5.0
        elif similarity >= 0.50:
            score = 60.0 + ((similarity - 0.50) / (0.92 - 0.50)) * 35.0
        else:
            score = max(0.0, (similarity / 0.50) * 60.0)

        return {'score': round(score, 2)}

    except Exception as e:
        print(f"[ERROR] Error in semantic calculation: {e}", flush=True)
        # Intelligent fallback: estimate from resume's skill breadth (65–92%)
        skill_count = sum(1 for s in TARGET_SKILLS if skill_present(s, resume_text.lower()))
        fallback = min(92.0, max(65.0, 65.0 + (skill_count / len(TARGET_SKILLS)) * 27.0))
        print(f"[DEBUG] Semantic fallback (API unavailable): skill_count={skill_count} -> {fallback:.1f}%", flush=True)
        return {'score': round(fallback, 2)}

def check_seniority_bonus(resume_text):
    """Returns +5.0 if any seniority term is present in resume, otherwise 0.0."""
    resume_lower = resume_text.lower()
    return 5.0 if any(term in resume_lower for term in SENIORITY_TERMS) else 0.0

def get_overall_score(k_score, s_score, k_weight=0.5, s_weight=0.5, seniority_bonus=0.0):
    """
    Overall Match = (Keyword * k_weight) + (Semantic * s_weight) + seniority_bonus.
    If one component is 0 (API failure / empty text), uses only the valid score.
    Result rounded to 1 decimal place, capped at 100.0%.
    """
    if k_score == 0.0 and s_score > 0.0:
        base = s_score
    elif s_score == 0.0 and k_score > 0.0:
        base = k_score
    else:
        base = (k_score * k_weight) + (s_score * s_weight)
    return round(min(100.0, base + seniority_bonus), 1)
