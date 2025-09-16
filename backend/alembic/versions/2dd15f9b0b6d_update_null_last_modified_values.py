"""Update NULL last_modified values

Revision ID: 2dd15f9b0b6d
Revises: e231b877ecfe
Create Date: 2025-09-16 18:26:28.425512

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '2dd15f9b0b6d'
down_revision: Union[str, Sequence[str], None] = 'e231b877ecfe'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Update NULL last_modified values to match created_at values
    op.execute("""
        UPDATE decks
        SET last_modified = created_at
        WHERE last_modified IS NULL
    """)


def downgrade() -> None:
    """Downgrade schema."""
    # No downgrade needed as this is a data fix
    pass
