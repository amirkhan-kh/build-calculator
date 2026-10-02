from sqlalchemy import select

from core.repositories import BaseRepository
from permissions.models import Permission
from roles.models import Role


class RoleRepository(BaseRepository):
    async def _get_permissions_by_ids(self, permission_ids: list[int]):
        result = await self.db.execute(
            select(Permission).where(Permission.id.in_(permission_ids))
        )
        return result.scalars().all()

    async def get_role_list(self):
        return await self.get_all(Role)

    async def create_role(self, **kwargs):
        permission_ids = kwargs.pop('permission_ids', None)
        new_role = Role(**kwargs)

        if permission_ids is not None and permission_ids:
            new_role.permissions.extend(await self._get_permissions_by_ids(permission_ids))

        self.db.add(new_role)
        await self.db.commit()
        await self.db.refresh(new_role)
        return new_role


    async def get_role(self, role_id: int):
        return await self.get(Role, role_id)

    async def update_role(self, role_id: int, **kwargs):
        instance = await self._get_instance_by_id(Role, role_id)
        permission_ids = kwargs.pop('permission_ids', None)

        for key, value in kwargs.items():
            if value is not None:
                setattr(instance, key, value)

        if permission_ids is not None:
            instance.permissions.clear()
            instance.permissions.extend(await self._get_permissions_by_ids(permission_ids))

        await self.db.commit()
        return instance

    async def delete_role(self, role_id: int):
        return await self.delete(Role, role_id)











