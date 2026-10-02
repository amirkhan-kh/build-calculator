"""apartment_layouts

Revision ID: a3f1c9b2d847
Revises: c1a4f82d3e91
Create Date: 2026-06-10 13:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'a3f1c9b2d847'
down_revision: Union[str, Sequence[str], None] = 'c1a4f82d3e91'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'apartment_layouts',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('building_id', sa.Integer(), nullable=False),
        sa.Column('room_count', sa.Integer(), nullable=False),
        sa.Column('area', sa.Numeric(precision=20, scale=2), nullable=False),
        sa.Column('name', sa.String(length=256), nullable=True),
        sa.ForeignKeyConstraint(['building_id'], ['buildings.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('building_id', 'room_count', 'area', name='uq_layout_building_room_area'),
    )


def downgrade() -> None:
    op.drop_table('apartment_layouts')
