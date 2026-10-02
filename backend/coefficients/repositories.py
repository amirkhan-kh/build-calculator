
from buildings.models import Building
from coefficients.models import BuildingCoefficient, BuildingCoefficientType
from core.repositories import BaseRepository


class CoefficientRepository(BaseRepository):
    async def get_coefficient_list(self):
        return await self.get_all(BuildingCoefficient)

    async def create_coefficient(self, **kwargs):
        return await self.create(BuildingCoefficient, **kwargs)

    async def get_coefficient(self, coefficient_id: int):
        return await self.get(BuildingCoefficient, coefficient_id)

    async def update_coefficient(self, coefficient_id: int, **kwargs):
        return await self.update(BuildingCoefficient, coefficient_id, **kwargs)

    async def delete_coefficient(self, coefficient_id: int):
        return await self.delete(BuildingCoefficient, coefficient_id)


class CoefficientTypeRepository(BaseRepository):
    async def get_coefficient_types_by_building_id(self, building_id: int):
        building_instance = await self.db.get(Building, building_id)

        bcs = building_instance.building_coefficients
        for bc in bcs:
            bc.bcts = bc.building_coefficient_types

        return bcs

    async def get_coefficient_type_list(self):
        return await self.get_all(BuildingCoefficientType)

    async def create_coefficient_type(self, **kwargs):
        return await self.create(BuildingCoefficientType, **kwargs)

    async def get_coefficient_type(self, coefficient_type_id: int):
        return await self.get(BuildingCoefficientType, coefficient_type_id)

    async def update_coefficient_type(self, coefficient_type_id: int, **kwargs):
        return await self.update(BuildingCoefficientType, coefficient_type_id, **kwargs)

    async def delete_coefficient_type(self, coefficient_type_id: int):
        return await self.delete(BuildingCoefficientType, coefficient_type_id)














