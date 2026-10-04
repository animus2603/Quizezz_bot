"""add user phone_verified_at

Revision ID: e4457e2ed5a2
Revises: 6485fbe7db24
Create Date: 2026-10-04 20:46:36.886362

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'e4457e2ed5a2'
down_revision = '6485fbe7db24'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('users', sa.Column('phone_verified_at', sa.DateTime(), nullable=True))


def downgrade() -> None:
    with op.batch_alter_table('users') as batch_op:
        batch_op.drop_column('phone_verified_at')
