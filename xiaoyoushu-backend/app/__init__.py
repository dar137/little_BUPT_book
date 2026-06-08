import os

from flask import Flask, send_from_directory

from app.config import Config
from app.extensions import db, cors


def create_app():
    app = Flask(__name__)

    app.config.from_object(Config)

    db.init_app(app)
    cors.init_app(app)

    from app.routes.users import user_bp
    from app.routes.posts import post_bp
    from app.routes.comments import comment_bp
    from app.routes.reports import report_bp
    from app.routes.upload import upload_bp
    from app.routes.admin import admin_bp

    app.register_blueprint(user_bp)
    app.register_blueprint(post_bp)
    app.register_blueprint(comment_bp)
    app.register_blueprint(report_bp)
    app.register_blueprint(upload_bp)
    app.register_blueprint(admin_bp)

    @app.route("/uploads/<path:filename>")
    def uploaded_file(filename):
        upload_root = os.path.join(app.root_path, "..", "uploads")
        return send_from_directory(upload_root, filename)

    return app