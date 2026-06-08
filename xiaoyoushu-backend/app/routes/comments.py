from flask import Blueprint, request

from app import db
from app.models.post import Post
from app.models.comment import Comment
from app.utils.response import success, fail
from app.utils.jwt import login_required


comment_bp = Blueprint("comment", __name__, url_prefix="/api/posts")


@comment_bp.route("/<int:post_id>/comments", methods=["POST"])
@login_required
def create_comment(post_id, current_user):
    data = request.get_json() or {}

    content = data.get("content")

    if not content:
        return fail("评论内容不能为空", code=400, status_code=400)

    post = Post.query.filter_by(id=post_id).first()

    if not post:
        return fail("资源不存在", code=404, status_code=404)

    comment = Comment(
        post_id=post.id,
        user_id=current_user.id,
        content=content,
        status="PENDING_REVIEW",
        parent_id=None
    )

    db.session.add(comment)
    post.comment_count = (post.comment_count or 0) + 1
    db.session.commit()

    return success(None)