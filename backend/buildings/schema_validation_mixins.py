from decimal import Decimal
from pydantic import BaseModel, field_validator


class BuildingValidationMixin(BaseModel):
    @field_validator("floor_count", check_fields=False)
    @classmethod
    def validate_floor_count(cls, value: int | None):
        if value is not None and value <= 0:
            raise ValueError("Количество этажей должно быть положительным.")
        return value

    @field_validator("base_price", check_fields=False)
    @classmethod
    def validate_base_price(cls, value: Decimal | None):
        if value is not None and value <= 0:
            raise ValueError("Базовая цена должна быть положительной.")
        return value

    @field_validator("max_coefficient", check_fields=False)
    @classmethod
    def validate_max_coefficient(cls, value: Decimal | None):
        if value is not None and value <= 0:
            raise ValueError("Максимальный коэффициент должен быть положительным.")
        return value
