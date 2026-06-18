from datetime import datetime

from app.extensions import db

class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    student_no = db.Column(db.String(32), nullable=False, unique=True)
    password_hash = db.Column(db.String(255), nullable=False)
    nickname = db.Column(db.String(64), nullable=False)
    avatar_url = db.Column(db.String(512), nullable=True)

    email = db.Column(db.String(128), nullable=True)
    phone = db.Column(db.String(32), nullable=True)

    role = db.Column(
        db.Enum("USER", "ADMIN"),
        nullable=False,
        default="USER"
    )

    status = db.Column(
        db.Enum("NORMAL", "MUTED", "BANNED", "DELETED"),
        nullable=False,
        default="NORMAL"
    )

    mute_until = db.Column(db.DateTime, nullable=True)
    bio = db.Column(db.String(255), nullable=True)
    last_login_at = db.Column(db.DateTime, nullable=True)

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

    posts = db.relationship(
        "Post",
        back_populates="user",
        lazy=True
    )

    comments = db.relationship(
        "Comment",
        back_populates="user",
        lazy=True
    )

    post_likes = db.relationship(
        "PostLike",
        back_populates="user",
        lazy=True
    )

    post_favorites = db.relationship(
        "PostFavorite",
        back_populates="user",
        lazy=True
    )

    reports = db.relationship(
        "Report",
        foreign_keys="Report.reporter_id",
        back_populates="reporter",
        lazy=True
    )