"""add user profile columns

Revision ID: a1b2c3d4e5f6
Revises: 4bfc97207c4a
Create Date: 2026-03-28 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel.sql.sqltypes


# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, Sequence[str], None] = '4bfc97207c4a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('users', sa.Column('display_name', sqlmodel.sql.sqltypes.AutoString(length=60), nullable=True))
    op.add_column('users', sa.Column('height_inches', sa.Float(), nullable=True))
    op.add_column('users', sa.Column('weight_lbs', sa.Float(), nullable=True))
    op.add_column('users', sa.Column('units', sqlmodel.sql.sqltypes.AutoString(), nullable=False, server_default='Imperial'))
    op.add_column('users', sa.Column('workout_sounds', sqlmodel.sql.sqltypes.AutoString(), nullable=False, server_default='On'))
    op.add_column('users', sa.Column('notifications', sqlmodel.sql.sqltypes.AutoString(), nullable=False, server_default='On'))


def downgrade() -> None:
    op.drop_column('users', 'notifications')
    op.drop_column('users', 'workout_sounds')
    op.drop_column('users', 'units')
    op.drop_column('users', 'weight_lbs')
    op.drop_column('users', 'height_inches')
    op.drop_column('users', 'display_name')
