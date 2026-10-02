import os

import pytz
from pathlib import Path

from dotenv import load_dotenv


load_dotenv()
load_dotenv(Path(__file__).resolve().parents[2] / ".env")


_raw_origins = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost,http://localhost:3000,http://localhost:3001,http://localhost:8000"
)
origins = [o.strip() for o in _raw_origins.split(",") if o.strip()]


TIMEZONE = pytz.timezone('Asia/Tashkent')
DATABASE_URL = os.getenv('DATABASE_URL')
ASYNC_DATABASE_URL = os.getenv('ASYNC_DATABASE_URL')
# Auth
SECRET_KEY = os.getenv('SECRET_KEY')
ALGORITHM = "HS256"
ACCESS_TIME = 60        # 1 hour
REFRESH_TIME = 10080    # 7 days

MAX_FILE_SIZE = 5 * 1024 * 1024

# MinIO / S3
MINIO_ENDPOINT = os.getenv("MINIO_ENDPOINT", "http://minio:9000")
MINIO_PUBLIC_URL = os.getenv("MINIO_PUBLIC_URL", "http://localhost:9000")
MINIO_ACCESS_KEY = os.getenv("MINIO_ACCESS_KEY", "minioadmin")
MINIO_SECRET_KEY = os.getenv("MINIO_SECRET_KEY", "minioadmin")
MINIO_BUCKET = os.getenv("MINIO_BUCKET", "calculator-media")

# Telegram bot — token keyin beriladi
TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "")
TELEGRAM_BOT_USERNAME = os.getenv("TELEGRAM_BOT_USERNAME", "")


