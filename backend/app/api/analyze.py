import time
from flask import Blueprint, request, jsonify
from app.services.parser_service import extract_text, parse_email
from app.services.keyword_matcher import calculate_keyword_score, extract_skills
from app.services.semantic_matcher import calculate_semantic_score, check_seniority_bonus, get_overall_score
from app.services.ai_summary_service import generate_ai_summary

analyze_bp = Blueprint('analyze', __name__)

@analyze_bp.route('/analyze', methods=['POST'])
def analyze():
    try:
        jd_file = request.files.get('jd_file')
        jd_text = request.form.get('job_description', '')

        # Custom weights from frontend (defaulting to 0.5 / 0.5)
        try:
            k_weight = float(request.form.get('keyword_weight', 0.5))
            s_weight = float(request.form.get('semantic_weight', 0.5))
        except (ValueError, TypeError):
            k_weight, s_weight = 0.5, 0.5

        if jd_file:
            job_description = extract_text(jd_file)
        elif jd_text:
            job_description = jd_text
        else:
            return jsonify({'error': 'No Job Description provided'}), 400

        files = request.files.getlist('files')
        if not files:
            return jsonify({'error': 'No resume files provided'}), 400

        results = []

        for idx, file in enumerate(files):
            resume_text = extract_text(file)
            if not resume_text:
                continue

            k_res = calculate_keyword_score(resume_text, job_description)
            s_res = calculate_semantic_score(resume_text, job_description)

            k_score = k_res['score']
            s_score = s_res['score']

            seniority_bonus = check_seniority_bonus(resume_text)
            if seniority_bonus:
                print(f"[DEBUG] Seniority bonus applied for {file.filename}", flush=True)

            final_score = get_overall_score(k_score, s_score, k_weight, s_weight, seniority_bonus)
            found, missing = extract_skills(resume_text)

            candidate_data = {
                'id': idx,
                'filename': file.filename,
                'score': final_score,
                'email': parse_email(resume_text),
                'found_skills': found,
                'missing_skills': missing,
                'breakdown': {
                    'keyword': k_res,
                    'semantic': s_res
                }
            }

            candidate_data['ai_summary'] = generate_ai_summary(candidate_data, job_description)
            results.append(candidate_data)
            time.sleep(0.5)  # Rate limit safety for external embedding/LLM APIs

        results.sort(key=lambda x: x['score'], reverse=True)
        return jsonify({'results': results}), 200

    except Exception as e:
        print(f"[ERROR] Analyze Error: {e}", flush=True)
        return jsonify({'error': str(e)}), 500
