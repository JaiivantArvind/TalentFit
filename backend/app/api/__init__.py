from app.api.health import health_bp
from app.api.analyze import analyze_bp
from app.api.email import email_bp
from app.api.settings import settings_bp

def register_blueprints(app):
    """Registers all API blueprints on the Flask app."""
    app.register_blueprint(health_bp)
    app.register_blueprint(analyze_bp)
    app.register_blueprint(email_bp)
    app.register_blueprint(settings_bp)
