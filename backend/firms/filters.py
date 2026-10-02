from fastapi_filter.contrib.sqlalchemy import Filter

from firms.models import Firm


class FirmFilter(Filter):
    name__ilike: str | None = None
    is_active: bool | None = None

    class Constants(Filter.Constants):
        model = Firm
