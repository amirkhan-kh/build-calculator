from decimal import Decimal

from fastapi_filter.contrib.sqlalchemy import Filter

from apartments.models import Apartment
from apartments.schemas import StatusEnum

class ApartmentFilter(Filter):
    building_id: int | None = None
    status: StatusEnum | None = None
    room_count: int | None = None
    floor: int | None = None
    area: Decimal | None = None
    area__gte: float | None = None
    area__lte: float | None = None

    class Constants(Filter.Constants):
            model = Apartment