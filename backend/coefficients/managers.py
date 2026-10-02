
from sqlalchemy.ext.asyncio import AsyncSession

from coefficients.repositories import CoefficientRepository, CoefficientTypeRepository
from coefficients.validations import BuildingCoefficientValidator, BuildingCoefficientTypeValidator


class BuildingCoefficientManager:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.bc_repository = CoefficientRepository(db)
        self.bc_validator = BuildingCoefficientValidator(db)

    async def get_coefficient_list(self):
        return await self.bc_repository.get_coefficient_list()

    async def create_coefficient(self, **kwargs):
        await self.bc_validator.validate_building_fk(kwargs.get("building_id"))
        return await self.bc_repository.create_coefficient(**kwargs)

    async def get_coefficient(self, coefficient_id: int):
        return await self.bc_repository.get_coefficient(coefficient_id)

    async def update_coefficient(self, coefficient_id: int, **kwargs):
        await self.bc_validator.validate_building_fk(kwargs.get("building_id"))
        return await self.bc_repository.update_coefficient(coefficient_id, **kwargs)

    async def delete_coefficient(self, coefficient_id: int):
        return await self.bc_repository.delete_coefficient(coefficient_id)


class BuildingCoefficientTypeManager:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.bct_repository = CoefficientTypeRepository(db)
        self.bct_validator = BuildingCoefficientTypeValidator(db)

    async def get_coefficient_types_by_building_id(self, building_id: int):
        await self.bct_validator.validate_building_fk(building_id)

        return await self.bct_repository.get_coefficient_types_by_building_id(building_id)

    async def get_coefficient_type_list(self):
        return await self.bct_repository.get_coefficient_type_list()

    async def create_coefficient_type(self, **kwargs):
        await self.bct_validator.validate_coefficient_fk(kwargs.get("coefficient_id"))
        return await self.bct_repository.create_coefficient_type(**kwargs)

    async def get_coefficient_type(self, coefficient_type_id: int):
        return await self.bct_repository.get_coefficient_type(coefficient_type_id)

    async def update_coefficient_type(self, coefficient_type_id: int, **kwargs):
        if kwargs.get("coefficient_id") is not None:
            await self.bct_validator.validate_coefficient_fk(kwargs.get("coefficient_id"))
        return await self.bct_repository.update_coefficient_type(coefficient_type_id, **kwargs)

    async def delete_coefficient_type(self, coefficient_type_id: int):
        return await self.bct_repository.delete_coefficient_type(coefficient_type_id)


