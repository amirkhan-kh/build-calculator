from sqlalchemy import func, select

from buildings.models import Building
from complexes.models import Complex
from core.repositories import BaseRepository


class ComplexRepository(BaseRepository):
    async def get_complex_list(self, filters, firm_id: int | None = None):
        buildings_subq = (
            select(func.count(Building.id))
            .where(Building.complex_id == Complex.id)
            .scalar_subquery()
        )
        stmt = select(Complex, buildings_subq.label("buildings_count"))
        if firm_id is not None:
            stmt = stmt.where(Complex.firm_id == firm_id)
        if filters is not None:
            stmt = filters.filter(stmt)

        result = await self.db.execute(stmt)
        rows = result.all()

        return [
            {
                "id": row.Complex.id,
                "name": row.Complex.name,
                "description": row.Complex.description,
                "logo_url": row.Complex.logo_url,
                "buildings_count": row.buildings_count,
            }
            for row in rows
        ]

    async def create_complex(self, **kwargs):
        return await self.create(Complex, **kwargs)

    async def get_complex(self, complex_id: int, firm_id: int | None = None):
        instance = await self.get(Complex, complex_id)
        if firm_id is not None and instance.firm_id != firm_id:
            from fastapi import HTTPException
            from starlette import status
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
        return instance

    async def update_complex(self, complex_id: int, firm_id: int | None = None, **kwargs):
        await self.get_complex(complex_id, firm_id=firm_id)
        return await self.update(Complex, complex_id, **kwargs)

    async def delete_complex(self, complex_id: int, firm_id: int | None = None):
        await self.get_complex(complex_id, firm_id=firm_id)
        return await self.delete(Complex, complex_id)
