import os
import uuid
from datetime import datetime

from flask import Blueprint, request, current_app
from werkzeug.utils import secure_filename

from app.utils.response import success, fail
from app.utils.jwt import login_required


upload_bp = Blueprint("upload", __name__, url_prefix="/api/upload")

ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "webp"}


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


@upload_bp.route("/post-image", methods=["POST"])
@login_required
def upload_post_image(current_user):
    if "file" not in request.files:
        return fail("未上传文件", code=400)

    file = request.files["file"]

    if file.filename == "":
        return fail("文件名不能为空", code=400)

    if not allowed_file(file.filename):
        return fail("不支持的图片格式", code=400)

    ext = file.filename.rsplit(".", 1)[1].lower()
    filename = f"{uuid.uuid4().hex}.{ext}"

    date_dir = datetime.now().strftime("%Y%m%d")

    upload_root = os.path.join(current_app.root_path, "..", "uploads")
    save_dir = os.path.join(upload_root, "posts", date_dir)
    os.makedirs(save_dir, exist_ok=True)

    save_path = os.path.join(save_dir, secure_filename(filename))
    file.save(save_path)

    url = f"/uploads/posts/{date_dir}/{filename}"

    return success({
        "url": url
    })


@upload_bp.route("/avatar", methods=["POST"])
@login_required
def upload_avatar(current_user):
    if "file" not in request.files:
        return fail("未上传文件", code=400)

    file = request.files["file"]

    if file.filename == "":
        return fail("文件名不能为空", code=400)

    if not allowed_file(file.filename):
        return fail("不支持的图片格式", code=400)

    ext = file.filename.rsplit(".", 1)[1].lower()
    filename = f"{uuid.uuid4().hex}.{ext}"

    upload_root = os.path.join(current_app.root_path, "..", "uploads")
    save_dir = os.path.join(upload_root, "avatars")
    os.makedirs(save_dir, exist_ok=True)

    save_path = os.path.join(save_dir, secure_filename(filename))
    file.save(save_path)

    url = f"/uploads/avatars/{filename}"

    return success({
        "url": url,
        "avatar": url
    })
