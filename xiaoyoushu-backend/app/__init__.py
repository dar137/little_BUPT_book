import os

from flask import Flask, send_from_directory
from sqlalchemy import inspect, text

from app.config import Config
from app.extensions import db, cors


def ensure_user_review_columns(app):
    with app.app_context():
        inspector = inspect(db.engine)
        if "users" not in inspector.get_table_names():
            return

        columns = {column["name"] for column in inspector.get_columns("users")}
        statements = []

        if "review_status" not in columns:
            statements.append(
                "ALTER TABLE users ADD COLUMN review_status VARCHAR(32) NOT NULL DEFAULT 'APPROVED'"
            )
        if "student_card_url" not in columns:
            statements.append(
                "ALTER TABLE users ADD COLUMN student_card_url VARCHAR(512) NULL"
            )
        if "review_reject_reason" not in columns:
            statements.append(
                "ALTER TABLE users ADD COLUMN review_reject_reason VARCHAR(255) NULL"
            )

        for statement in statements:
            db.session.execute(text(statement))

        if statements:
            db.session.commit()


def create_app():
    app = Flask(__name__)

    app.config.from_object(Config)

    db.init_app(app)
    cors.init_app(app)

    ensure_user_review_columns(app)

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
