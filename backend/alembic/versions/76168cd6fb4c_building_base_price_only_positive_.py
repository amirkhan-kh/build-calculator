"""building_base_price_only_positive_constraint

Revision ID: 76168cd6fb4c
Revises: 0a039b60af9b
Create Date: 2026-01-16 10:44:14.543369

"""
from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = '76168cd6fb4c'
down_revision: Union[str, Sequence[str], None] = '0a039b60af9b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_check_constraint(
        "ck_buildings_base_price_positive",
        "buildings",
        "base_price > 0",
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_constraint(
        "ck_buildings_base_price_positive",
        "buildings",
        type_="check",
    )