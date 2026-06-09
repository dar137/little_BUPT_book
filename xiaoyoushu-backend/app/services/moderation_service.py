from datetime import datetime

from app.extensions import db
from app.models.comment import Comment
from app.models.post import Post, PostFavorite, PostLike


VISIBLE_POST_STATUS = "PUBLISHED"
VISIBLE_COMMENT_STATUS = "PUBLISHED"


def recalculate_post_counts(post):
    if not post:
        return

    if post.status != VISIBLE_POST_STATUS:
        post.like_count = 0
        post.favorite_count = 0
        post.comment_count = 0
        return

    post.like_count = PostLike.query.filter_by(post_id=post.id).count()
    post.favorite_count = PostFavorite.query.filter_by(post_id=post.id).count()
    post.comment_count = Comment.query.filter_by(
        post_id=post.id,
        status=VISIBLE_COMMENT_STATUS
    ).count()


def mark_comment_deleted(comment, status="DELETED"):
    if not comment or comment.status == status:
        return 0

    changed = 0
    stack = [comment]

    while stack:
        item = stack.pop()
        if item.status == status:
            continue

        item.status = status
        if status == "DELETED":
            item.deleted_at = datetime.utcnow()
        changed += 1

        stack.extend(Comment.query.filter_by(parent_id=item.id).all())

    return changed


def hide_post(post, status="DELETED"):
    if not post:
        return

    post.status = status
    if status == "DELETED":
        post.deleted_at = datetime.utcnow()

    for comment in Comment.query.filter_by(post_id=post.id).all():
        if comment.status != "DELETED":
            comment.status = status if status != "DELETED" else "DELETED"
            if status == "DELETED":
                comment.deleted_at = datetime.utcnow()

    PostLike.query.filter_by(post_id=post.id).delete(synchronize_session=False)
    PostFavorite.query.filter_by(post_id=post.id).delete(synchronize_session=False)
    recalculate_post_counts(post)
