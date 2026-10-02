from decimal import Decimal, ROUND_HALF_UP
from enum import Enum

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from apartments.repositories import ApartmentRepository
from calculator.schemas import CalculateApartmentBody
from calculator.services import get_payment_dates
from core.db.session import get_db

router = APIRouter(prefix="/calculator", tags=["Calculator"])

class InvestmentTypeEnum(str, Enum):
    PERCENTAGE = "percentage"
    AMOUNT = "amount"


@router.post("/{apartment_id}/")
async def calculate_apartment_pricing(first_investment_type: InvestmentTypeEnum, apartment_id: int, body: CalculateApartmentBody, db: AsyncSession = Depends(get_db)):
    response = {}

    apartment_repo = ApartmentRepository(db)
    apartment = await apartment_repo.get_apartment(apartment_id)

    apartment_area = apartment.area
    first_investment_rate = body.first_investment_rate
    period_count = body.period_count

    price_per_sqm = body.price_per_sqrm if body.price_per_sqrm is not None else apartment.final_price
    total_price = price_per_sqm * apartment_area

    annual_rate = Decimal("20.00")
    monthly_payment_rate = (annual_rate / Decimal("100.00")) / Decimal("12")

    if first_investment_type == InvestmentTypeEnum.PERCENTAGE:
        first_payment_amount = total_price * first_investment_rate / Decimal("100.00")
    else:
        first_payment_amount = first_investment_rate

    credit_sum = total_price - first_payment_amount

    payment_per_period = credit_sum * monthly_payment_rate / (
            1 - (1 + monthly_payment_rate) ** -period_count
    )

    payment_per_period = payment_per_period.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

    new_total_price = payment_per_period * period_count + first_payment_amount

    response["block"] = apartment.building.name
    response["floor"] = apartment.floor
    response["area"] = apartment_area
    response["first_investment_rate"] = first_investment_rate
    response["first_payment_date"] = body.first_payment_date
    response["period_count"] = period_count
    response["old_price_per_sqrm"] = price_per_sqm
    response["new_price_per_sqrm"] = (new_total_price / apartment_area).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    response["old_total_price"] = total_price
    response["new_total_price"] = new_total_price
    response["monthly_payment"] = payment_per_period

    payment_dates = get_payment_dates(period_count, body.first_payment_date)
    response["payment_dates"] = payment_dates

    return response




"""

    Formula Annual Price: CS * MP / (1 - (1 + MP)^(-PC))
    CS = Credit Sum
    MP - Monthly Payment
    PC - Payment Count

    CS = apartment_base_price * apartment_area * (1 - first_investment_rate/100)
    MP = 20% / (month_count * 100)
    PC = month_count

    ---------------------------------------------
    Ready Data:
    Apartment -> block, apartment_number, floor, area, final_price (old_price_per_sqrm)
    User Input -> first_investment_rate, first_payment_date, month_count

    Response:
    {
      "block": "B02",
      "apartment_number": "348",
      "floor": 2,
      "area": 50,
      "first_investment_rate": 50.0,
      "first_payment_date": "10.01.2026", <------|
      "month_count": 36,                         |
                                                 |
      "old_price_per_sqrm": 1800,                |
      "new_price_per_sqrm": 2104.10,             |
                                                 |
      "old_total_price": 90000,                  |
      "new_total_price": 105204.96,              |
                                                 |
      "monthly_payment": 1672.36,                |
                                                 |
      "payment_date": 1, (from 1 to 31) ---------|
    }

"""







