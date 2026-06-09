from functools import wraps

import jwt
from flask import request

from app.config import Config
from app.models.user import User
from app.utils.response import fail


def admin_required(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")

        if not auth_header.startswith("Bearer "):
            return fail("缺少或错误的 Authorization 请求头", code=401, status_code=401)

        token = auth_header.replace("Bearer ", "", 1).strip()

        try:
            payload = jwt.decode(
                token,
                Config.SECRET_KEY,
                algorithms=["HS256"]
            )

            user_id = payload.get("user_id")

            if not user_id:
                return fail("无效 token", code=401, status_code=401)

            user = User.query.get(user_id)

            if not user:
                return fail("用户不存在", code=401, status_code=401)

            if user.role != "ADMIN":
                return fail("无管理员权限", code=403, status_code=403)

            request.current_user = user

        except jwt.ExpiredSignatureError:
            return fail("token 已过期", code=401, status_code=401)

        except jwt.InvalidTokenError:
            return fail("无效 token", code=401, status_code=401)

        return func(*args, **kwargs)

    return wrapper
