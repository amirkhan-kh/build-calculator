from sqlalchemy.ext.asyncio import AsyncSession

from roles.repositories import RoleRepository


class RoleManager:
    def __init__(self, db: AsyncSession):
        self.role_repository = RoleRepository(db)

    async def get_role_list(self):
        return await self.role_repository.get_role_list()

    async def create_role(self, **kwargs):
        return await self.role_repository.create_role(**kwargs)

    async def get_role(self, role_id: int):
        return await self.role_repository.get_role(role_id)

    async def update_role(self, role_id: int, **kwargs):
        return await self.role_repository.update_role(role_id, **kwargs)

    async def delete_role(self, role_id: int):
        return await self.role_repository.delete_role(role_id)
















