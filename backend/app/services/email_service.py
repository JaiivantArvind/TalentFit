import os
import resend
from dotenv import dotenv_values, find_dotenv
from app.config import Config

def is_valid_resend_key(key):
    if not key or not isinstance(key, str):
        return False
    clean_key = key.strip()
    if clean_key.startswith('your_') or 'placeholder' in clean_key:
        return False
    return clean_key.startswith('re_')

def get_current_resend_key():
    key = os.getenv('RESEND_API_KEY', '')
    if not is_valid_resend_key(key):
        env_file = find_dotenv()
        if env_file:
            vals = dotenv_values(env_file)
            key = vals.get('RESEND_API_KEY', key) or ''
    return key.strip() if key else ''

def send_recruiting_email(to_email, subject, email_content):
    """
    Sends an email using Resend API.
    Returns (response_data, error_string).
    """
    resend_key = get_current_resend_key()
    if not is_valid_resend_key(resend_key):
        return None, (
            "Resend API key is not configured or using placeholder. "
            "Please add a valid RESEND_API_KEY (starts with 're_') in backend/.env, "
            "or use 'Open in Gmail' / 'Default App' to send directly."
        )

    try:
        print(f"[INFO] Sending email to: {to_email}", flush=True)
        print(f"[INFO] Subject: {subject}", flush=True)

        resend.api_key = resend_key
        response = resend.Emails.send({
            "from": "onboarding@resend.dev",
            "to": to_email,
            "subject": subject,
            "html": email_content
        })

        print(f"[SUCCESS] Email sent! Response: {response}", flush=True)
        return response, None
    except Exception as e:
        print(f"[ERROR] Failed to send email via Resend: {e}", flush=True)
        return None, str(e)
