from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from starlette import status
from starlette.responses import Response

from core.validations import BaseValidator


class BaseRepository:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.base_validator = BaseValidator(db)

    async def _get_instance_by_id(self, model, instance_id: int):
        stmt = await self.db.execute(select(model).where(model.id == instance_id))
        instance = stmt.scalar_one_or_none()

        if not instance:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
        return instance

    async def get_all(self, model, filters=None, page=None):
        stmt = select(model)
        if filters is not None:
            stmt = filters.filter(stmt)

        if page:
            stmt = stmt.limit(page["limit"]).offset(page["offset"])

        query = await self.db.execute(stmt)
        results = query.scalars().all()
        return results

    async def create(self, model, **kwargs):
        new_instance = model(**kwargs)

        self.db.add(new_instance)
        await self.db.commit()
        await self.db.refresh(new_instance)

        return new_instance

    async def get(self, model, instance_id: int):
        instance = await self._get_instance_by_id(model, instance_id)
        return instance

    async def update(self, model, instance_id, **kwargs):
        instance = await self._get_instance_by_id(model, instance_id)

        if kwargs:
            for key, value in kwargs.items():
                if value is not None:
                    setattr(instance, key, value)

            await self.db.commit()

        return instance

    async def delete(self, model, instance_id: int):
        instance = await self._get_instance_by_id(model, instance_id)

        await self.db.delete(instance)
        await self.db.commit()

        return Response(status_code=status.HTTP_204_NO_CONTENT)






















