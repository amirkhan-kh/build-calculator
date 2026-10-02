from decimal import Decimal

from fastapi import HTTPException
from pydantic import BaseModel, field_validator
from starlette import status


class ApartmentSchemaValidationMixin(BaseModel):
    """ value can be None since it is being used in update schema. """
    @field_validator("floor", check_fields=False)
    @classmethod
    def validate_floor(cls, value: int | None):
        if value is not None and value <= 0:
            raise ValueError("Floor must be positive.")
        return value

    @field_validator("area", check_fields=False)
    @classmethod
    def validate_area(cls, value: Decimal | None):
        if value is not None and value <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Площадь должна быть положительной.",
            )
        return value

    @field_validator("room_count", check_fields=False)
    @classmethod
    def validate_room_count(cls, value: int | None):
        if value is not None and value <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Количество комнат должна быть положительной.",
            )
        return value

    # @field_validator("btc_ids", check_fields=False)
    # @classmethod
    # def validate_btc_ids(cls, value: list | None):
    #     if value is not None and len(value) == 0:
    #         raise HTTPException(
    #             status_code=status.HTTP_400_BAD_REQUEST,
    #             detail="Коэффиценты не может быть пустым!",
    #         )
    #     return value








