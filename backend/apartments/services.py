from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from buildings.models import Building
from coefficients.models import BuildingCoefficientType


async def recalculate_final_price(db: AsyncSession, building_id: int, bct_ids: list[int]) -> Decimal:
    building = await db.get(Building, building_id)
    base_price: Decimal = building.base_price
    max_coefficient: Decimal = building.max_coefficient

    if len(bct_ids) == 0:
        return base_price

    each_bct_rate = max_coefficient / Decimal(len(bct_ids))

    result = await db.execute(
        select(BuildingCoefficientType)
        .where(BuildingCoefficientType.id.in_(bct_ids))
    )
    bcts = result.scalars().all()

    total_rate: Decimal = Decimal("0")
    for bct in bcts:
        total_rate += each_bct_rate * bct.rate / Decimal("100")

    price_per_sqm = base_price * (Decimal("1") + total_rate / Decimal("100"))

    return price_per_sqm.quantize(Decimal("0.01"))






