from sqlalchemy.ext.asyncio import AsyncSession

from buildings.repositories import BuildingRepository
from buildings.validations import BuildingValidator


class BuildingManager:
    def __init__(self, db: AsyncSession):
        self.building_repository = BuildingRepository(db)
        self.building_validator = BuildingValidator(db)

    async def get_building_list(self, filters, firm_id: int | None = None):
        return await self.building_repository.get_building_list(filters, firm_id=firm_id)

    async def create_building(self, firm_id: int | None = None, **kwargs):
        await self.building_validator.validate_complex_fk(kwargs.get("complex_id"))
        if firm_id is not None:
            from firms.access import assert_complex_firm
            await assert_complex_firm(self.building_repository.db, kwargs.get("complex_id"), firm_id)
        return await self.building_repository.create_building(**kwargs)

    async def get_building(self, building_id: int, firm_id: int | None = None):
        return await self.building_repository.get_building(building_id, firm_id=firm_id)

    async def update_building(self, building_id: int, firm_id: int | None = None, **kwargs):
        await self.building_validator.validate_complex_fk(kwargs.get("complex_id"))
        return await self.building_repository.update_building(building_id, firm_id=firm_id, **kwargs)

    async def delete_building(self, building_id: int, firm_id: int | None = None):
        return await self.building_repository.delete_building(building_id, firm_id=firm_id)























