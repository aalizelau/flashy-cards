"""Add CASCADE UPDATE to user foreign keys

Revision ID: 77dd7a25cc76
Revises: e77726596f59
Create Date: 2025-09-22 19:35:35.498233

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '77dd7a25cc76'
down_revision: Union[str, Sequence[str], None] = 'e77726596f59'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Drop existing foreign key constraints and recreate with ON UPDATE CASCADE

    # Drop existing foreign keys
    op.drop_constraint('decks_user_id_fkey', 'decks', type_='foreignkey')
    op.drop_constraint('study_sessions_user_id_fkey', 'study_sessions', type_='foreignkey')
    op.drop_constraint('test_analytics_user_id_fkey', 'test_analytics', type_='foreignkey')

    # Recreate foreign keys with ON UPDATE CASCADE
    op.create_foreign_key(
        'decks_user_id_fkey', 'decks', 'users',
        ['user_id'], ['uid'],
        onupdate='CASCADE'
    )
    op.create_foreign_key(
        'study_sessions_user_id_fkey', 'study_sessions', 'users',
        ['user_id'], ['uid'],
        onupdate='CASCADE'
    )
    op.create_foreign_key(
        'test_analytics_user_id_fkey', 'test_analytics', 'users',
        ['user_id'], ['uid'],
        onupdate='CASCADE'
    )


def downgrade() -> None:
    """Downgrade schema."""
    # Drop CASCADE foreign keys and recreate without CASCADE

    # Drop CASCADE foreign keys
    op.drop_constraint('decks_user_id_fkey', 'decks', type_='foreignkey')
    op.drop_constraint('study_sessions_user_id_fkey', 'study_sessions', type_='foreignkey')
    op.drop_constraint('test_analytics_user_id_fkey', 'test_analytics', type_='foreignkey')

    # Recreate original foreign keys without CASCADE
    op.create_foreign_key(
        'decks_user_id_fkey', 'decks', 'users',
        ['user_id'], ['uid']
    )
    op.create_foreign_key(
        'study_sessions_user_id_fkey', 'study_sessions', 'users',
        ['user_id'], ['uid']
    )
    op.create_foreign_key(
        'test_analytics_user_id_fkey', 'test_analytics', 'users',
        ['user_id'], ['uid']
    )
