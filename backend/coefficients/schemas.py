from decimal import Decimal

from pydantic import BaseModel, Field, StrictInt


class AddCoefficientResponse(BaseModel):
    id: int
    name: str
    building_id: int | None


class AddCoefficientBody(BaseModel):
    name: str
    building_id: int


class UpdateCoefficientBody(BaseModel):
    name: str | None = None
    building_id: int | None = None


class GetBCTs(BaseModel):
    id: int
    name: str
    rate: Decimal = Field(max_digits=20, decimal_places=2)

class GetBCsWithBCTs(BaseModel):
    id: int
    name: str
    bcts: list[GetBCTs]




""" ---------------------------------------------- """
class AddCoefficientTypeResponse(BaseModel):
    id: int
    name: str
    rate: Decimal = Field(max_digits=20, decimal_places=2)
    coefficient_id: int


class AddCoefficientTypeBody(BaseModel):
    name: str
    rate: Decimal = Field(max_digits=20, decimal_places=2)
    coefficient_id: int


class UpdateCoefficientTypeBody(BaseModel):
    name: str | None = None
    rate: Decimal | None = Field(default=None, max_digits=20, decimal_places=2)
    coefficient_id: StrictInt | None = None

""" ----------------------------------------------------------- """
# Custom


class GetCoefTypeByBuildingId(BaseModel):
    name: str
















