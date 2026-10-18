from flask import Flask
from flask_cors import CORS
from app.config import Config
from app.api import register_blueprints

def create_app(config_class=Config):
    """
    Flask Application Factory.
    Initializes Flask, CORS, and registers API blueprints.
    """
    app = Flask(__name__)
    app.config.from_object(config_class)

    # CORS configuration matching frontend development and deployment requirements
    CORS(
        app,
        resources={r"/*": {"origins": "*"}},
        supports_credentials=True,
        allow_headers=["Content-Type", "Authorization", "x-client-info", "apikey"]
    )

    # Register routes
    register_blueprints(app)

    return app

# Default application instance for WSGI runners (e.g. gunicorn app:app)
app = create_app()
