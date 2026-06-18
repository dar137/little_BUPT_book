from functools import wraps

import jwt
from flask import jsonify, request

from app.config import Config
from app.models.user import User


def admin_required(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")

        if not auth_header.startswith("Bearer "):
            return jsonify({
                "message": "缺少或错误的 Authorization 请求头"
            }), 401

        token = auth_header.replace("Bearer ", "", 1).strip()

        try:
            payload = jwt.decode(
                token,
                Config.SECRET_KEY,
                algorithms=["HS256"]
            )

            user_id = payload.get("user_id")

            if not user_id:
                return jsonify({
                    "message": "无效 token"
                }), 401

            user = User.query.get(user_id)

            if not user:
                return jsonify({
                    "message": "用户不存在"
                }), 401

            if user.role != "ADMIN":
                return jsonify({
                    "message": "无管理员权限"
                }), 403

            request.current_user = user

        except jwt.ExpiredSignatureError:
            return jsonify({
                "message": "token 已过期"
            }), 401

        except jwt.InvalidTokenError:
            return jsonify({
                "message": "无效 token"
            }), 401

        return func(*args, **kwargs)

    return wrapper