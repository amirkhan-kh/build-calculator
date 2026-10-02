from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from auth.services.password_service import PasswordService
from core.repositories import BaseRepository
from users.models import User


class UserRepository(BaseRepository):
    def __init__(self, db: AsyncSession):
        super().__init__(db)
        self.password_service = PasswordService()

    async def get_user_by_username(self, username: str):
        result = await self.db.execute(
            select(User).where(User.username == username)
        )
        user = result.scalar_one_or_none()
        if user is None:
            return None
        return user

    async def get_user_list(self, filters, firm_id: int | None = None):
        stmt = select(User).where(User.is_platform_admin.is_(False))
        if firm_id is not None:
            stmt = stmt.where(User.firm_id == firm_id)
        if filters is not None:
            stmt = filters.filter(stmt)
        query = await self.db.execute(stmt)
        return query.scalars().all()

    async def create_user(self, **kwargs):
        kwargs["hashed_password"] = await self.password_service.hash_password(kwargs.pop('password'))
        return await self.create(User, **kwargs)

    async def get_user(self, user_id: int):
        return await self.get(User, user_id)

    async def update_user(self, user_id: int, **kwargs):
        return await self.update(User, user_id, **kwargs)

    async def delete_user(self, user_id: int):
        return await self.delete(User, user_id)









