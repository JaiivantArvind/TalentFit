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

def get_candidate_resend_keys(user_id=None, custom_key=None):
    """
    Gathers and prioritizes candidate Resend API keys:
    1. Explicit custom key (if provided)
    2. Supabase app_config (Cloud verified source of truth)
    3. User profile config in Supabase user_configs
    4. Local .env file
    5. Environment variable
    """
    candidates = []

    if custom_key and is_valid_resend_key(custom_key):
        candidates.append(custom_key.strip())

    # 1. Supabase app_config (Central cloud store accessible by Render & local)
    try:
        from app.extensions import get_supabase_client
        sb = get_supabase_client()
        if sb:
            res = sb.table('app_config').select('value').eq('key', 'resend_api_key').execute()
            if res.data and len(res.data) > 0:
                val = (res.data[0].get('value') or '').strip()
                if is_valid_resend_key(val):
                    candidates.append(val)
    except Exception as e:
        print(f"[WARN] Supabase app_config fetch skipped: {e}", flush=True)

    # 2. Supabase user_configs (User-specific custom key)
    if user_id:
        try:
            from app.extensions import get_supabase_client
            sb = get_supabase_client()
            if sb:
                res = sb.table('user_configs').select('resend_api_key').eq('user_id', user_id).execute()
                if res.data and len(res.data) > 0:
                    val = (res.data[0].get('resend_api_key') or '').strip()
                    if is_valid_resend_key(val):
                        candidates.append(val)
        except Exception:
            pass

    # 3. Local .env file
    try:
        env_file = find_dotenv()
        if env_file:
            vals = dotenv_values(env_file)
            val = (vals.get('RESEND_API_KEY', '') or '').strip()
            if is_valid_resend_key(val):
                candidates.append(val)
    except Exception:
        pass

    # 4. OS environment variable
    env_val = os.getenv('RESEND_API_KEY', '').strip()
    if is_valid_resend_key(env_val):
        candidates.append(env_val)

    # Deduplicate while preserving priority order
    seen = set()
    unique_candidates = []
    for k in candidates:
        if k not in seen:
            seen.add(k)
            unique_candidates.append(k)

    return unique_candidates

def get_current_resend_key(user_id=None):
    candidates = get_candidate_resend_keys(user_id=user_id)
    return candidates[0] if candidates else ''

def send_recruiting_email(to_email, subject, email_content, user_id=None, custom_resend_key=None):
    """
    Sends an email using Resend API.
    Tries candidates in priority order, recovering gracefully if an environment key is invalid.
    Returns (response_data, error_string).
    """
    candidate_keys = get_candidate_resend_keys(user_id=user_id, custom_key=custom_resend_key)
    if not candidate_keys:
        return None, (
            "Resend API key is not configured or using placeholder. "
            "Please add a valid RESEND_API_KEY (starts with 're_') in Settings or backend/.env, "
            "or use 'Send via Gmail Instead' to send directly."
        )

    last_error = None
    for key in candidate_keys:
        try:
            print(f"[INFO] Attempting email send via Resend (key prefix: {key[:6]}...)...", flush=True)
            resend.api_key = key
            response = resend.Emails.send({
                "from": "onboarding@resend.dev",
                "to": to_email,
                "subject": subject,
                "html": email_content
            })
            print(f"[SUCCESS] Email sent successfully via Resend: {response}", flush=True)
            return response, None
        except Exception as e:
            err_msg = str(e)
            print(f"[WARN] Resend attempt failed with key {key[:6]}...: {err_msg}", flush=True)
            last_error = err_msg

            # If the error is specifically invalid key / 401 unauthorized, try next candidate key
            if "invalid" in err_msg.lower() or "401" in err_msg:
                continue

            # Free-tier sandbox restriction
            if "testing emails" in err_msg.lower() or "validation_error" in err_msg.lower() or "403" in err_msg:
                return None, (
                    f"{err_msg}. Note: Resend free tier only allows sending to your verified account email. "
                    "Please use 'Send via Gmail Instead' to deliver directly to this candidate."
                )

            # Other fatal error
            return None, err_msg

    return None, f"Failed to send email: {last_error or 'API key is invalid'}"
