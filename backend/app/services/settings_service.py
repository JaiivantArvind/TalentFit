from flask import g
from app.extensions import get_supabase_client
from app.config import Config

DEFAULT_SETTINGS = {
    'keyword_weight': 0.4,
    'semantic_weight': 0.6,
    'signature_name': '',
    'signature_role': '',
    'signature_company': ''
}

def get_user_settings(user_id, token=None):
    """
    Fetches settings for a user from user_configs table.
    Auto-creates default record if not found.
    Returns (data, error_string).
    """
    if not token:
        try:
            token = getattr(g, 'token', None)
        except Exception:
            token = None

    defaults = {
        'user_id': user_id,
        **DEFAULT_SETTINGS
    }

    supabase = get_supabase_client()
    if not supabase:
        return defaults, None

    try:
        if token:
            supabase.postgrest.auth(token)
        response = supabase.table('user_configs').select('*').eq('user_id', user_id).execute()
        if response.data and len(response.data) > 0:
            return response.data[0], None
        else:
            try:
                supabase.table('user_configs').insert(defaults).execute()
            except Exception as insert_err:
                print(f"[WARN] Default settings not yet persisted in user_configs: {insert_err}", flush=True)
            return defaults, None
    except Exception as e:
        print(f"[ERROR] Failed to get user settings: {e}", flush=True)
        return defaults, None
    finally:
        if token and Config.SUPABASE_KEY:
            try:
                supabase.postgrest.auth(Config.SUPABASE_KEY)
            except Exception:
                pass

def save_user_settings(user_id, incoming, token=None):
    """
    Upserts user settings to user_configs table using an allowlist pattern.
    Returns (data, error_string).
    """
    if not token:
        try:
            token = getattr(g, 'token', None)
        except Exception:
            token = None

    settings_payload = {
        'user_id': user_id,
        'keyword_weight': incoming.get('keyword_weight', 0.4),
        'semantic_weight': incoming.get('semantic_weight', 0.6),
        'signature_name': incoming.get('signature_name', ''),
        'signature_role': incoming.get('signature_role', ''),
        'signature_company': incoming.get('signature_company', '')
    }

    supabase = get_supabase_client()
    if not supabase:
        return settings_payload, None

    try:
        if token:
            supabase.postgrest.auth(token)
        response = (
            supabase
            .table('user_configs')
            .upsert(
                settings_payload,
                on_conflict='user_id',
                ignore_duplicates=False
            )
            .execute()
        )
        return response.data or settings_payload, None
    except Exception as e:
        print(f"[ERROR] Failed to save user settings: {e}", flush=True)
        return settings_payload, None
    finally:
        if token and Config.SUPABASE_KEY:
            try:
                supabase.postgrest.auth(Config.SUPABASE_KEY)
            except Exception:
                pass

