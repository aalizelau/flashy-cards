"""Remove legacy example sentence columns

Revision ID: e77726596f59
Revises: 940fc95d8641
Create Date: 2025-09-19 21:11:11.091390

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e77726596f59'
down_revision: Union[str, Sequence[str], None] = '940fc95d8641'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Remove legacy example sentence columns."""
    # Drop the legacy example sentence columns since they've been migrated to custom_data
    op.drop_column('cards', 'example_sentence_1')
    op.drop_column('cards', 'sentence_translation_1')
    op.drop_column('cards', 'example_sentence_2')
    op.drop_column('cards', 'sentence_translation_2')


def downgrade() -> None:
    """Restore legacy example sentence columns."""
    # Re-add the legacy columns for downgrade
    op.add_column('cards', sa.Column('example_sentence_1', sa.String(), nullable=True))
    op.add_column('cards', sa.Column('sentence_translation_1', sa.String(), nullable=True))
    op.add_column('cards', sa.Column('example_sentence_2', sa.String(), nullable=True))
    op.add_column('cards', sa.Column('sentence_translation_2', sa.String(), nullable=True))
