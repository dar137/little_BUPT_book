from datetime import datetime

from app.extensions import db


class Post(db.Model):
    __tablename__ = "posts"

    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)

    user_id = db.Column(
        db.BigInteger,
        db.ForeignKey("users.id"),
        nullable=False
    )

    category_id = db.Column(
        db.BigInteger,
        db.ForeignKey("categories.id"),
        nullable=True
    )

    title = db.Column(db.String(128), nullable=True)
    content = db.Column(db.Text, nullable=False)

    content_type = db.Column(
        db.Enum(
            "TEXT",
            "IMAGE_TEXT",
            "QUESTION",
            "LOST_FOUND",
            "PARTNER",
            "SHARE"
        ),
        nullable=False,
        default="TEXT"
    )

    status = db.Column(
        db.Enum(
            "DRAFT",
            "PENDING_REVIEW",
            "PUBLISHED",
            "REJECTED",
            "TAKEN_DOWN",
            "DELETED"
        ),
        nullable=False,
        default="PENDING_REVIEW"
    )

    view_count = db.Column(db.BigInteger, nullable=False, default=0)
    like_count = db.Column(db.BigInteger, nullable=False, default=0)
    comment_count = db.Column(db.BigInteger, nullable=False, default=0)
    favorite_count = db.Column(db.BigInteger, nullable=False, default=0)

    published_at = db.Column(db.DateTime, nullable=True)

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

    user = db.relationship(
        "User",
        back_populates="posts"
    )

    category = db.relationship(
        "Category",
        back_populates="posts"
    )

    images = db.relationship(
        "PostImage",
        back_populates="post",
        cascade="all, delete-orphan",
        lazy=True
    )

    comments = db.relationship(
        "Comment",
        back_populates="post",
        cascade="all, delete-orphan",
        lazy=True
    )

    likes = db.relationship(
        "PostLike",
        back_populates="post",
        cascade="all, delete-orphan",
        lazy=True
    )

    favorites = db.relationship(
        "PostFavorite",
        back_populates="post",
        cascade="all, delete-orphan",
        lazy=True
    )


class PostImage(db.Model):
    __tablename__ = "post_images"

    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)

    post_id = db.Column(
        db.BigInteger,
        db.ForeignKey("posts.id"),
        nullable=False
    )

    image_url = db.Column(db.String(512), nullable=False)
    storage_key = db.Column(db.String(255), nullable=True)
    mime_type = db.Column(db.String(64), nullable=True)
    file_size = db.Column(db.BigInteger, nullable=True)
    sort_order = db.Column(db.Integer, nullable=False, default=0)

    created_at = db.Column(
        db.DateTime,
        nullable=False,
        default=datetime.utcnow
    )

    post = db.relationship(
        "Post",
        back_populates="images"
    )


class PostLike(db.Model):
    __tablename__ = "post_likes"

    post_id = db.Column(
        db.BigInteger,
        db.ForeignKey("posts.id"),
        primary_key=True,
        nullable=False
    )

    user_id = db.Column(
        db.BigInteger,
        db.ForeignKey("users.id"),
        primary_key=True,
        nullable=False
    )

    created_at = db.Column(
        db.DateTime,
        nullable=False,
        default=datetime.utcnow
    )

    post = db.relationship(
        "Post",
        back_populates="likes"
    )

    user = db.relationship(
        "User",
        back_populates="post_likes"
    )


class PostFavorite(db.Model):
    __tablename__ = "post_favorites"

    post_id = db.Column(
        db.BigInteger,
        db.ForeignKey("posts.id"),
        primary_key=True,
        nullable=False
    )

    user_id = db.Column(
        db.BigInteger,
        db.ForeignKey("users.id"),
        primary_key=True,
        nullable=False
    )

    created_at = db.Column(
        db.DateTime,
        nullable=False,
        default=datetime.utcnow
    )

    post = db.relationship(
        "Post",
        back_populates="favorites"
    )

    user = db.relationship(
        "User",
        back_populates="post_favorites"
    )