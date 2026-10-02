from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship

from core.db.base_model import BaseModel


class User(BaseModel):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    fullname = Column(String(100), nullable=False)
    phone = Column(String(100), nullable=False)
    username = Column(String(256), unique=True, nullable=False)
    hashed_password = Column(String(512))
    is_superuser = Column(Boolean, default=False)
    is_platform_admin = Column(Boolean, default=False, nullable=False)

    role_id = Column(Integer, ForeignKey('roles.id', ondelete="SET NULL"), nullable=True)
    role = relationship("Role", back_populates="users", lazy="selectin")

    firm_id = Column(Integer, ForeignKey("firms.id", ondelete="CASCADE"), nullable=True)
    firm = relationship("Firm", back_populates="users", lazy="selectin")





