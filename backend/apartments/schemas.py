from decimal import Decimal

from pydantic import BaseModel, Field, computed_field
from enum import Enum

from apartments.schema_validation_mixins import ApartmentSchemaValidationMixin


class AddApartmentResponse(BaseModel):
    id: int
    number: str
    floor: int
    area: Decimal = Field(max_digits=20, decimal_places=2)
    room_count: int
    status: str
    final_price: Decimal = Field(max_digits=20, decimal_places=2)
    building_id: int
    bct_ids: list[int]
    price_unit: str = "UZS"

    @computed_field
    @property
    def total_price(self) -> Decimal:
        return (self.final_price * self.area).quantize(Decimal("0.01"))


class StatusEnum(str, Enum):
    FREE = "free"
    SOLD = "sold"
    BOOKED = "booked"
    WITHDRAWN = "withdrawn"


class AddApartmentBody(ApartmentSchemaValidationMixin):
    number: str
    floor: int
    area: Decimal = Field(max_digits=20, decimal_places=2)
    room_count: int
    status: StatusEnum
    building_id: int
    bct_ids: list[int]


class UpdateApartmentBody(ApartmentSchemaValidationMixin):
    number: str | None = None
    floor: int | None = None
    area: Decimal | None = Field(default=None, max_digits=20, decimal_places=2)
    room_count: int | None = None
    final_price: Decimal | None = Field(default=None, max_digits=20, decimal_places=2)
    status: StatusEnum | None = None
    building_id: int
    bct_ids: list[int]



















