from decimal import Decimal
from typing import Optional

from fastapi import APIRouter, Depends, Query, UploadFile, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from starlette import status

from auth.dependencies import get_current_user
from buildings.image_sevices import save_image, delete_image
from core.db.session import get_db
from firms.access import assert_building_firm
from layouts.repositories import LayoutRepository
from layouts.schemas import AddLayoutBody, LayoutResponse
from users.models import User

router = APIRouter(prefix="/layouts", tags=["Layouts"])


@router.get("/", response_model=list[LayoutResponse])
async def get_layouts(
    building_id: Optional[int] = Query(default=None),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    from layouts.models import ApartmentLayout
    repo = LayoutRepository(db)
    if building_id is not None:
        if user.firm_id:
            await assert_building_firm(db, building_id, user.firm_id)
        return await repo.get_by_building(building_id)
    if user.firm_id:
        return []
    return await repo.get_all(ApartmentLayout)


@router.post("/add/", response_model=LayoutResponse)
async def add_layout(
    body: AddLayoutBody,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    if user.firm_id:
        await assert_building_firm(db, body.building_id, user.firm_id)
    from sqlalchemy.exc import IntegrityError
    repo = LayoutRepository(db)
    existing = await repo.find_matching(body.building_id, body.room_count, body.area)
    if existing:
        return existing
    auto_name = body.name or f"{body.room_count}-комн. {body.area}м²"
    try:
        layout = await repo.create_layout(
            building_id=body.building_id,
            room_count=body.room_count,
            area=body.area,
            name=auto_name,
        )
        await db.commit()
        return layout
    except IntegrityError:
        await db.rollback()
        existing = await repo.find_matching(body.building_id, body.room_count, body.area)
        return existing


@router.get("/check/", response_model=Optional[LayoutResponse])
async def check_layout(
    building_id: int,
    room_count: int,
    area: Decimal,
    db: AsyncSession = Depends(get_db),
):
    repo = LayoutRepository(db)
    return await repo.find_matching(building_id, room_count, area)


@router.delete("/{layout_id}/", status_code=status.HTTP_204_NO_CONTENT)
async def delete_layout(layout_id: int, db: AsyncSession = Depends(get_db)):
    repo = LayoutRepository(db)
    return await repo.delete_layout(layout_id)


@router.patch("/{layout_id}/image", response_model=LayoutResponse)
async def upload_layout_image(
    layout_id: int,
    image: UploadFile,
    db: AsyncSession = Depends(get_db),
):
    repo = LayoutRepository(db)
    layout = await repo.get_by_id(layout_id)
    if layout is None:
        raise HTTPException(status_code=404, detail="Layout not found")

    if layout.image_url:
        await delete_image(layout.image_url)

    full_url = await save_image(image, path="layouts")
    updated = await repo.update_image(layout_id, full_url)
    await db.commit()
    return updated
