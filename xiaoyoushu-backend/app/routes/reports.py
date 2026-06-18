from flask import Blueprint, request

from app import db
from app.models.report import Report
from app.models.post import Post
from app.models.comment import Comment
from app.utils.response import success, fail
from app.utils.jwt import login_required


report_bp = Blueprint("report", __name__, url_prefix="/api/reports")


@report_bp.route("", methods=["POST"])
@login_required
def create_report(current_user):
    data = request.get_json() or {}

    target_type = data.get("targetType")
    target_id = data.get("targetId")
    reason_type = data.get("reasonType")
    reason_detail = data.get("reasonDetail")

    if target_type not in ["POST", "COMMENT"]:
        return fail("举报对象类型错误", code=400, status_code=400)

    if not target_id:
        return fail("举报对象不能为空", code=400, status_code=400)

    if not reason_type:
        return fail("举报原因类型不能为空", code=400, status_code=400)

    if target_type == "POST":
        target = Post.query.filter_by(id=target_id).first()
    else:
        target = Comment.query.filter_by(id=target_id).first()

    if not target:
        return fail("资源不存在", code=404, status_code=404)

    report = Report(
        reporter_id=current_user.id,
        target_type=target_type,
        target_id=target_id,
        reason_type=reason_type,
        reason_detail=reason_detail,
        status="PENDING"
    )

    db.session.add(report)
    db.session.commit()

    return success(None)