from flask import Blueprint, request, jsonify, g
from app.utils.auth import require_auth
from app.services.settings_service import get_user_settings, save_user_settings

settings_bp = Blueprint('settings', __name__)

@settings_bp.route('/settings', methods=['GET'])
@require_auth
def get_settings(user_id):
    """Retrieve settings for the logged-in user from Supabase."""
    token = getattr(g, 'token', None)
    data, err = get_user_settings(user_id, token=token)
    if err:
        return jsonify({'error': err}), 500
    return jsonify(data), 200

@settings_bp.route('/settings', methods=['POST'])
@require_auth
def save_settings(user_id):
    """Save/update settings for the logged-in user in Supabase."""
    token = getattr(g, 'token', None)
    incoming = request.json or {}
    data, err = save_user_settings(user_id, incoming, token=token)
    if err:
        return jsonify({'error': err}), 500
    return jsonify({'message': 'Settings synced to cloud ☁️', 'data': data}), 200
