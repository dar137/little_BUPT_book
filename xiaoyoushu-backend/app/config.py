import os
from urllib.parse import quote_plus
from dotenv import load_dotenv

load_dotenv(".env")


class Config:
    DB_HOST = os.getenv("DB_HOST")
    DB_PORT = os.getenv("DB_PORT", "3306")
    DB_USER = os.getenv("DB_USER")
    DB_PASSWORD = os.getenv("DB_PASSWORD", "")
    DB_NAME = os.getenv("DB_NAME")

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
    UPLOAD_FOLDER = os.getenv("UPLOAD_FOLDER", "app/uploads")
    MAX_CONTENT_LENGTH = int(os.getenv("MAX_CONTENT_LENGTH", 10 * 1024 * 1024))
    QWEN_API_KEY = os.getenv("QWEN_API_KEY")
