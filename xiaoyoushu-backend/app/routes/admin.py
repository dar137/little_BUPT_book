from datetime import datetime

import os

from flask import Blueprint, current_app, request, send_from_directory

from app.extensions import db
from app.middlewares.admin_required import admin_required
from app.models.audit import ModerationRecord
from app.models.comment import Comment
from app.models.post import Post
from app.models.report import Report
from app.models.user import User
from app.services.moderation_service import hide_post, mark_comment_deleted, recalculate_post_counts
from app.utils.response import success, fail


admin_bp = Blueprint("admin", __name__, url_prefix="/api/admin")


def format_datetime(value):
    if not value:
        return None

    return value.strftime("%Y-%m-%d %H:%M:%S")


def serialize_post(post):
    ai_record = (
        ModerationRecord.query
        .filter_by(target_type="POST", target_id=post.id, review_stage="AI")
        .order_by(ModerationRecord.created_at.desc(), ModerationRecord.id.desc())
        .first()
    )

    return {
        "id": post.id,
        "user_id": post.user_id,
        "nickname": post.user.nickname if post.user else None,
        "avatar_url": post.user.avatar_url if post.user else None,
        "category_id": post.category_id,
        "title": post.title,
        "content": post.content,
        "content_type": post.content_type,
        "status": post.status,
        "view_count": post.view_count,
        "like_count": post.like_count,
        "comment_count": post.comment_count,
        "favorite_count": post.favorite_count,
        "published_at": format_datetime(post.published_at),
        "created_at": format_datetime(post.created_at),
        "updated_at": format_datetime(post.updated_at),
        "ai_review": {
            "result": ai_record.ai_result,
            "risk_level": ai_record.risk_level,
            "confidence": float(ai_record.confidence or 0),
            "reason": ai_record.reason,
            "model": ai_record.ai_model,
            "created_at": format_datetime(ai_record.created_at)
        } if ai_record else None,
        "images": [
            {
                "id": image.id,
                "image_url": image.image_url,
                "sort_order": image.sort_order
            }
            for image in post.images
        ]
    }


def serialize_comment(comment):
    ai_record = (
        ModerationRecord.query
        .filter_by(target_type="COMMENT", target_id=comment.id, review_stage="AI")
        .order_by(ModerationRecord.created_at.desc(), ModerationRecord.id.desc())
        .first()
    )

    return {
        "id": comment.id,
        "post_id": comment.post_id,
        "post_title": comment.post.title if comment.post else None,
        "user_id": comment.user_id,
        "nickname": comment.user.nickname if comment.user else None,
        "content": comment.content,
        "status": comment.status,
        "parent_id": comment.parent_id,
        "created_at": format_datetime(comment.created_at),
        "updated_at": format_datetime(comment.updated_at),
        "ai_review": {
            "result": ai_record.ai_result,
            "risk_level": ai_record.risk_level,
            "confidence": float(ai_record.confidence or 0),
            "reason": ai_record.reason,
            "model": ai_record.ai_model,
            "created_at": format_datetime(ai_record.created_at)
        } if ai_record else None,
    }


def serialize_report(report):
    target_title = None
    target_post_id = None
    target_post_title = None
    if report.target_type == "POST":
        post = Post.query.get(report.target_id)
        target_title = post.title if post else None
        target_post_id = post.id if post else None
        target_post_title = post.title if post else None
    elif report.target_type == "COMMENT":
        comment = Comment.query.get(report.target_id)
        target_title = comment.content if comment else None
        target_post_id = comment.post_id if comment else None
        target_post_title = comment.post.title if comment and comment.post else None

    return {
        "id": report.id,
        "reporter_id": report.reporter_id,
        "reporter_nickname": report.reporter.nickname if report.reporter else None,
        "target_type": report.target_type,
        "target_id": report.target_id,
        "target_title": target_title,
        "target_post_id": target_post_id,
        "target_post_title": target_post_title,
        "reason_type": report.reason_type,
        "reason_detail": report.reason_detail,
        "status": report.status,
        "handler_id": report.handler_id,
        "handler_nickname": report.handler.nickname if report.handler else None,
        "handle_result": report.handle_result,
        "handled_at": format_datetime(report.handled_at),
        "created_at": format_datetime(report.created_at),
        "updated_at": format_datetime(report.updated_at)
    }


def serialize_registration(user):
    return {
        "id": user.id,
        "username": user.student_no,
        "nickname": user.nickname,
        "email": user.email,
        "student_card_url": user.student_card_url,
        "review_status": user.review_status,
        "review_reject_reason": user.review_reject_reason,
        "created_at": format_datetime(user.created_at),
        "updated_at": format_datetime(user.updated_at)
    }


@admin_bp.route("/pending-posts", methods=["GET"])
@admin_required
def get_pending_posts():
    posts = (
        Post.query
        .filter_by(status="PENDING_REVIEW")
        .order_by(Post.created_at.desc())
        .all()
    )

    return success({
        "list": [serialize_post(post) for post in posts]
    })


@admin_bp.route("/pending-comments", methods=["GET"])
@admin_required
def get_pending_comments():
    comments = (
        Comment.query
        .filter_by(status="PENDING_REVIEW")
        .order_by(Comment.created_at.desc())
        .all()
    )

    return success({
        "list": [serialize_comment(comment) for comment in comments]
    })


@admin_bp.route("/approve-post/<int:post_id>", methods=["POST"])
@admin_required
def approve_post(post_id):
    post = Post.query.get(post_id)

    if not post:
        return fail("帖子不存在", code=404, status_code=404)

    if post.status == "DELETED":
        return fail("帖子已删除，无法审核通过", code=400, status_code=400)

    post.status = "PUBLISHED"
    post.published_at = datetime.utcnow()

    db.session.commit()

    return success(None, message="帖子审核通过")


@admin_bp.route("/delete-post/<int:post_id>", methods=["DELETE"])
@admin_required
def delete_post(post_id):
    post = Post.query.get(post_id)

    if not post:
        return fail("帖子不存在", code=404, status_code=404)

    hide_post(post, "DELETED")

    db.session.commit()

    return success(None, message="帖子已删除")


@admin_bp.route("/reject-post/<int:post_id>", methods=["POST"])
@admin_required
def reject_post(post_id):
    post = Post.query.get(post_id)

    if not post:
        return fail("帖子不存在", code=404, status_code=404)

    if post.status == "DELETED":
        return fail("帖子已删除，无法审核不通过", code=400, status_code=400)

    post.status = "REJECTED"

    db.session.add(ModerationRecord(
        target_type="POST",
        target_id=post.id,
        submitter_id=post.user_id,
        reviewer_id=request.current_user.id,
        review_stage="HUMAN",
        human_result="REJECT",
        final_result="REJECT",
        reason="人工审核不通过",
        reviewed_at=datetime.utcnow()
    ))
    db.session.commit()

    return success(None, message="帖子审核不通过")


@admin_bp.route("/approve-comment/<int:comment_id>", methods=["POST"])
@admin_required
def approve_comment(comment_id):
    comment = Comment.query.get(comment_id)

    if not comment:
        return fail("评论不存在", code=404, status_code=404)

    if comment.status == "DELETED":
        return fail("评论已删除，无法审核通过", code=400, status_code=400)

    comment.status = "PUBLISHED"
    db.session.add(ModerationRecord(
        target_type="COMMENT",
        target_id=comment.id,
        submitter_id=comment.user_id,
        reviewer_id=request.current_user.id,
        review_stage="HUMAN",
        human_result="PASS",
        final_result="PASS",
        reason="人工审核通过",
        reviewed_at=datetime.utcnow()
    ))
    recalculate_post_counts(comment.post)
    db.session.commit()

    return success(None, message="评论审核通过")


@admin_bp.route("/reject-comment/<int:comment_id>", methods=["POST"])
@admin_required
def reject_comment(comment_id):
    comment = Comment.query.get(comment_id)

    if not comment:
        return fail("评论不存在", code=404, status_code=404)

    if comment.status == "DELETED":
        return fail("评论已删除，无法审核不通过", code=400, status_code=400)

    comment.status = "REJECTED"
    db.session.add(ModerationRecord(
        target_type="COMMENT",
        target_id=comment.id,
        submitter_id=comment.user_id,
        reviewer_id=request.current_user.id,
        review_stage="HUMAN",
        human_result="REJECT",
        final_result="REJECT",
        reason="人工复审不通过",
        reviewed_at=datetime.utcnow()
    ))
    recalculate_post_counts(comment.post)
    db.session.commit()

    return success(None, message="评论审核不通过")


@admin_bp.route("/reports", methods=["GET"])
@admin_required
def get_reports():
    target_type = request.args.get("targetType")
    query = Report.query.filter_by(status="PENDING")

    if target_type in ["POST", "COMMENT"]:
        query = query.filter(Report.target_type == target_type)

    reports = (
        query
        .order_by(Report.created_at.desc())
        .all()
    )

    return success({
        "list": [serialize_report(report) for report in reports]
    })


@admin_bp.route("/confirm-report/<int:report_id>", methods=["POST"])
@admin_required
def confirm_report(report_id):
    report = Report.query.get(report_id)

    if not report:
        return fail("举报不存在", code=404, status_code=404)

    current_user = request.current_user

    report.status = "ACCEPTED"
    report.handler_id = current_user.id
    report.handled_at = datetime.utcnow()
    report.handle_result = "举报成立，已处理"

    if report.target_type == "POST":
        post = Post.query.get(report.target_id)
        if post and post.status != "DELETED":
            hide_post(post, "TAKEN_DOWN")
    elif report.target_type == "COMMENT":
        comment = Comment.query.get(report.target_id)
        if comment and comment.status != "DELETED":
            mark_comment_deleted(comment, "TAKEN_DOWN")
            recalculate_post_counts(comment.post)

    db.session.commit()

    return success(None, message="举报已确认并处理")


@admin_bp.route("/reject-report/<int:report_id>", methods=["POST"])
@admin_required
def reject_report(report_id):
    report = Report.query.get(report_id)

    if not report:
        return fail("举报不存在", code=404, status_code=404)

    current_user = request.current_user

    report.status = "REJECTED"
    report.handler_id = current_user.id
    report.handled_at = datetime.utcnow()
    report.handle_result = "举报不成立，已驳回"

    db.session.commit()

    return success(None, message="举报已驳回")


@admin_bp.route("/registrations", methods=["GET"])
@admin_required
def get_pending_registrations():
    users = (
        User.query
        .filter_by(review_status="PENDING")
        .order_by(User.created_at.desc())
        .all()
    )

    return success({
        "list": [serialize_registration(user) for user in users]
    })


@admin_bp.route("/registration-card/<path:filename>", methods=["GET"])
@admin_required
def get_registration_card(filename):
    upload_root = os.path.join(current_app.root_path, "..", "uploads", "student_cards")
    return send_from_directory(upload_root, filename)


@admin_bp.route("/registrations/<int:user_id>/approve", methods=["POST"])
@admin_required
def approve_registration(user_id):
    user = User.query.get(user_id)

    if not user:
        return fail("注册申请不存在", code=404, status_code=404)

    if user.review_status != "PENDING":
        return fail("该申请已处理", code=400, status_code=400)

    user.review_status = "APPROVED"
    user.status = "NORMAL"
    user.review_reject_reason = None
    db.session.commit()

    return success(None, message="注册申请已通过")


@admin_bp.route("/registrations/<int:user_id>/reject", methods=["POST"])
@admin_required
def reject_registration(user_id):
    user = User.query.get(user_id)

    if not user:
        return fail("注册申请不存在", code=404, status_code=404)

    if user.review_status != "PENDING":
        return fail("该申请已处理", code=400, status_code=400)

    user.review_status = "REJECTED"
    user.status = "DELETED"
    user.review_reject_reason = "图片无法验证身份"
    user.deleted_at = datetime.utcnow()
    db.session.commit()

    return success(None, message="注册申请已否决")
