from core.db.base_model import BaseModel

# Side-effect imports: регистрируют таблицы в SQLAlchemy metadata для Alembic
from firms.models import Firm  # noqa: F401
from complexes.models import Complex  # noqa: F401
from buildings.models import Building  # noqa: F401
from apartments.models import Apartment  # noqa: F401
from coefficients.models import BuildingCoefficient, BuildingCoefficientType, apartment_coefficients  # noqa: F401
from layouts.models import ApartmentLayout  # noqa: F401
from users.models import User  # noqa: F401
from roles.models import Role  # noqa: F401
from permissions.models import Permission  # noqa: F401

target_metadata = BaseModel.metadata
