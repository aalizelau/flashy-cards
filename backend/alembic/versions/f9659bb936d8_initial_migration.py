"""Initial migration

Revision ID: f9659bb936d8
Revises: 
Create Date: 2025-08-11 10:32:26.676944

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f9659bb936d8'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Create users table
    op.create_table('users',
        sa.Column('uid', sa.String(), nullable=False),
        sa.Column('email', sa.String(), nullable=False),
        sa.Column('name', sa.String(), nullable=True),
        sa.Column('selected_language', sa.String(), nullable=True, default='en'),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('uid')
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
    op.create_index(op.f('ix_users_uid'), 'users', ['uid'], unique=False)

    # Create decks table
    op.create_table('decks',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.String(), nullable=False),
        sa.Column('language', sa.String(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('progress', sa.Float(), nullable=True),
        sa.Column('card_count', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.uid'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_decks_id'), 'decks', ['id'], unique=False)
    op.create_index(op.f('ix_decks_language'), 'decks', ['language'], unique=False)
    op.create_index(op.f('ix_decks_user_id'), 'decks', ['user_id'], unique=False)

    # Create cards table
    op.create_table('cards',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('deck_id', sa.Integer(), nullable=True),
        sa.Column('front', sa.String(), nullable=False),
        sa.Column('back', sa.String(), nullable=False),
        sa.Column('accuracy', sa.Float(), nullable=True),
        sa.Column('total_attempts', sa.Integer(), nullable=True),
        sa.Column('correct_answers', sa.Integer(), nullable=True),
        sa.Column('last_reviewed_at', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('audio_path', sa.String(), nullable=True),
        sa.ForeignKeyConstraint(['deck_id'], ['decks.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_cards_id'), 'cards', ['id'], unique=False)

    # Create study_sessions table
    op.create_table('study_sessions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.String(), nullable=False),
        sa.Column('deck_id', sa.Integer(), nullable=False),
        sa.Column('passed_words', sa.ARRAY(sa.Integer()), nullable=False),
        sa.Column('missed_words', sa.ARRAY(sa.Integer()), nullable=False),
        sa.Column('total_cards', sa.Integer(), nullable=False),
        sa.Column('passed_count', sa.Integer(), nullable=False),
        sa.Column('missed_count', sa.Integer(), nullable=False),
        sa.Column('accuracy_percentage', sa.Float(), nullable=False),
        sa.Column('completed_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['deck_id'], ['decks.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.uid'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_study_sessions_user_id'), 'study_sessions', ['user_id'], unique=False)

    # Create test_analytics table
    op.create_table('test_analytics',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.String(), nullable=False),
        sa.Column('total_cards_studied', sa.Integer(), nullable=True),
        sa.Column('total_correct_answers', sa.Integer(), nullable=True),
        sa.Column('cards_mastered', sa.Integer(), nullable=True),
        sa.Column('overall_average_progress', sa.Float(), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.uid'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_test_analytics_id'), 'test_analytics', ['id'], unique=False)
    op.create_index(op.f('ix_test_analytics_user_id'), 'test_analytics', ['user_id'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_test_analytics_user_id'), table_name='test_analytics')
    op.drop_index(op.f('ix_test_analytics_id'), table_name='test_analytics')
    op.drop_table('test_analytics')
    op.drop_index(op.f('ix_study_sessions_user_id'), table_name='study_sessions')
    op.drop_table('study_sessions')
    op.drop_index(op.f('ix_cards_id'), table_name='cards')
    op.drop_table('cards')
    op.drop_index(op.f('ix_decks_user_id'), table_name='decks')
    op.drop_index(op.f('ix_decks_language'), table_name='decks')
    op.drop_index(op.f('ix_decks_id'), table_name='decks')
    op.drop_table('decks')
    op.drop_index(op.f('ix_users_uid'), table_name='users')
    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.drop_table('users')
