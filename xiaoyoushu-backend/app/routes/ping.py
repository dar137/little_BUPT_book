from flask import Blueprint
from app.utils.response import success

ping_bp = Blueprint("ping", __name__)

@ping_bp.get("/ping")
def ping():
    return success({
        "service": "xiaoyoushu-backend"
    }, "pong")