from flask import Blueprint, request, jsonify
from app.services.ai_summary_service import generate_recruiting_email_text
from app.services.email_service import send_recruiting_email

email_bp = Blueprint('email', __name__)

@email_bp.route('/generate_email', methods=['POST'])
def generate_email():
    try:
        data = request.json or {}
        candidate_name = data.get('candidate_name', 'Candidate')
        job_title = data.get('job_title', 'Role')
        missing_skills = data.get('missing_skills', [])
        resume_summary = data.get('resume_summary', '')

        result, err = generate_recruiting_email_text(
            candidate_name, job_title, missing_skills, resume_summary
        )
        if err:
            return jsonify({'error': err}), 500

        return jsonify(result), 200
    except Exception as e:
        print(f"[ERROR] Generate email error: {e}", flush=True)
        return jsonify({'error': str(e)}), 500

@email_bp.route('/send-email', methods=['POST'])
def send_email():
    try:
        data = request.json or {}
        to_email = data.get('to_email')
        subject = data.get('subject')
        email_content = data.get('email_content')
        custom_key = data.get('resend_api_key')

        if not to_email or not subject or not email_content:
            return jsonify({'error': 'Missing required fields: to_email, subject, email_content'}), 400

        user_id = data.get('user_id')
        auth_header = request.headers.get('Authorization')
        if not user_id and auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
            try:
                from app.extensions import get_supabase_client
                supabase = get_supabase_client()
                if supabase:
                    user_resp = supabase.auth.get_user(token)
                    if user_resp and user_resp.user:
                        user_id = user_resp.user.id
            except Exception:
                pass

        response, err = send_recruiting_email(
            to_email=to_email,
            subject=subject,
            email_content=email_content,
            user_id=user_id,
            custom_resend_key=custom_key
        )
        if err:
            return jsonify({'error': err}), 500

        return jsonify({
            'success': True,
            'message': 'Email sent successfully',
            'email_id': response.get('id') if isinstance(response, dict) else str(response)
        }), 200

    except Exception as e:
        print(f"[ERROR] Send email error: {e}", flush=True)
        return jsonify({'error': f'Failed to send email: {str(e)}'}), 500
