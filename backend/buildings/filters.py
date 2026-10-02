from fastapi_filter.contrib.sqlalchemy import Filter
from decimal import Decimal

from buildings.models import Building


class BuildingFilter(Filter):
    complex_id: int | None = None
    name__ilike: str | None = None
    floor_count: int | None = None
    floor_count__lte: int | None = None
    floor_count__gte: int | None = None
    base_price: Decimal | None = None
    base_price__lte: Decimal | None = None
    base_price__gte: Decimal | None = None

    class Constants(Filter.Constants):
        model = Building