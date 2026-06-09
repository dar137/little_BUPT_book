import os
from urllib.parse import quote_plus

from dotenv import load_dotenv


BACKEND_ROOT = os.path.dirname(os.path.dirname(__file__))
load_dotenv(os.path.join(BACKEND_ROOT, ".env"))


class Config:
    DB_HOST = os.getenv("DB_HOST", "localhost")
    DB_PORT = os.getenv("DB_PORT", "3306")
    DB_USER = os.getenv("DB_USER", "root")
    DB_PASSWORD = os.getenv("DB_PASSWORD", "")
    DB_NAME = os.getenv("DB_NAME", "little_bupt_book")

    if DB_PASSWORD:
        SQLALCHEMY_DATABASE_URI = (
            f"mysql+pymysql://{quote_plus(DB_USER or '')}:"
            f"{quote_plus(DB_PASSWORD)}@"
            f"{DB_HOST}:{DB_PORT}/{DB_NAME}?charset=utf8mb4"
        )
    else:
        SQLALCHEMY_DATABASE_URI = (
            f"mysql+pymysql://{quote_plus(DB_USER or '')}@"
            f"{DB_HOST}:{DB_PORT}/{DB_NAME}?charset=utf8mb4"
        )

    SQLALCHEMY_TRACK_MODIFICATIONS = False

    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "dev-secret")
    SECRET_KEY = JWT_SECRET_KEY

    UPLOAD_FOLDER = os.getenv("UPLOAD_FOLDER", "app/uploads")
    MAX_CONTENT_LENGTH = int(os.getenv("MAX_CONTENT_LENGTH", 10 * 1024 * 1024))
    QWEN_API_KEY = os.getenv("QWEN_API_KEY")
    QWEN_API_URL = os.getenv("QWEN_API_URL")
    QWEN_MODEL = os.getenv("QWEN_MODEL") or os.getenv("QWEN_AUDIT_MODEL")
    FUZZY_SEARCH_API_URL = os.getenv("FUZZY_SEARCH_API_URL")
    FUZZY_SEARCH_API_KEY = os.getenv("FUZZY_SEARCH_API_KEY")
    FUZZY_SEARCH_MODEL = os.getenv("FUZZY_SEARCH_MODEL")
