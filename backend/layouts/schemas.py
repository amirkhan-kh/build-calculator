from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, Field


class LayoutResponse(BaseModel):
    id: int
    building_id: int
    room_count: int
    area: Decimal
    name: Optional[str] = None
    image_url: Optional[str] = None

    model_config = {"from_attributes": True}


class AddLayoutBody(BaseModel):
    building_id: int
    room_count: int
    area: Decimal = Field(max_digits=20, decimal_places=2)
    name: Optional[str] = None
