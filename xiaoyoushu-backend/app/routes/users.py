import os
import uuid

from flask import Blueprint, current_app, request
from werkzeug.utils import secure_filename
import re

from app import db
from app.models.user import User
from app.models.post import Post, PostFavorite, PostImage, PostLike
from app.models.comment import Comment
from app.models.behavior_event import BehaviorEvent
from app.utils.response import success, fail
from app.utils.password import hash_password, verify_password
from app.utils.jwt import generate_token, login_required


ALLOWED_CARD_EXTENSIONS = {"jpg", "jpeg", "png", "webp"}


def allowed_card_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_CARD_EXTENSIONS


PRICE_MARKER_PATTERN = re.compile(r"\n*<!--ESTIMATED_PRICE:([^>]+)-->\s*$")


def split_content_meta(content):
    if not content:
        return "", None

    match = PRICE_MARKER_PATTERN.search(content)
    if not match:
        return content, None

    return PRICE_MARKER_PATTERN.sub("", content).rstrip(), match.group(1)


def format_user_post(post):
    content, estimated_price = split_content_meta(post.content)
    first_image = (
        PostImage.query
        .filter_by(post_id=post.id)
        .order_by(PostImage.sort_order.asc())
        .first()
    )

    return {
        "id": post.id,
        "title": post.title,
        "summary": content[:100] if content else "",
        "coverImage": first_image.image_url if first_image else None,
        "author": {
            "id": post.user.id,
            "nickname": post.user.nickname,
            "avatar": post.user.avatar_url,
            "role": post.user.role
        },
        "category": post.category.name if post.category else None,
        "estimatedPrice": estimated_price,
        "contentType": post.content_type,
        "status": post.status,
        "createdAt": str(post.published_at or post.created_at),
        "likesCount": post.like_count or 0,
        "collectsCount": post.favorite_count or 0,
        "commentsCount": post.comment_count or 0,
        "isLiked": False,
        "isCollected": False
    }


user_bp = Blueprint("user", __name__, url_prefix="/api/user")


@user_bp.route("/register", methods=["POST"])
def register():
    if request.content_type and request.content_type.startswith("multipart/form-data"):
        data = request.form
        student_card = request.files.get("studentCard")
    else:
        data = request.get_json() or {}
        student_card = None

    username = data.get("username")
    password = data.get("password")
    nickname = data.get("nickname")

    if not username:
        return fail("学号不能为空", code=400, status_code=400)

    if not password:
        return fail("密码不能为空", code=400, status_code=400)

    if not student_card:
        return fail("请上传学生证或学生卡图片", code=400, status_code=400)

    if student_card.filename == "":
        return fail("学生证图片文件名不能为空", code=400, status_code=400)

    if not allowed_card_file(student_card.filename):
        return fail("不支持的图片格式", code=400, status_code=400)

    existing_user = User.query.filter_by(student_no=username).first()

    if existing_user:
        return fail("该学号已注册", code=400, status_code=400)

    ext = student_card.filename.rsplit(".", 1)[1].lower()
    filename = f"{uuid.uuid4().hex}.{ext}"
    upload_root = os.path.join(current_app.root_path, "..", "uploads")
    save_dir = os.path.join(upload_root, "student_cards")
    os.makedirs(save_dir, exist_ok=True)
    save_path = os.path.join(save_dir, secure_filename(filename))
    student_card.save(save_path)

    user = User(
        student_no=username,
        password_hash=hash_password(password),
        nickname=nickname or username,
        role="USER",
        status="NORMAL",
        review_status="PENDING",
        student_card_url=f"/api/admin/registration-card/{filename}"
    )

    db.session.add(user)
    db.session.commit()

    return success(None, message="注册申请已提交，请等待管理员审核")


@user_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}

    username = data.get("username")
    password = data.get("password")

    if not username:
        return fail("学号不能为空", code=400, status_code=400)

    if not password:
        return fail("密码不能为空", code=400, status_code=400)

    user = User.query.filter_by(student_no=username).first()

    if not user:
        return fail("学号或密码错误", code=400, status_code=400)

    if not verify_password(password, user.password_hash):
        return fail("学号或密码错误", code=400, status_code=400)

    if user.status in ["BANNED", "DELETED"]:
        return fail("账号不可用", code=403, status_code=403)

    if user.review_status == "PENDING":
        return fail("注册申请正在审核中，请审核通过后再登录", code=403, status_code=403)

    if user.review_status == "REJECTED":
        return fail(user.review_reject_reason or "注册申请未通过", code=403, status_code=403)

    token = generate_token(user.id)

    return success({
        "token": token,
        "user": {
            "id": user.id,
            "username": user.student_no,
            "nickname": user.nickname,
            "avatar": user.avatar_url,
            "email": user.email,
            "bio": user.bio,
            "role": user.role
        }
    })


@user_bp.route("/profile", methods=["GET"])
@login_required
def get_profile(current_user):
    posts_count = Post.query.filter_by(
        user_id=current_user.id,
        status="PUBLISHED"
    ).count()
    likes_count = (
        PostLike.query
        .join(Post, PostLike.post_id == Post.id)
        .filter(PostLike.user_id == current_user.id, Post.status == "PUBLISHED")
        .count()
    )
    collects_count = (
        PostFavorite.query
        .join(Post, PostFavorite.post_id == Post.id)
        .filter(PostFavorite.user_id == current_user.id, Post.status == "PUBLISHED")
        .count()
    )
    comments_count = (
        Comment.query
        .join(Post, Comment.post_id == Post.id)
        .filter(
            Comment.user_id == current_user.id,
            Comment.status == "PUBLISHED",
            Post.status == "PUBLISHED"
        )
        .count()
    )

    return success({
        "id": current_user.id,
        "username": current_user.student_no,
        "nickname": current_user.nickname,
        "email": current_user.email,
        "bio": current_user.bio,
        "avatar": current_user.avatar_url,
        "role": current_user.role,
        "stats": {
            "postsCount": posts_count,
            "likesCount": likes_count,
            "collectsCount": collects_count,
            "commentsCount": comments_count
        }
    })


@user_bp.route("/profile", methods=["PUT"])
@login_required
def update_profile(current_user):
    data = request.get_json() or {}

    nickname = data.get("nickname")
    username = data.get("username")
    email = data.get("email")
    bio = data.get("bio")
    avatar = data.get("avatar")

    if username is not None:
        username = username.strip()
        if not username:
            return fail("学号不能为空", code=400, status_code=400)
        existing_user = User.query.filter(
            User.student_no == username,
            User.id != current_user.id
        ).first()
        if existing_user:
            return fail("该学号已被使用", code=400, status_code=400)
        current_user.student_no = username

    if nickname is not None:
        nickname = nickname.strip()
        if not nickname:
            return fail("昵称不能为空", code=400, status_code=400)
        current_user.nickname = nickname

    if email is not None:
        current_user.email = email.strip() or None

    if bio is not None:
        current_user.bio = bio.strip() or None

    if avatar is not None:
        current_user.avatar_url = avatar.strip() or None

    db.session.commit()

    return success({
        "id": current_user.id,
        "username": current_user.student_no,
        "nickname": current_user.nickname,
        "email": current_user.email,
        "bio": current_user.bio,
        "avatar": current_user.avatar_url,
        "role": current_user.role
    })


@user_bp.route("/profile/posts", methods=["GET"])
@login_required
def get_my_posts(current_user):
    page = int(request.args.get("page", 1))
    page_size = int(request.args.get("pageSize", 20))

    pagination = (
        Post.query
        .filter(Post.user_id == current_user.id, Post.status != "DELETED")
        .order_by(Post.created_at.desc())
        .paginate(page=page, per_page=page_size, error_out=False)
    )

    return success({
        "list": [format_user_post(post) for post in pagination.items],
        "total": pagination.total
    })


@user_bp.route("/profile/likes", methods=["GET"])
@login_required
def get_my_likes(current_user):
    page = int(request.args.get("page", 1))
    page_size = int(request.args.get("pageSize", 20))

    pagination = (
        PostLike.query
        .join(Post, PostLike.post_id == Post.id)
        .filter(PostLike.user_id == current_user.id, Post.status == "PUBLISHED")
        .order_by(PostLike.created_at.desc())
        .paginate(page=page, per_page=page_size, error_out=False)
    )

    return success({
        "list": [format_user_post(item.post) for item in pagination.items],
        "total": pagination.total
    })


@user_bp.route("/profile/favorites", methods=["GET"])
@login_required
def get_my_favorites(current_user):
    page = int(request.args.get("page", 1))
    page_size = int(request.args.get("pageSize", 20))

    pagination = (
        PostFavorite.query
        .join(Post, PostFavorite.post_id == Post.id)
        .filter(PostFavorite.user_id == current_user.id, Post.status == "PUBLISHED")
        .order_by(PostFavorite.created_at.desc())
        .paginate(page=page, per_page=page_size, error_out=False)
    )

    return success({
        "list": [format_user_post(item.post) for item in pagination.items],
        "total": pagination.total
    })


def format_user_comment(comment):
    return {
        "id": comment.id,
        "content": comment.content,
        "status": comment.status,
        "createdAt": str(comment.created_at),
        "post": format_user_post(comment.post) if comment.post else None
    }


@user_bp.route("/profile/comments", methods=["GET"])
@login_required
def get_my_comments(current_user):
    page = int(request.args.get("page", 1))
    page_size = int(request.args.get("pageSize", 20))

    pagination = (
        Comment.query
        .join(Post, Comment.post_id == Post.id)
        .filter(
            Comment.user_id == current_user.id,
            Comment.status == "PUBLISHED",
            Post.status == "PUBLISHED"
        )
        .order_by(Comment.created_at.desc())
        .paginate(page=page, per_page=page_size, error_out=False)
    )

    return success({
        "list": [format_user_comment(comment) for comment in pagination.items],
        "total": pagination.total
    })


@user_bp.route("/profile/history", methods=["GET"])
@login_required
def get_my_history(current_user):
    page = int(request.args.get("page", 1))
    page_size = int(request.args.get("pageSize", 20))
    offset = (page - 1) * page_size

    events = (
        BehaviorEvent.query
        .join(Post, BehaviorEvent.target_id == Post.id)
        .filter(
            BehaviorEvent.user_id == current_user.id,
            BehaviorEvent.event_type == "VIEW_POST",
            BehaviorEvent.target_type == "POST",
            Post.status == "PUBLISHED"
        )
        .order_by(BehaviorEvent.created_at.desc())
        .all()
    )

    seen_post_ids = set()
    history = []
    for event in events:
        if event.target_id in seen_post_ids:
            continue
        seen_post_ids.add(event.target_id)
        post = Post.query.get(event.target_id)
        if not post:
            continue
        history.append({
            **format_user_post(post),
            "viewedAt": str(event.created_at)
        })

    return success({
        "list": history[offset:offset + page_size],
        "total": len(history)
    })


@user_bp.route("/<int:user_id>", methods=["GET"])
def get_public_profile(user_id):
    user = User.query.filter_by(id=user_id, status="NORMAL").first()

    if not user:
        return fail("用户不存在", code=404, status_code=404)

    posts_count = Post.query.filter_by(
        user_id=user.id,
        status="PUBLISHED"
    ).count()

    return success({
        "id": user.id,
        "username": user.student_no,
        "nickname": user.nickname,
        "avatar": user.avatar_url,
        "email": user.email,
        "bio": user.bio,
        "role": user.role,
        "stats": {
            "postsCount": posts_count
        }
    })


@user_bp.route("/<int:user_id>/posts", methods=["GET"])
def get_public_user_posts(user_id):
    user = User.query.filter_by(id=user_id, status="NORMAL").first()

    if not user:
        return fail("用户不存在", code=404, status_code=404)

    page = int(request.args.get("page", 1))
    page_size = int(request.args.get("pageSize", 10))

    pagination = (
        Post.query
        .filter_by(user_id=user.id, status="PUBLISHED")
        .order_by(Post.created_at.desc())
        .paginate(page=page, per_page=page_size, error_out=False)
    )

    return success({
        "list": [format_user_post(post) for post in pagination.items],
        "total": pagination.total
    })
