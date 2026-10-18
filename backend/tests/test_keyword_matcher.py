from app.services.keyword_matcher import (
    normalize, skill_present, calculate_keyword_score, extract_skills
)

def test_normalize_and_aliases():
    assert normalize("Node.js") == "node.js"
    assert normalize("nodejs") == "node.js"
    assert normalize("golang") == "go"
    assert normalize("Postgres") == "postgresql"

def test_skill_present():
    text = "We build high performance backends using Node.js, Python, and PostgreSQL."
    assert skill_present("Python", text) is True
    assert skill_present("node.js", text) is True
    assert skill_present("nodejs", text) is True
    assert skill_present("postgresql", text) is True
    assert skill_present("postgres", text) is True
    assert skill_present("Rust", text) is False

def test_calculate_keyword_score_floor():
    # 5 skills present should trigger minimum 60% floor
    resume = "Experienced in Python, Java, Docker, Kubernetes, and AWS."
    jd = "Looking for an engineer skilled in Go, Ruby, and Scala."
    result = calculate_keyword_score(resume, jd)
    assert result['score'] >= 60.0

def test_calculate_keyword_score_empty():
    result = calculate_keyword_score("", "")
    assert result['score'] == 0.0

def test_extract_skills():
    resume = "Skills: Python, React, Docker, Linux, Git."
    found, missing = extract_skills(resume)
    assert "Python" in found
    assert "React" in found
    assert "Docker" in found
    assert "Spring Boot" in missing
