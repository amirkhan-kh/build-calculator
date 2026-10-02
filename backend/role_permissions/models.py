from sqlalchemy import Table, Column, Integer, ForeignKey

from core.db.base_model import BaseModel

role_permission = Table(
    "role_permission",
    BaseModel.metadata,
    Column("role_id", Integer, ForeignKey("roles.id", ondelete="CASCADE"), primary_key=True),
    Column("permission_id", Integer, ForeignKey("permissions.id", ondelete="CASCADE"), primary_key=True),
)





