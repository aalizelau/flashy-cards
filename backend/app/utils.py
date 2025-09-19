"""Utility functions for the Flash Wise Buddy application."""

import re


def label_to_field_name(label: str) -> str:
    """
    Convert a user-provided label to a valid field name.

    Examples:
        "Example Sentence" -> "example_sentence"
        "Notes" -> "notes"
        "Conjugation" -> "conjugation"
        "Pronunciation Guide" -> "pronunciation_guide"

    Args:
        label: The user-provided label for the field

    Returns:
        A snake_case field name suitable for database storage
    """
    if not label or not label.strip():
        return ""

    # Convert to lowercase and replace spaces/special chars with underscores
    field_name = re.sub(r'[^a-zA-Z0-9]+', '_', label.strip().lower())

    # Remove leading/trailing underscores
    field_name = field_name.strip('_')

    # Collapse multiple underscores into single ones
    field_name = re.sub(r'_+', '_', field_name)

    return field_name


def validate_custom_fields(custom_fields: list) -> tuple[bool, str]:
    """
    Validate custom fields configuration.

    Args:
        custom_fields: List of {name: str, label: str} dictionaries

    Returns:
        Tuple of (is_valid, error_message)
    """
    if not custom_fields:
        return True, ""

    if len(custom_fields) > 5:
        return False, "Maximum 5 custom fields allowed"

    field_names = set()
    for field in custom_fields:
        if not isinstance(field, dict):
            return False, "Each custom field must be an object with 'name' and 'label'"

        if 'name' not in field or 'label' not in field:
            return False, "Each custom field must have 'name' and 'label' properties"

        name = field['name']
        label = field['label']

        if not isinstance(name, str) or not isinstance(label, str):
            return False, "Field 'name' and 'label' must be strings"

        if not name.strip() or not label.strip():
            return False, "Field 'name' and 'label' cannot be empty"

        if name in field_names:
            return False, f"Duplicate field name: {name}"

        # Check for reserved field names
        if name in ['front', 'back', 'id', 'deck_id', 'accuracy', 'total_attempts',
                   'correct_answers', 'last_reviewed_at', 'created_at', 'audio_path']:
            return False, f"Field name '{name}' is reserved"

        field_names.add(name)

    return True, ""