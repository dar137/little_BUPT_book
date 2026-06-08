from functools import wraps
from datetime import datetime, timedelta, timezone

import jwt
from flask import request, current_app

from app.models.user import User
from app.utils.response import fail


def generate_token(user_id: int) -> str:
    payload = {
        "user_id": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(days=7)
    }

    token = jwt.encode(
        payload,
        current_app.config["JWT_SECRET_KEY"],
        algorithm="HS256"
    )

    if isinstance(token, bytes):
        token = token.decode("utf-8")

    return token


def parse_token():
    auth_header = request.headers.get("Authorization")

    if not auth_header:
        return None

    if not auth_header.startswith("Bearer "):
        return None

    token = auth_header.replace("Bearer ", "", 1)

    try:
        payload = jwt.decode(
            token,
            current_app.config["JWT_SECRET_KEY"],
            algorithms=["HS256"]
        )

        user_id = payload.get("user_id")

        if not user_id:
            return None

        return User.query.get(user_id)

    except Exception:
        return None


def login_required(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        current_user = parse_token()

        if not current_user:
            return fail("请先登录", code=401, status_code=401)

        return func(current_user=current_user, *args, **kwargs)

    return wrapper


def optional_login(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        current_user = parse_token()
        return func(current_user=current_user, *args, **kwargs)

    return wrapper