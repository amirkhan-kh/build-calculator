from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.orm import relationship

from core.db.base_model import BaseModel


class Firm(BaseModel):
    __tablename__ = "firms"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(256), nullable=False)
    username = Column(String(256), unique=True, nullable=False)
    password = Column(String(256), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

    users = relationship("User", back_populates="firm")
    complexes = relationship("Complex", back_populates="firm")
