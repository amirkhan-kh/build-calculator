from datetime import date
from decimal import Decimal
from typing import Optional

from fastapi import HTTPException
from pydantic import BaseModel, Field, field_validator
from starlette import status


class CalculateApartmentBody(BaseModel):
    first_investment_rate: Decimal = Field(max_digits=20, decimal_places=2)
    first_payment_date: date
    period_count: int
    price_per_sqrm: Optional[Decimal] = Field(default=None, max_digits=20, decimal_places=2)

    @field_validator("first_investment_rate")
    @classmethod
    def validate_first_investment_rate(cls, value):
        if value < 0:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Первая инвестиция не может быть отрицательной.")
        return value

    @field_validator("period_count")
    @classmethod
    def validate_period_count(cls, value):
        if value <= 0:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Количество периудов не может быть <= 0.")
        return value













