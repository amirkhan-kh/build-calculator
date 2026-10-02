from fastapi import HTTPException, UploadFile
from starlette import status

from core.config import MAX_FILE_SIZE
from core.storage import upload_file, delete_file

ALLOWED_IMAGE_EXTENSIONS = (
    ".png",
    ".jpeg",
    ".jpg",
    ".svg",
    ".webp",
    ".avif",
    ".gif",
    ".bmp",
    ".ico",
    ".tif",
    ".tiff",
)

ALLOWED_IMAGE_CONTENT_TYPES = (
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/svg+xml",
    "image/webp",
    "image/avif",
    "image/gif",
    "image/bmp",
    "image/x-icon",
    "image/vnd.microsoft.icon",
    "image/tiff",
)


class ImageFileValidator:
    @staticmethod
    async def validate_file_type(upload_file: UploadFile):
        filename = upload_file.filename
        if not filename:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Введите допустимый тип файла (png, jpeg, jpg, svg, webp, avif, gif, bmp, ico, tif, tiff)"
            )

        lowered = filename.lower().strip()
        if lowered.startswith(("http://", "https://", "blob:", "data:")):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Загрузите файл изображения, а не ссылку"
            )

        if not lowered.endswith(ALLOWED_IMAGE_EXTENSIONS):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Введите допустимый тип файла (png, jpeg, jpg, svg, webp, avif, gif, bmp, ico, tif, tiff)"
            )

        content_type = (upload_file.content_type or "").lower()
        if content_type and content_type not in ALLOWED_IMAGE_CONTENT_TYPES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Введите допустимый тип файла (png, jpeg, jpg, svg, webp, avif, gif, bmp, ico, tif, tiff)"
            )

    @staticmethod
    async def validate_file_size(size: int):
        if size == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Файл пуст"
            )

        if size > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Файл слишком большой"
            )


async def save_image(file: UploadFile, path: str | None = None) -> str:
    """Upload image to MinIO, return full public URL."""
    await ImageFileValidator.validate_file_type(file)
    content = await file.read()
    await ImageFileValidator.validate_file_size(len(content))
    await file.seek(0)
    folder = path or ""
    return await upload_file(file, folder=folder)


async def delete_image(url: str | None):
    """Delete image from MinIO by full URL."""
    await delete_file(url)
