from sqlalchemy import Column, Integer, String, ForeignKey, Table, Numeric, UniqueConstraint
from sqlalchemy.orm import relationship

from core.db.base_model import BaseModel


class BuildingCoefficient(BaseModel):
    __tablename__ = "building_coefficients"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(256), nullable=False)

    building_id = Column(Integer, ForeignKey("buildings.id", ondelete="CASCADE"), nullable=False)
    building = relationship("Building", back_populates="building_coefficients", lazy="selectin")
    building_coefficient_types = relationship(
        "BuildingCoefficientType",
        back_populates="building_coefficient",
        cascade="all, delete-orphan",
        passive_deletes=True,
        lazy="selectin"
    )

    __table_args__ = (
        UniqueConstraint(
            "building_id",
            "name",
            name="uq_building_coefficients_building_id_name"
        ),
    )


apartment_coefficients = Table(
    "apartment_coefficients",
    BaseModel.metadata,
    Column("apartment_id", ForeignKey("apartments.id", ondelete="CASCADE"), primary_key=True),
    Column("coefficient_type_id", ForeignKey("building_coefficient_types.id", ondelete="CASCADE"), primary_key=True),
)


class BuildingCoefficientType(BaseModel):
    __tablename__ = "building_coefficient_types"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(256), nullable=False)
    rate = Column(Numeric(precision=20, scale=2), nullable=False)

    coefficient_id = Column(Integer, ForeignKey("building_coefficients.id", ondelete="CASCADE"), nullable=False)
    apartments = relationship("Apartment", secondary=apartment_coefficients, back_populates="building_coefficient_types", lazy="selectin")
    building_coefficient = relationship("BuildingCoefficient", back_populates="building_coefficient_types", lazy="selectin")

    __table_args__ = (
        UniqueConstraint(
            "coefficient_id",
            "name",
            name="uq_building_coefficients_coefficient_id_name"
        ),
    )


