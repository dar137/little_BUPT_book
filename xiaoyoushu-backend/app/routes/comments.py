from flask import Blueprint, request

from app import db
from app.models.post import Post
from app.models.comment import Comment
from app.services.moderation_service import mark_comment_deleted, recalculate_post_counts
from app.utils.response import success, fail
from app.utils.jwt import login_required


comment_bp = Blueprint("comment", __name__, url_prefix="/api/posts")


@comment_bp.route("/<int:post_id>/comments", methods=["POST"])
@login_required
def create_comment(post_id, current_user):
    data = request.get_json() or {}

    content = data.get("content")
    parent_id = data.get("parentId")

    if not content:
        return fail("评论内容不能为空", code=400, status_code=400)

    post = Post.query.filter_by(id=post_id, status="PUBLISHED").first()

    if not post:
        return fail("资源不存在", code=404, status_code=404)

    if parent_id:
        parent = Comment.query.filter_by(id=parent_id, post_id=post.id).first()
        if not parent:
            return fail("父评论不存在", code=404, status_code=404)

    comment = Comment(
        post_id=post.id,
        user_id=current_user.id,
        content=content,
        status="PUBLISHED",
        parent_id=parent_id
    )

    db.session.add(comment)
    post.comment_count = (post.comment_count or 0) + 1
    db.session.commit()

    return success(None)


@comment_bp.route("/<int:post_id>/comments/<int:comment_id>", methods=["DELETE"])
@login_required
def delete_comment(post_id, comment_id, current_user):
    comment = Comment.query.filter_by(id=comment_id, post_id=post_id).first()

    if not comment:
        return fail("评论不存在", code=404, status_code=404)

    if comment.user_id != current_user.id and current_user.role != "ADMIN":
        return fail("无权限删除该评论", code=403, status_code=403)

    if comment.status != "DELETED":
        mark_comment_deleted(comment)
        recalculate_post_counts(Post.query.get(post_id))

    db.session.commit()

    return success(None, message="评论已删除")
