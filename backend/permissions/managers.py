from sqlalchemy.ext.asyncio import AsyncSession

from permissions.repositories import PermissionRepository


class PermissionManager:
    def __init__(self, db: AsyncSession):
        self.permission_repository = PermissionRepository(db)

    async def get_permission_list(self):
        return await self.permission_repository.get_permission_list()

    async def create_permission(self, **kwargs):
        return await self.permission_repository.create_permission(**kwargs)

    async def get_permission(self, permission_id: int):
        return await self.permission_repository.get_permission(permission_id)

    async def update_permission(self, permission_id: int, **kwargs):
        return await self.permission_repository.update_permission(permission_id, **kwargs)

    async def delete_permission(self, permission_id: int):
        return await self.permission_repository.delete_permission(permission_id)
















