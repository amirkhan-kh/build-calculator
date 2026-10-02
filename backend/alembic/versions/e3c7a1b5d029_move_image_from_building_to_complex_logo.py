"""move image from building to complex logo

Revision ID: e3c7a1b5d029
Revises: b7e2d1f4a903
Create Date: 2026-06-10 14:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision = 'e3c7a1b5d029'
down_revision = 'b7e2d1f4a903'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.drop_column('buildings', 'image_url')
    op.add_column('complexes', sa.Column('logo_url', sa.String(512), nullable=True))


def downgrade() -> None:
    op.drop_column('complexes', 'logo_url')
    op.add_column('buildings', sa.Column('image_url', sa.String(255), nullable=True))
