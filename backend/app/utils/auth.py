from functools import wraps
from flask import request, jsonify, g
from app.extensions import get_supabase_client

def require_auth(f):
    """
    Decorator for endpoints requiring Supabase JWT authentication.
    Passes user_id as first argument to the decorated function.
    Stores user_id and token in flask.g for downstream service use.
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({'error': 'No authorization header provided'}), 401
        
        if not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Invalid authorization format'}), 401

        token = auth_header.split('Bearer ')[1].strip()
        supabase = get_supabase_client()
        if not supabase:
            return jsonify({'error': 'Database service unavailable'}), 500

        try:
            user = supabase.auth.get_user(token)
            user_id = user.user.id
            if not user_id:
                return jsonify({'error': 'Invalid token - no user ID found'}), 401
        except Exception as auth_error:
            print(f"[DEBUG] Auth verification failed: {auth_error}", flush=True)
            return jsonify({'error': 'Invalid or expired token'}), 401

        g.user_id = user_id
        g.token = token

        return f(user_id, *args, **kwargs)
    return decorated_function
