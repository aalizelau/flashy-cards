"""Migrate existing example sentences to custom fields

Revision ID: 940fc95d8641
Revises: 151fe91484e4
Create Date: 2025-09-19 21:10:30.088161

"""
from typing import Sequence, Union
import json

from alembic import op
import sqlalchemy as sa
from sqlalchemy import text


# revision identifiers, used by Alembic.
revision: str = '940fc95d8641'
down_revision: Union[str, Sequence[str], None] = '151fe91484e4'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Migrate existing example sentence data to custom fields."""

    # Get database connection
    connection = op.get_bind()

    # Step 1: Find all decks that have cards with example sentences
    result = connection.execute(text("""
        SELECT DISTINCT deck_id
        FROM cards
        WHERE example_sentence_1 IS NOT NULL
           OR sentence_translation_1 IS NOT NULL
           OR example_sentence_2 IS NOT NULL
           OR sentence_translation_2 IS NOT NULL
    """))

    deck_ids_with_sentences = [row[0] for row in result.fetchall()]

    # Step 2: Set default custom_fields for these decks
    default_custom_fields = [
        {"name": "example_sentence", "label": "Example Sentence"},
        {"name": "sentence_translation", "label": "Sentence Translation"}
    ]

    for deck_id in deck_ids_with_sentences:
        connection.execute(text("""
            UPDATE decks
            SET custom_fields = :custom_fields
            WHERE id = :deck_id AND custom_fields IS NULL
        """), {
            'custom_fields': json.dumps(default_custom_fields),
            'deck_id': deck_id
        })

    # Step 3: Migrate card data from legacy fields to custom_data
    # Get all cards that have example sentence data
    cards_result = connection.execute(text("""
        SELECT id, example_sentence_1, sentence_translation_1,
               example_sentence_2, sentence_translation_2, custom_data
        FROM cards
        WHERE example_sentence_1 IS NOT NULL
           OR sentence_translation_1 IS NOT NULL
           OR example_sentence_2 IS NOT NULL
           OR sentence_translation_2 IS NOT NULL
    """))

    for card in cards_result.fetchall():
        card_id, ex1, trans1, ex2, trans2, existing_custom_data = card

        # Start with existing custom_data if any
        custom_data = {}
        if existing_custom_data:
            try:
                custom_data = json.loads(existing_custom_data) if isinstance(existing_custom_data, str) else existing_custom_data
            except:
                custom_data = {}

        # Migrate sentence data to custom format
        # Combine both example sentences into single fields (prioritizing the first one)
        if ex1 and trans1:
            custom_data["example_sentence"] = ex1
            custom_data["sentence_translation"] = trans1
        elif ex2 and trans2:
            custom_data["example_sentence"] = ex2
            custom_data["sentence_translation"] = trans2
        elif ex1:
            custom_data["example_sentence"] = ex1
        elif ex2:
            custom_data["example_sentence"] = ex2
        elif trans1:
            custom_data["sentence_translation"] = trans1
        elif trans2:
            custom_data["sentence_translation"] = trans2

        # Update the card with new custom_data
        if custom_data:
            connection.execute(text("""
                UPDATE cards
                SET custom_data = :custom_data
                WHERE id = :card_id
            """), {
                'custom_data': json.dumps(custom_data),
                'card_id': card_id
            })


def downgrade() -> None:
    """Downgrade: restore example sentence data from custom fields."""

    connection = op.get_bind()

    # Step 1: Restore card data from custom_data back to legacy fields
    cards_result = connection.execute(text("""
        SELECT id, custom_data
        FROM cards
        WHERE custom_data IS NOT NULL
    """))

    for card in cards_result.fetchall():
        card_id, custom_data_json = card

        try:
            custom_data = json.loads(custom_data_json) if isinstance(custom_data_json, str) else custom_data_json

            # Extract example sentence data
            example_sentence = custom_data.get("example_sentence")
            sentence_translation = custom_data.get("sentence_translation")

            # Update legacy fields
            connection.execute(text("""
                UPDATE cards
                SET example_sentence_1 = :ex1,
                    sentence_translation_1 = :trans1
                WHERE id = :card_id
            """), {
                'ex1': example_sentence,
                'trans1': sentence_translation,
                'card_id': card_id
            })

        except:
            # Skip cards with invalid JSON
            continue

    # Step 2: Clear custom_fields and custom_data for migrated decks
    connection.execute(text("""
        UPDATE decks
        SET custom_fields = NULL
        WHERE custom_fields = :default_fields
    """), {
        'default_fields': json.dumps([
            {"name": "example_sentence", "label": "Example Sentence"},
            {"name": "sentence_translation", "label": "Sentence Translation"}
        ])
    })

    # Clear custom_data that only contains migrated sentence data
    connection.execute(text("""
        UPDATE cards
        SET custom_data = NULL
        WHERE custom_data IS NOT NULL
    """))
