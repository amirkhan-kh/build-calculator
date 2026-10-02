from fastapi_filter.contrib.sqlalchemy import Filter

from complexes.models import Complex


class ComplexFilter(Filter):
    name__ilike: str | None = None

    class Constants(Filter.Constants):
        model = Complex









