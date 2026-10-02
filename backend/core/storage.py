import asyncio
import json
from uuid import uuid4

import boto3
from botocore.client import Config
from botocore.exceptions import ClientError
from fastapi import UploadFile

from core.config import (
    MINIO_ENDPOINT,
    MINIO_PUBLIC_URL,
    MINIO_ACCESS_KEY,
    MINIO_SECRET_KEY,
    MINIO_BUCKET,
)


def _s3():
    return boto3.client(
        "s3",
        endpoint_url=MINIO_ENDPOINT,
        aws_access_key_id=MINIO_ACCESS_KEY,
        aws_secret_access_key=MINIO_SECRET_KEY,
        config=Config(signature_version="s3v4"),
        region_name="us-east-1",
    )


def _ensure_bucket():
    client = _s3()
    try:
        client.head_bucket(Bucket=MINIO_BUCKET)
    except ClientError:
        client.create_bucket(Bucket=MINIO_BUCKET)

    policy = {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Principal": {"AWS": "*"},
                "Action": ["s3:GetObject"],
                "Resource": [f"arn:aws:s3:::{MINIO_BUCKET}/*"],
            }
        ],
    }
    client.put_bucket_policy(Bucket=MINIO_BUCKET, Policy=json.dumps(policy))


async def init_storage():
    loop = asyncio.get_event_loop()
    await loop.run_in_executor(None, _ensure_bucket)


async def upload_file(file: UploadFile, folder: str = "") -> str:
    src_name = file.filename or "image.webp"
    ext = src_name.rsplit(".", 1)[-1].lower() if "." in src_name else "webp"
    filename = f"{uuid4()}.{ext}"
    key = f"{folder}/{filename}" if folder else filename

    content = await file.read()
    content_type = file.content_type or "image/webp"

    def _upload():
        _s3().put_object(
            Bucket=MINIO_BUCKET,
            Key=key,
            Body=content,
            ContentType=content_type,
        )

    loop = asyncio.get_event_loop()
    await loop.run_in_executor(None, _upload)

    return f"{MINIO_PUBLIC_URL}/{MINIO_BUCKET}/{key}"


async def delete_file(url: str | None):
    if not url:
        return

    prefix = f"{MINIO_PUBLIC_URL}/{MINIO_BUCKET}/"
    if not url.startswith(prefix):
        return
    key = url[len(prefix):]

    def _delete():
        try:
            _s3().delete_object(Bucket=MINIO_BUCKET, Key=key)
        except Exception as e:
            print(f"[storage] delete error: {e}")

    loop = asyncio.get_event_loop()
    await loop.run_in_executor(None, _delete)
