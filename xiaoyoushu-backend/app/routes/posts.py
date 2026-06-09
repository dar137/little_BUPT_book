import re

from flask import Blueprint, request

from app import db
from app.models.post import Post
from app.models.category import Category
from app.models.post import Post, PostImage, PostLike, PostFavorite
from app.models.comment import Comment
from app.models.behavior_event import BehaviorEvent
from app.services.moderation_service import hide_post
from app.utils.response import success, fail
from app.utils.jwt import login_required, optional_login


post_bp = Blueprint("post", __name__, url_prefix="/api/posts")

PRICE_MARKER_PATTERN = re.compile(r"\n*<!--ESTIMATED_PRICE:([^>]+)-->\s*$")


def split_content_meta(content):
    if not content:
        return "", None

    match = PRICE_MARKER_PATTERN.search(content)
    if not match:
        return content, None

    return PRICE_MARKER_PATTERN.sub("", content).rstrip(), match.group(1)


def attach_price_marker(content, estimated_price):
    if not estimated_price:
        return content

    return f"{content}\n<!--ESTIMATED_PRICE:{estimated_price}-->"


def format_post(post, current_user=None):
    content, estimated_price = split_content_meta(post.content)
    first_image = (
        PostImage.query
        .filter_by(post_id=post.id)
        .order_by(PostImage.sort_order.asc())
        .first()
    )

    is_liked = False
    is_collected = False

    if current_user:
        is_liked = PostLike.query.filter_by(
            post_id=post.id,
            user_id=current_user.id
        ).first() is not None

        is_collected = PostFavorite.query.filter_by(
            post_id=post.id,
            user_id=current_user.id
        ).first() is not None

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
        "createdAt": str(post.published_at or post.created_at),
        "likesCount": post.like_count or 0,
        "collectsCount": post.favorite_count or 0,
        "commentsCount": post.comment_count or 0,
        "isLiked": is_liked,
        "isCollected": is_collected
    }


def format_comment(comment):
    return {
        "id": comment.id,
        "content": comment.content,
        "parentId": comment.parent_id,
        "createdAt": str(comment.created_at),
        "likesCount": comment.like_count or 0,
        "author": {
            "id": comment.user.id,
            "nickname": comment.user.nickname,
            "avatar": comment.user.avatar_url,
            "role": comment.user.role
        },
        "replies": [
            format_comment(reply)
            for reply in sorted(comment.replies, key=lambda item: item.created_at)
            if reply.status == "PUBLISHED" and not reply.deleted_at
        ]
    }


@post_bp.route("/categories", methods=["GET"])
def get_categories():
    categories = (
        Category.query
        .filter_by(is_enabled=True)
        .order_by(Category.sort_order.asc(), Category.id.asc())
        .all()
    )

    if not categories:
        categories = (
            Category.query
            .join(Post, Post.category_id == Category.id)
            .filter(Post.status == "PUBLISHED")
            .order_by(Category.sort_order.asc(), Category.id.asc())
            .all()
        )

    seen = set()
    result = []
    for category in categories:
        if category.name in seen:
            continue
        seen.add(category.name)
        result.append({
            "id": category.id,
            "name": category.name,
            "description": category.description
        })

    return success({
        "list": result
    })


@post_bp.route("", methods=["GET"])
@optional_login
def get_posts(current_user=None):
    category = request.args.get("category")
    page = int(request.args.get("page", 1))
    page_size = int(request.args.get("pageSize", 10))

    query = Post.query.filter_by(status="PUBLISHED")

    if category:
        query = query.join(Category).filter(Category.name == category)

    pagination = query.order_by(Post.created_at.desc()).paginate(
        page=page,
        per_page=page_size,
        error_out=False
    )

    return success({
        "list": [
            format_post(post, current_user)
            for post in pagination.items
        ],
        "total": pagination.total
    })


@post_bp.route("/<int:post_id>", methods=["GET"])
@optional_login
def get_post_detail(post_id, current_user=None):
    admin_review = request.args.get("adminReview") == "post"
    if admin_review and current_user and current_user.role == "ADMIN":
        post = Post.query.filter_by(id=post_id, status="PENDING_REVIEW").first()
    else:
        post = Post.query.filter_by(id=post_id, status="PUBLISHED").first()

    if not post:
        return fail("资源不存在", code=404, status_code=404)

    content, estimated_price = split_content_meta(post.content)

    images = (
        PostImage.query
        .filter_by(post_id=post.id)
        .order_by(PostImage.sort_order.asc())
        .all()
    )

    is_liked = False
    is_collected = False
    comments = (
        Comment.query
        .filter_by(post_id=post.id, parent_id=None, status="PUBLISHED")
        .order_by(Comment.created_at.asc())
        .all()
    )

    if current_user:
        is_liked = PostLike.query.filter_by(
            post_id=post.id,
            user_id=current_user.id
        ).first() is not None

        is_collected = PostFavorite.query.filter_by(
            post_id=post.id,
            user_id=current_user.id
        ).first() is not None

        post.view_count = (post.view_count or 0) + 1
        db.session.add(BehaviorEvent(
            user_id=current_user.id,
            event_type="VIEW_POST",
            target_type="POST",
            target_id=post.id,
            ip_address=request.remote_addr,
            user_agent=request.headers.get("User-Agent")
        ))
        db.session.commit()

    return success({
        "id": post.id,
        "title": post.title,
        "content": content,
        "images": [image.image_url for image in images],
        "author": {
            "id": post.user.id,
            "nickname": post.user.nickname,
            "avatar": post.user.avatar_url,
            "role": post.user.role
        },
        "category": post.category.name if post.category else None,
        "estimatedPrice": estimated_price,
        "contentType": post.content_type,
        "createdAt": str(post.published_at or post.created_at),
        "likesCount": post.like_count or 0,
        "collectsCount": post.favorite_count or 0,
        "commentsCount": post.comment_count or 0,
        "isLiked": is_liked,
        "isCollected": is_collected,
        "comments": [format_comment(comment) for comment in comments]
    })


@post_bp.route("", methods=["POST"])
@login_required
def create_post(current_user):
    data = request.get_json() or {}

    title = data.get("title")
    content = data.get("content")
    category_name = data.get("category")
    images = data.get("images", [])
    estimated_price = data.get("estimatedPrice")

    if not title:
        return fail("帖子标题不能为空", code=400, status_code=400)

    if not content:
        return fail("帖子正文不能为空", code=400, status_code=400)

    if not category_name:
        return fail("分类不能为空", code=400, status_code=400)

    category = Category.query.filter_by(name=category_name).first()

    if not category:
        return fail("分类不存在", code=400, status_code=400)

    if category_name == "二手交易" and not str(estimated_price or "").strip():
        return fail("预估价格不能为空", code=400, status_code=400)

    content = attach_price_marker(content, str(estimated_price).strip() if estimated_price else None)

    post = Post(
        user_id=current_user.id,
        category_id=category.id,
        title=title,
        content=content,
        content_type="IMAGE_TEXT" if images else "TEXT",
        status="PENDING_REVIEW",
        like_count=0,
        favorite_count=0,
        comment_count=0
    )

    db.session.add(post)
    db.session.flush()

    for index, image_url in enumerate(images):
        post_image = PostImage(
            post_id=post.id,
            image_url=image_url,
            sort_order=index
        )
        db.session.add(post_image)

    db.session.commit()

    return success({
        "id": post.id
    })


@post_bp.route("/search", methods=["GET"])
@optional_login
def search_posts(current_user=None):
    keyword = request.args.get("keyword")
    category = request.args.get("category")
    page = int(request.args.get("page", 1))
    page_size = int(request.args.get("pageSize", 10))

    if not keyword:
        return fail("搜索关键词不能为空", code=400, status_code=400)

    query = Post.query.filter(
        Post.status == "PUBLISHED",
        db.or_(
            Post.title.like(f"%{keyword}%"),
            Post.content.like(f"%{keyword}%")
        )
    )

    if category:
        query = query.join(Category).filter(Category.name == category)

    pagination = query.order_by(Post.created_at.desc()).paginate(
        page=page,
        per_page=page_size,
        error_out=False
    )

    return success({
        "list": [
            format_post(post, current_user)
            for post in pagination.items
        ],
        "total": pagination.total
    })


@post_bp.route("/<int:post_id>/like", methods=["POST"])
@login_required
def toggle_like(post_id, current_user):
    post = Post.query.filter_by(id=post_id, status="PUBLISHED").first()

    if not post:
        return fail("资源不存在", code=404, status_code=404)

    like = PostLike.query.filter_by(
        post_id=post.id,
        user_id=current_user.id
    ).first()

    if like:
        db.session.delete(like)
        post.like_count = max((post.like_count or 0) - 1, 0)
        is_liked = False
    else:
        like = PostLike(
            post_id=post.id,
            user_id=current_user.id
        )
        db.session.add(like)
        post.like_count = (post.like_count or 0) + 1
        is_liked = True

    db.session.commit()

    return success({
        "isLiked": is_liked,
        "likesCount": post.like_count
    })


@post_bp.route("/<int:post_id>/collect", methods=["POST"])
@login_required
def toggle_collect(post_id, current_user):
    post = Post.query.filter_by(id=post_id, status="PUBLISHED").first()

    if not post:
        return fail("资源不存在", code=404, status_code=404)

    favorite = PostFavorite.query.filter_by(
        post_id=post.id,
        user_id=current_user.id
    ).first()

    if favorite:
        db.session.delete(favorite)
        post.favorite_count = max((post.favorite_count or 0) - 1, 0)
        is_collected = False
    else:
        favorite = PostFavorite(
            post_id=post.id,
            user_id=current_user.id
        )
        db.session.add(favorite)
        post.favorite_count = (post.favorite_count or 0) + 1
        is_collected = True

    db.session.commit()

    return success({
        "isCollected": is_collected,
        "collectsCount": post.favorite_count
    })


@post_bp.route("/<int:post_id>", methods=["DELETE"])
@login_required
def delete_my_post(post_id, current_user):
    post = Post.query.filter_by(id=post_id, user_id=current_user.id).first()

    if not post:
        return fail("资源不存在", code=404, status_code=404)

    hide_post(post, "DELETED")

    db.session.commit()

    return success(None, message="帖子已删除")
