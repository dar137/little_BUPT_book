from datetime import datetime

from app.extensions import db


class Comment(db.Model):
    __tablename__ = "comments"

    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)

    post_id = db.Column(
        db.BigInteger,
        db.ForeignKey("posts.id"),
        nullable=False
    )

    user_id = db.Column(
        db.BigInteger,
        db.ForeignKey("users.id"),
        nullable=False
    )

    parent_id = db.Column(
        db.BigInteger,
        db.ForeignKey("comments.id"),
        nullable=True
    )

    content = db.Column(db.Text, nullable=False)

    status = db.Column(
        db.Enum(
            "PENDING_REVIEW",
            "PUBLISHED",
            "REJECTED",
            "TAKEN_DOWN",
            "DELETED"
        ),
        nullable=False,
        default="PENDING_REVIEW"
    )

    like_count = db.Column(db.BigInteger, nullable=False, default=0)

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

    deleted_at = db.Column(db.DateTime, nullable=True)

    post = db.relationship(
        "Post",
        back_populates="comments"
    )

    user = db.relationship(
        "User",
        back_populates="comments"
    )

    replies = db.relationship(
        "Comment",
        backref=db.backref("parent", remote_side=[id]),
        lazy=True
    )