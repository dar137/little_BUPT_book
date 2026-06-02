from flask import Flask
from .config import Config
from .extensions import db, cors
from flask_cors import CORS

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(app, origins="*")
    
    db.init_app(app)

    cors.init_app(
        app,
        resources={r"/api/*": {"origins": "*"}},
        supports_credentials=True
    )

    from .routes.db_test import db_test_bp
    app.register_blueprint(db_test_bp, url_prefix="/api")

    return app