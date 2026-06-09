from datetime import datetime

from app.extensions import db


class BehaviorEvent(db.Model):
    __tablename__ = "behavior_events"

    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    user_id = db.Column(db.BigInteger, db.ForeignKey("users.id"), nullable=True)
    event_type = db.Column(
        db.Enum(
            "LOGIN",
            "LOGOUT",
            "VIEW_POST",
            "CREATE_POST",
            "LIKE_POST",
            "COMMENT_POST",
            "FAVORITE_POST",
            "SEARCH",
            "REPORT",
            "FOLLOW"
        ),
        nullable=False
    )
    target_type = db.Column(
        db.Enum("POST", "COMMENT", "USER", "SEARCH", "SYSTEM"),
        nullable=True
    )
    target_id = db.Column(db.BigInteger, nullable=True)
    search_keyword = db.Column(db.String(255), nullable=True)
    session_id = db.Column(db.String(128), nullable=True)
    ip_address = db.Column(db.String(64), nullable=True)
    user_agent = db.Column(db.String(512), nullable=True)
    extra = db.Column(db.JSON, nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
