from sqlalchemy import select

from buildings.models import Building
from complexes.models import Complex
from core.repositories import BaseRepository


class BuildingRepository(BaseRepository):
    async def get_building_list(self, filters, firm_id: int | None = None):
        stmt = select(Building)
        if filters is not None:
            stmt = filters.filter(stmt)
        if firm_id is not None:
            stmt = stmt.join(Complex, Building.complex_id == Complex.id).where(
                Complex.firm_id == firm_id
            )
        query = await self.db.execute(stmt)
        return query.scalars().all()

    async def create_building(self, **kwargs):
        return await self.create(Building, **kwargs)

    async def get_building(self, building_id: int, firm_id: int | None = None):
        instance = await self.get(Building, building_id)
        if firm_id is not None:
            from firms.access import assert_building_firm
            await assert_building_firm(self.db, building_id, firm_id)
        return instance

    async def update_building(self, building_id: int, firm_id: int | None = None, **kwargs):
        await self.get_building(building_id, firm_id=firm_id)
        return await self.update(Building, building_id, **kwargs)

    async def delete_building(self, building_id: int, firm_id: int | None = None):
        await self.get_building(building_id, firm_id=firm_id)
        return await self.delete(Building, building_id)
