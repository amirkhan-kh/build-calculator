from fastapi import Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from starlette import status

from auth.dependencies import get_current_user
from buildings.models import Building
from complexes.models import Complex
from core.db.session import get_db
from core.exceptions import Forbidden
from users.models import User


async def require_platform_admin(user: User = Depends(get_current_user)):
    if not user.is_platform_admin:
        raise Forbidden("Permission Denied")
    return user


async def require_firm_user(user: User = Depends(get_current_user)):
    if user.is_platform_admin:
        raise Forbidden("Permission Denied")
    if not user.firm_id:
        raise Forbidden("Permission Denied")
    return user


async def assert_complex_firm(db: AsyncSession, complex_id: int, firm_id: int):
    complex_obj = (
        await db.execute(select(Complex).where(Complex.id == complex_id))
    ).scalar_one_or_none()
    if not complex_obj or complex_obj.firm_id != firm_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    return complex_obj


async def assert_building_firm(db: AsyncSession, building_id: int, firm_id: int):
    building = (
        await db.execute(select(Building).where(Building.id == building_id))
    ).scalar_one_or_none()
    if not building:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    await assert_complex_firm(db, building.complex_id, firm_id)
    return building
