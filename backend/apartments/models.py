from decimal import Decimal

from sqlalchemy import Column, Integer, String, ForeignKey, Numeric, CheckConstraint
from sqlalchemy.orm import relationship

from core.db.base_model import BaseModel
from coefficients.models import apartment_coefficients


class Apartment(BaseModel):
    __tablename__ = "apartments"

    id = Column(Integer, primary_key=True, autoincrement=True)
    number = Column(String(256), nullable=False)
    floor = Column(Integer, nullable=False)
    area = Column(Numeric(precision=20, scale=2), nullable=False)
    room_count = Column(Integer, nullable=False)
    final_price = Column(Numeric(precision=20, scale=2), nullable=False, default=Decimal("0.00"))
    status = Column(String(100), nullable=False, default="free")  # free, sold, booked, withdrawn

    building_id = Column(Integer, ForeignKey("buildings.id", ondelete="CASCADE"), nullable=False)
    building_coefficient_types = relationship("BuildingCoefficientType", secondary=apartment_coefficients, back_populates="apartments", lazy="selectin")
    building = relationship("Building", back_populates="apartments", lazy="selectin")

    __table_args__ = (
        CheckConstraint("area > 0", name="ck_apartments_area_positive"),
        CheckConstraint("room_count > 0", name="ck_apartments_room_count_positive"),
    )

