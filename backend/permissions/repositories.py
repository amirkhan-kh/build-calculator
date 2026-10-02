from core.repositories import BaseRepository
from permissions.models import Permission


class PermissionRepository(BaseRepository):
    async def get_permission_list(self):
        return await self.get_all(Permission)

    async def create_permission(self, **kwargs):
        return await self.create(Permission, **kwargs)

    async def get_permission(self, permission_id: int):
        return await self.get(Permission, permission_id)

    async def update_permission(self, permission_id: int, **kwargs):
        return await self.update(Permission, permission_id, **kwargs)

    async def delete_permission(self, permission_id: int):
        return await self.delete(Permission, permission_id)











