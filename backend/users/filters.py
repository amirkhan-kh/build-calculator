from fastapi_filter.contrib.sqlalchemy import Filter

from users.models import User


class UsersFilter(Filter):
    username__ilike: str | None = None
    role: str | None = None

    class Constants(Filter.Constants):
        model = User











