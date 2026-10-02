"""apartments_room_count_pos_constaint

Revision ID: 04c68d926f3b
Revises: fab5b6ccd650
Create Date: 2026-01-17 12:06:45.035542

"""
from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = '04c68d926f3b'
down_revision: Union[str, Sequence[str], None] = 'fab5b6ccd650'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_check_constraint(
        "ck_apartments_room_count_positive",
        "apartments",
        "room_count > 0",
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_constraint(
        "ck_apartments_room_count_positive",
        "apartments",
        type_="check",
    )
