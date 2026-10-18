from flask import Blueprint, jsonify

health_bp = Blueprint('health', __name__)

@health_bp.route('/', methods=['GET'])
def home():
    """Health check endpoint for Render and ping monitors."""
    return jsonify({
        "status": "healthy",
        "service": "TalentFit Backend",
        "version": "1.0.0"
    }), 200

@health_bp.route('/test', methods=['GET'])
def test_route():
    return jsonify({"message": "Test successful!"}), 200
