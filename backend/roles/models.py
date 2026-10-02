from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

from core.db.base_model import BaseModel
from role_permissions.models import role_permission


class Role(BaseModel):
    __tablename__ = 'roles'
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(256), unique=True, nullable=False)

    permissions = relationship("Permission", secondary=role_permission, back_populates="roles", lazy="selectin")
    users = relationship("User", back_populates="role", lazy="selectin")
