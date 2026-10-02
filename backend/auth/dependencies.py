from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession

from auth.managers import AuthManager
from core.db.session import get_db
from core.exceptions import Forbidden
from users.models import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")


async def get_current_user(
        token: str = Depends(oauth2_scheme),
        db: AsyncSession = Depends(get_db),
):
    manager = AuthManager(db)
    return await manager.get_me(token)


def has_permission(permission: str):
    async def permission_checker(user: User = Depends(get_current_user)):
        if user.is_platform_admin:
            raise Forbidden("Permission Denied")

        if user.is_superuser:
            return None

        if not user.role:
            raise Forbidden("Permission Denied")

        for perm in user.role.permissions:
            if perm.codename == permission:
                return None

        raise Forbidden("Permission Denied")

    return permission_checker

def has_permissions(permissions: list):
    async def permission_checker(user: User = Depends(get_current_user)):
        if user.is_platform_admin:
            raise Forbidden("Permission Denied")

        if user.is_superuser:
            return None

        if not user.role:
            raise Forbidden("Permission Denied")

        permission_codenames = [perm.codename for perm in user.role.permissions]
        result = all(perm in permission_codenames for perm in permissions)
        if result:
            return None

        raise Forbidden("Permission Denied")

    return permission_checker

