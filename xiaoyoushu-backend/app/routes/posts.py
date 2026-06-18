from flask import Blueprint, request

from app import db
from app.models.post import Post
from app.models.category import Category
from app.models.post import Post, PostImage, PostLike, PostFavorite
from app.utils.response import success, fail
from app.utils.jwt import login_required, optional_login


post_bp = Blueprint("post", __name__, url_prefix="/api/posts")


def format_post(post, current_user=None):
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
        "summary": post.content[:100] if post.content else "",
        "coverImage": first_image.image_url if first_image else None,
        "author": {
            "id": post.user.id,
            "nickname": post.user.nickname,
            "avatar": post.user.avatar_url
        },
        "category": post.category.name if post.category else None,
        "contentType": post.content_type,
        "createdAt": str(post.published_at or post.created_at),
        "likesCount": post.like_count or 0,
        "collectsCount": post.favorite_count or 0,
        "commentsCount": post.comment_count or 0,
        "isLiked": is_liked,
        "isCollected": is_collected
    }


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
    post = Post.query.filter_by(id=post_id, status="PUBLISHED").first()

    if not post:
        return fail("资源不存在", code=404, status_code=404)

    images = (
        PostImage.query
        .filter_by(post_id=post.id)
        .order_by(PostImage.sort_order.asc())
        .all()
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

    return success({
        "id": post.id,
        "title": post.title,
        "content": post.content,
        "images": [image.image_url for image in images],
        "author": {
            "id": post.user.id,
            "nickname": post.user.nickname,
            "avatar": post.user.avatar_url
        },
        "category": post.category.name if post.category else None,
        "contentType": post.content_type,
        "createdAt": str(post.published_at or post.created_at),
        "likesCount": post.like_count or 0,
        "collectsCount": post.favorite_count or 0,
        "commentsCount": post.comment_count or 0,
        "isLiked": is_liked,
        "isCollected": is_collected
    })


@post_bp.route("", methods=["POST"])
@login_required
def create_post(current_user):
    data = request.get_json() or {}

    title = data.get("title")
    content = data.get("content")
    category_name = data.get("category")
    images = data.get("images", [])

    if not title:
        return fail("帖子标题不能为空", code=400, status_code=400)

    if not content:
        return fail("帖子正文不能为空", code=400, status_code=400)

    if not category_name:
        return fail("分类不能为空", code=400, status_code=400)

    category = Category.query.filter_by(name=category_name).first()

    if not category:
        return fail("分类不存在", code=400, status_code=400)

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
    post = Post.query.filter_by(id=post_id).first()

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
    post = Post.query.filter_by(id=post_id).first()

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