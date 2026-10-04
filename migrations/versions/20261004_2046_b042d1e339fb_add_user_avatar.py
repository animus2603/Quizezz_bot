"""add user avatar

Revision ID: b042d1e339fb
Revises: e4457e2ed5a2
Create Date: 2026-10-04 20:46:37.371276

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'b042d1e339fb'
down_revision = 'e4457e2ed5a2'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('users', sa.Column('avatar_file_id', sa.String(length=255), nullable=True))
    op.add_column('users', sa.Column('avatar_file_path', sa.String(length=255), nullable=True))


def downgrade() -> None:
    with op.batch_alter_table('users') as batch_op:
        batch_op.drop_column('avatar_file_path')
        batch_op.drop_column('avatar_file_id')
