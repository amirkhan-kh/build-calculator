from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from buildings.image_sevices import delete_image
from core.repositories import BaseRepository
from layouts.models import ApartmentLayout


class LayoutRepository(BaseRepository):
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_building(self, building_id: int) -> list[ApartmentLayout]:
        result = await self.db.execute(
            select(ApartmentLayout).where(ApartmentLayout.building_id == building_id)
        )
        return list(result.scalars().all())

    async def find_matching(self, building_id: int, room_count: int, area: Decimal) -> ApartmentLayout | None:
        result = await self.db.execute(
            select(ApartmentLayout).where(
                ApartmentLayout.building_id == building_id,
                ApartmentLayout.room_count == room_count,
                ApartmentLayout.area == area,
            )
        )
        return result.scalar_one_or_none()

    async def get_by_id(self, layout_id: int) -> ApartmentLayout | None:
        result = await self.db.execute(
            select(ApartmentLayout).where(ApartmentLayout.id == layout_id)
        )
        return result.scalar_one_or_none()

    async def create_layout(self, building_id: int, room_count: int, area: Decimal, name: str | None = None) -> ApartmentLayout:
        layout = ApartmentLayout(building_id=building_id, room_count=room_count, area=area, name=name)
        self.db.add(layout)
        await self.db.flush()
        await self.db.refresh(layout)
        return layout

    async def update_image(self, layout_id: int, image_url: str) -> ApartmentLayout | None:
        layout = await self.get_by_id(layout_id)
        if layout is None:
            return None
        layout.image_url = image_url
        await self.db.flush()
        await self.db.refresh(layout)
        return layout

    async def delete_layout(self, layout_id: int):
        layout = await self.get_by_id(layout_id)
        if layout and layout.image_url:
            await delete_image(layout.image_url)
        return await self.delete(ApartmentLayout, layout_id)
