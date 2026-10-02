"""layout image_url

Revision ID: b7e2d1f4a903
Revises: a3f1c9b2d847
Create Date: 2026-06-10 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision = 'b7e2d1f4a903'
down_revision = 'a3f1c9b2d847'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('apartment_layouts', sa.Column('image_url', sa.String(512), nullable=True))


def downgrade() -> None:
    op.drop_column('apartment_layouts', 'image_url')
