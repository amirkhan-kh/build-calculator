"""apartments_area_pos_constaint

Revision ID: fab5b6ccd650
Revises: 45b6978d4263
Create Date: 2026-01-17 11:53:27.784467

"""
from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = 'fab5b6ccd650'
down_revision: Union[str, Sequence[str], None] = '45b6978d4263'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_check_constraint(
        "ck_apartments_area_positive",
        "apartments",
        "area > 0",
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_constraint(
        "ck_apartments_area_positive",
        "apartments",
        type_="check",
    )