from flask import Blueprint
from sqlalchemy import text
from app.extensions import db
from app.utils.response import success, fail

db_test_bp = Blueprint("db_test", __name__)

@db_test_bp.get("/db-test")
def db_test():
    try:
        result = db.session.execute(text("SELECT 1 AS ok")).fetchone()
        return success({"ok": result.ok}, "database connected")
    except Exception as e:
        return fail(str(e), code=500, status_code=500)