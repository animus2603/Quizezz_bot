"""add banner description and defaults_seeded

Revision ID: dc43a784405e
Revises: b042d1e339fb
Create Date: 2026-10-04 20:59:40.321955

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'dc43a784405e'
down_revision = 'b042d1e339fb'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('banners', sa.Column('description', sa.Text(), nullable=True))
    op.add_column(
        'app_settings',
        sa.Column('defaults_seeded', sa.Boolean(), nullable=False, server_default=sa.false())
    )


def downgrade() -> None:
    with op.batch_alter_table('app_settings') as batch_op:
        batch_op.drop_column('defaults_seeded')
    with op.batch_alter_table('banners') as batch_op:
        batch_op.drop_column('description')
