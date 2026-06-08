from datetime import datetime

from flask import Blueprint, jsonify, request

from app.extensions import db
from app.middlewares.admin_required import admin_required
from app.models.post import Post
from app.models.report import Report


admin_bp = Blueprint("admin", __name__, url_prefix="/api/admin")


def format_datetime(value):
    if not value:
        return None

    return value.strftime("%Y-%m-%d %H:%M:%S")


def serialize_post(post):
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
        "images": [
            {
                "id": image.id,
                "image_url": image.image_url,
                "sort_order": image.sort_order
            }
            for image in post.images
        ]
    }


def serialize_report(report):
    return {
        "id": report.id,
        "reporter_id": report.reporter_id,
        "reporter_nickname": report.reporter.nickname if report.reporter else None,
        "target_type": report.target_type,
        "target_id": report.target_id,
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


@admin_bp.route("/pending-posts", methods=["GET"])
@admin_required
def get_pending_posts():
    posts = (
        Post.query
        .filter_by(status="PENDING_REVIEW")
        .order_by(Post.created_at.desc())
        .all()
    )

    return jsonify({
        "list": [serialize_post(post) for post in posts]
    }), 200


@admin_bp.route("/approve-post/<int:post_id>", methods=["POST"])
@admin_required
def approve_post(post_id):
    post = Post.query.get(post_id)

    if not post:
        return jsonify({
            "message": "帖子不存在"
        }), 404

    if post.status == "DELETED":
        return jsonify({
            "message": "帖子已删除，无法审核通过"
        }), 400

    post.status = "PUBLISHED"
    post.published_at = datetime.utcnow()

    db.session.commit()

    return jsonify({
        "message": "帖子审核通过"
    }), 200


@admin_bp.route("/delete-post/<int:post_id>", methods=["DELETE"])
@admin_required
def delete_post(post_id):
    post = Post.query.get(post_id)

    if not post:
        return jsonify({
            "message": "帖子不存在"
        }), 404

    post.status = "DELETED"
    post.deleted_at = datetime.utcnow()

    db.session.commit()

    return jsonify({
        "message": "帖子已删除"
    }), 200


@admin_bp.route("/reports", methods=["GET"])
@admin_required
def get_reports():
    reports = (
        Report.query
        .order_by(Report.created_at.desc())
        .all()
    )

    return jsonify({
        "list": [serialize_report(report) for report in reports]
    }), 200


@admin_bp.route("/confirm-report/<int:report_id>", methods=["POST"])
@admin_required
def confirm_report(report_id):
    report = Report.query.get(report_id)

    if not report:
        return jsonify({
            "message": "举报不存在"
        }), 404

    current_user = request.current_user

    report.status = "ACCEPTED"
    report.handler_id = current_user.id
    report.handled_at = datetime.utcnow()
    report.handle_result = "举报成立，已处理"

    if report.target_type == "POST":
        post = Post.query.get(report.target_id)
        if post and post.status != "DELETED":
            post.status = "TAKEN_DOWN"

    db.session.commit()

    return jsonify({
        "message": "举报已确认并处理"
    }), 200


@admin_bp.route("/reject-report/<int:report_id>", methods=["POST"])
@admin_required
def reject_report(report_id):
    report = Report.query.get(report_id)

    if not report:
        return jsonify({
            "message": "举报不存在"
        }), 404

    current_user = request.current_user

    report.status = "REJECTED"
    report.handler_id = current_user.id
    report.handled_at = datetime.utcnow()
    report.handle_result = "举报不成立，已驳回"

    db.session.commit()

    return jsonify({
        "message": "举报已驳回"
    }), 200