"""building_floor_count_only_positive_constraint

Revision ID: a927d905013a
Revises: 76168cd6fb4c
Create Date: 2026-01-16 11:13:38.727375

"""
from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = 'a927d905013a'
down_revision: Union[str, Sequence[str], None] = '76168cd6fb4c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_check_constraint(
        "ck_buildings_floor_count_positive",
        "buildings",
        "floor_count > 0",
    )

    op.create_check_constraint(
        "ck_buildings_max_coefficient_positive",
        "buildings",
        "max_coefficient > 0",
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_constraint(
        "ck_buildings_floor_count_positive",
        "buildings",
        type_="check",
    )

    op.drop_constraint(
        "ck_buildings_max_coefficient_positive",
        "buildings",
        type_="check",
    )
