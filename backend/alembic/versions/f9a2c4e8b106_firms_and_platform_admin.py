"""firms and platform admin

Revision ID: f9a2c4e8b106
Revises: e3c7a1b5d029
Create Date: 2026-09-26 11:40:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision = "f9a2c4e8b106"
down_revision = "e3c7a1b5d029"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "firms",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("name", sa.String(length=256), nullable=False),
        sa.Column("username", sa.String(length=256), nullable=False),
        sa.Column("password", sa.String(length=256), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("username"),
    )
    op.add_column(
        "users",
        sa.Column("is_platform_admin", sa.Boolean(), nullable=False, server_default=sa.false()),
    )
    op.add_column("users", sa.Column("firm_id", sa.Integer(), nullable=True))
    op.create_foreign_key(
        "fk_users_firm_id",
        "users",
        "firms",
        ["firm_id"],
        ["id"],
        ondelete="CASCADE",
    )
    op.add_column("complexes", sa.Column("firm_id", sa.Integer(), nullable=True))
    op.create_foreign_key(
        "fk_complexes_firm_id",
        "complexes",
        "firms",
        ["firm_id"],
        ["id"],
        ondelete="CASCADE",
    )

    op.execute(
        """
        INSERT INTO firms (name, username, password, is_active)
        SELECT 'admin', username, 'admin123', true
        FROM users
        WHERE username = 'admin'
          AND NOT EXISTS (SELECT 1 FROM firms WHERE username = 'admin')
        """
    )
    op.execute(
        """
        UPDATE users
        SET firm_id = (SELECT id FROM firms WHERE username = 'admin')
        WHERE username = 'admin'
        """
    )
    op.execute(
        """
        UPDATE complexes
        SET firm_id = (SELECT id FROM firms WHERE username = 'admin')
        WHERE firm_id IS NULL
          AND EXISTS (SELECT 1 FROM firms WHERE username = 'admin')
        """
    )


def downgrade() -> None:
    op.drop_constraint("fk_complexes_firm_id", "complexes", type_="foreignkey")
    op.drop_column("complexes", "firm_id")
    op.drop_constraint("fk_users_firm_id", "users", type_="foreignkey")
    op.drop_column("users", "firm_id")
    op.drop_column("users", "is_platform_admin")
    op.drop_table("firms")
