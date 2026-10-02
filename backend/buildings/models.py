from sqlalchemy import Column, Integer, String, ForeignKey, Numeric, CheckConstraint
from sqlalchemy.orm import relationship

from core.db.base_model import BaseModel


class Building(BaseModel):
    __tablename__ = "buildings"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(256), nullable=False)
    floor_count = Column(Integer, nullable=False)
    base_price = Column(Numeric(precision=20, scale=2), nullable=False)  # price per square meter
    price_unit = Column(String(10), nullable=False, default="UZS")
    max_coefficient = Column(Numeric(precision=20, scale=2), nullable=False)

    complex_id = Column(Integer, ForeignKey("complexes.id", ondelete="CASCADE"), nullable=False)

    building_coefficients = relationship("BuildingCoefficient", back_populates="building", lazy="selectin")
    apartments = relationship("Apartment", back_populates="building", lazy="selectin")
    layouts = relationship("ApartmentLayout", back_populates="building", lazy="selectin", cascade="all, delete-orphan")


    __table_args__ = (
        CheckConstraint("floor_count > 0", name="ck_buildings_floor_count_positive"),
        CheckConstraint("base_price > 0", name="ck_buildings_base_price_positive"),
        CheckConstraint("max_coefficient > 0", name="ck_buildings_max_coefficient_positive"),
    )