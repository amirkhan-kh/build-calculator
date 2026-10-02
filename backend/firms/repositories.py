from fastapi import HTTPException
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from starlette import status

from auth.services.password_service import PasswordService
from core.repositories import BaseRepository
from firms.models import Firm
from users.models import User


class FirmRepository(BaseRepository):
    def __init__(self, db: AsyncSession):
        super().__init__(db)
        self.password_service = PasswordService()

    async def get_firm_list(self, filters):
        return await self.get_all(Firm, filters)

    async def get_firm_count(self, filters=None):
        stmt = select(func.count(Firm.id))
        if filters is not None:
            stmt = filters.filter(stmt)
        result = await self.db.execute(stmt)
        return result.scalar_one()

    async def get_firm(self, firm_id: int):
        return await self.get(Firm, firm_id)

    async def _ensure_username_free(self, username: str, exclude_user_id: int | None = None):
        stmt = select(User).where(User.username == username)
        if exclude_user_id is not None:
            stmt = stmt.where(User.id != exclude_user_id)
        existing = (await self.db.execute(stmt)).scalar_one_or_none()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Bu login band",
            )

    async def create_firm(self, **kwargs):
        username = kwargs["username"].strip()
        password = kwargs["password"]
        name = kwargs["name"].strip()

        if not name or not username or not password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Nom, login va parol majburiy",
            )

        await self._ensure_username_free(username)

        firm = Firm(
            name=name,
            username=username,
            password=password,
            is_active=True,
        )
        self.db.add(firm)
        await self.db.flush()

        user = User(
            fullname=name,
            phone="-",
            username=username,
            hashed_password=await self.password_service.hash_password(password),
            is_superuser=True,
            is_platform_admin=False,
            firm_id=firm.id,
        )
        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(firm)
        return firm

    async def update_firm(self, firm_id: int, **kwargs):
        firm = await self.get_firm(firm_id)

        user_stmt = await self.db.execute(select(User).where(User.firm_id == firm.id))
        owner = user_stmt.scalars().first()

        if kwargs.get("username"):
            new_username = kwargs["username"].strip()
            await self._ensure_username_free(
                new_username,
                exclude_user_id=owner.id if owner else None,
            )
            firm.username = new_username
            if owner:
                owner.username = new_username

        if kwargs.get("name"):
            firm.name = kwargs["name"].strip()

        if kwargs.get("password"):
            firm.password = kwargs["password"]
            if owner:
                owner.hashed_password = await self.password_service.hash_password(
                    kwargs["password"]
                )

        if "is_active" in kwargs and kwargs["is_active"] is not None:
            firm.is_active = kwargs["is_active"]

        await self.db.commit()
        await self.db.refresh(firm)
        return firm

    async def delete_firm(self, firm_id: int):
        return await self.delete(Firm, firm_id)
