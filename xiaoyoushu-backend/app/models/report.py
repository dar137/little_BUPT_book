from datetime import datetime

from app.extensions import db


class Report(db.Model):
    __tablename__ = "reports"

    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)

    reporter_id = db.Column(
        db.BigInteger,
        db.ForeignKey("users.id"),
        nullable=False
    )

    target_type = db.Column(
        db.Enum("POST", "COMMENT", "USER"),
        nullable=False
    )

    target_id = db.Column(db.BigInteger, nullable=False)

    reason_type = db.Column(db.String(64), nullable=False)
    reason_detail = db.Column(db.String(512), nullable=True)

    status = db.Column(
        db.Enum(
            "PENDING",
            "PROCESSING",
            "ACCEPTED",
            "REJECTED",
            "CLOSED"
        ),
        nullable=False,
        default="PENDING"
    )

    handler_id = db.Column(
        db.BigInteger,
        db.ForeignKey("users.id"),
        nullable=True
    )

    handle_result = db.Column(db.String(512), nullable=True)
    handled_at = db.Column(db.DateTime, nullable=True)

    created_at = db.Column(
        db.DateTime,
        nullable=False,
        default=datetime.utcnow
    )

    updated_at = db.Column(
        db.DateTime,
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )

    reporter = db.relationship(
        "User",
        foreign_keys=[reporter_id],
        back_populates="reports"
    )

    handler = db.relationship(
        "User",
        foreign_keys=[handler_id]
    )