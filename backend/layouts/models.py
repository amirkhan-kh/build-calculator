
from sqlalchemy import Column, Integer, ForeignKey, Numeric, String, UniqueConstraint
from sqlalchemy.orm import relationship

from core.db.base_model import BaseModel


class ApartmentLayout(BaseModel):
    __tablename__ = "apartment_layouts"

    id = Column(Integer, primary_key=True, autoincrement=True)
    building_id = Column(Integer, ForeignKey("buildings.id", ondelete="CASCADE"), nullable=False)
    room_count = Column(Integer, nullable=False)
    area = Column(Numeric(precision=20, scale=2), nullable=False)
    name = Column(String(256), nullable=True)
    image_url = Column(String(512), nullable=True)

    building = relationship("Building", back_populates="layouts", lazy="selectin")

    __table_args__ = (
        UniqueConstraint("building_id", "room_count", "area", name="uq_layout_building_room_area"),
    )
