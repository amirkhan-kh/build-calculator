from contextlib import asynccontextmanager

from fastapi import FastAPI

from core.db.init_db import init_permissions, init_platform_admin, init_roles
from core.db.session import async_session
from core.storage import init_storage


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_storage()
    async with async_session() as db:
        await init_permissions(db)
        await init_roles(db)
        await init_platform_admin(db)
    yield
