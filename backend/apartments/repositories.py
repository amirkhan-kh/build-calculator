from fastapi import UploadFile
from sqlalchemy import select

from sqlalchemy import select

from apartments.models import Apartment
from buildings.models import Building
from coefficients.models import BuildingCoefficientType
from complexes.models import Complex
from core.repositories import BaseRepository


class ApartmentRepository(BaseRepository):
    async def get_apartment_list(self, filters, page, firm_id: int | None = None):
        if firm_id is None:
            response = await super().get_all(Apartment, filters, page)
        else:
            stmt = (
                select(Apartment)
                .join(Building, Apartment.building_id == Building.id)
                .join(Complex, Building.complex_id == Complex.id)
                .where(Complex.firm_id == firm_id)
            )
            if filters is not None:
                stmt = filters.filter(stmt)
            if page:
                stmt = stmt.limit(page["limit"]).offset(page["offset"])
            query = await self.db.execute(stmt)
            response = query.scalars().all()
        for apartment in response:
            apartment.bct_ids = [i.id for i in apartment.building_coefficient_types]
            apartment.price_unit = apartment.building.price_unit

        return response

    async def create_apartment(self, **kwargs):
        bct_ids = kwargs.pop("bct_ids")
        new_apartment = Apartment(**kwargs)

        if bct_ids:
            stmt = (
                select(BuildingCoefficientType)
                .where(BuildingCoefficientType.id.in_(bct_ids))
            )
            result = await self.db.execute(stmt)
            bcts = result.scalars().all()

            new_apartment.building_coefficient_types.extend(bcts)

        self.db.add(new_apartment)
        await self.db.commit()
        await self.db.refresh(new_apartment)

        new_apartment.bct_ids = bct_ids
        new_apartment.price_unit = new_apartment.building.price_unit
        return new_apartment

    async def get_apartment(self, apartment_id: int):
        response = await super().get(Apartment, apartment_id)
        response.bct_ids = [i.id for i in response.building_coefficient_types]
        response.price_unit = response.building.price_unit
        return response

    async def update_apartment(self, instance_id, **kwargs):
        instance = await self._get_instance_by_id(Apartment, instance_id)

        if kwargs:
            bct_ids = kwargs.pop("bct_ids", None)

            for key, value in kwargs.items():
                if hasattr(instance, key) and value is not None:
                    setattr(instance, key, value)

            if bct_ids is not None:
                result = await self.db.execute(
                    select(BuildingCoefficientType)
                    .where(BuildingCoefficientType.id.in_(bct_ids))
                )
                btc_objects = result.scalars().all()

                instance.building_coefficient_types.clear()
                instance.building_coefficient_types.extend(btc_objects)
                instance.bct_ids = bct_ids

            await self.db.commit()
            await self.db.refresh(instance)

        return instance

    async def delete_apartment(self, apartment_id: int):
        return await super().delete(Apartment, apartment_id)


    async def bulk_create_apartments(self, file: UploadFile):
        pass

