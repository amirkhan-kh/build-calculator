from decimal import Decimal

from pydantic import BaseModel, Field
from enum import Enum

from .schema_validation_mixins import BuildingValidationMixin


class PriceUnitEnum(str, Enum):
    UZS = "UZS"
    USD = "USD"


class AddBuildingResponse(BaseModel):
    id: int
    name: str
    floor_count: int
    base_price: Decimal = Field(max_digits=20, decimal_places=2)
    price_unit: PriceUnitEnum
    max_coefficient: Decimal = Field(max_digits=20, decimal_places=2)
    complex_id: int


class AddBuildingBody(BuildingValidationMixin):
    name: str
    floor_count: int
    base_price: Decimal = Field(max_digits=20, decimal_places=2)
    price_unit: PriceUnitEnum = PriceUnitEnum.UZS
    max_coefficient: Decimal = Field(max_digits=20, decimal_places=2)
    complex_id: int



class UpdateBuildingBody(BuildingValidationMixin):
    name: str | None = None
    floor_count: int | None = None
    base_price: Decimal | None = Field(default=None, max_digits=20, decimal_places=2)
    price_unit: PriceUnitEnum | None = None
    max_coefficient: Decimal | None = Field(default=None, max_digits=20, decimal_places=2)
    complex_id: int | None = None




















