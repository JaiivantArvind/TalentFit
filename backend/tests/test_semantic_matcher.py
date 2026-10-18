from app.services.semantic_matcher import (
    calculate_semantic_score, check_seniority_bonus, get_overall_score
)

def test_exact_match_score():
    text = "Full Stack Engineer with React and Python"
    res = calculate_semantic_score(text, text)
    assert res['score'] == 100.0

def test_seniority_bonus():
    assert check_seniority_bonus("Senior Software Engineer with 8 years") == 5.0
    assert check_seniority_bonus("Principal Architect at Cloud Corp") == 5.0
    assert check_seniority_bonus("Junior Developer fresh graduate") == 0.0

def test_overall_score_math():
    # 50/50 split
    score = get_overall_score(k_score=80.0, s_score=90.0, k_weight=0.5, s_weight=0.5, seniority_bonus=0.0)
    assert score == 85.0

    # With seniority bonus
    score_senior = get_overall_score(k_score=80.0, s_score=90.0, k_weight=0.5, s_weight=0.5, seniority_bonus=5.0)
    assert score_senior == 90.0

    # Score should cap at 100.0
    score_cap = get_overall_score(k_score=98.0, s_score=99.0, k_weight=0.5, s_weight=0.5, seniority_bonus=5.0)
    assert score_cap == 100.0
