"""apartment_status_new_values

Revision ID: c1a4f82d3e91
Revises: be2a1b06075d
Create Date: 2026-06-10 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op


revision: str = 'c1a4f82d3e91'
down_revision: Union[str, Sequence[str], None] = 'be2a1b06075d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("UPDATE apartments SET status = 'free' WHERE status IN ('built', 'upcoming', 'in_process')")


def downgrade() -> None:
    op.execute("UPDATE apartments SET status = 'built' WHERE status IN ('free', 'sold', 'booked', 'withdrawn')")
