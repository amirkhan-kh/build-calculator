from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

from core.db.base_model import BaseModel


class Complex(BaseModel):
    __tablename__ = "complexes"
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(256), nullable=False)
    description = Column(String(512), nullable=True)
    logo_url = Column(String(512), nullable=True)
    firm_id = Column(Integer, ForeignKey("firms.id", ondelete="CASCADE"), nullable=True)
    firm = relationship("Firm", back_populates="complexes")

