from flask import Blueprint, request

from app import db
from app.models.user import User
from app.utils.response import success, fail
from app.utils.password import hash_password, verify_password
from app.utils.jwt import generate_token, login_required


user_bp = Blueprint("user", __name__, url_prefix="/api/user")


@user_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json() or {}

    username = data.get("username")
    password = data.get("password")
    nickname = data.get("nickname")

    if not username:
        return fail("学号不能为空", code=400, status_code=400)

    if not password:
        return fail("密码不能为空", code=400, status_code=400)

    existing_user = User.query.filter_by(student_no=username).first()

    if existing_user:
        return fail("该学号已注册", code=400, status_code=400)

    user = User(
        student_no=username,
        password_hash=hash_password(password),
        nickname=nickname or username,
        role="USER"
    )

    db.session.add(user)
    db.session.commit()

    return success(None)


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

    token = generate_token(user.id)

    return success({
        "token": token,
        "user": {
            "id": user.id,
            "username": user.student_no,
            "nickname": user.nickname,
            "avatar": user.avatar_url,
            "role": user.role
        }
    })


@user_bp.route("/profile", methods=["GET"])
@login_required
def get_profile(current_user):
    return success({
        "id": current_user.id,
        "username": current_user.student_no,
        "nickname": current_user.nickname,
        "avatar": current_user.avatar_url,
        "role": current_user.role,
        "stats": {
            "postsCount": 0,
            "likesCount": 0,
            "collectsCount": 0,
            "commentsCount": 0
        }
    })