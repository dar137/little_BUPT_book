from datetime import datetime

from app.extensions import db


class ModerationRecord(db.Model):
    __tablename__ = "moderation_records"

    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    target_type = db.Column(db.Enum("POST", "COMMENT"), nullable=False)
    target_id = db.Column(db.BigInteger, nullable=False)
    submitter_id = db.Column(db.BigInteger, db.ForeignKey("users.id"), nullable=False)
    reviewer_id = db.Column(db.BigInteger, db.ForeignKey("users.id"), nullable=True)
    review_stage = db.Column(db.Enum("AI", "HUMAN"), nullable=False)
    ai_model = db.Column(db.String(128), nullable=True)
    ai_result = db.Column(db.Enum("PASS", "REJECT", "NEED_HUMAN"), nullable=True)
    risk_level = db.Column(db.Enum("NONE", "LOW", "MEDIUM", "HIGH"), nullable=True)
    confidence = db.Column(db.Numeric(5, 4), nullable=True)
    human_result = db.Column(
        db.Enum("PASS", "REJECT", "TAKE_DOWN", "RESTORE"),
        nullable=True
    )
    final_result = db.Column(
        db.Enum("PASS", "REJECT", "TAKE_DOWN", "RESTORE", "NEED_HUMAN"),
        nullable=True
    )
    reason = db.Column(db.String(512), nullable=True)
    raw_response = db.Column(db.JSON, nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    reviewed_at = db.Column(db.DateTime, nullable=True)
