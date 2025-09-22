/**
 * Utility functions for custom field management
 */

import { CustomField } from '../types/api';

/**
 * Convert a user-provided label to a valid field name.
 *
 * Examples:
 *   "Example Sentence" -> "example_sentence"
 *   "Notes" -> "notes"
 *   "Conjugation" -> "conjugation"
 *   "Pronunciation Guide" -> "pronunciation_guide"
 */
export function labelToFieldName(label: string): string {
  if (!label || !label.trim()) {
    return '';
  }

  // Convert to lowercase and replace spaces/special chars with underscores
  let fieldName = label
    .trim()
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]+/g, '_');

  // Remove leading/trailing underscores
  fieldName = fieldName.replace(/^_+|_+$/g, '');

  // Collapse multiple underscores into single ones
  fieldName = fieldName.replace(/_+/g, '_');

  return fieldName;
}

/**
 * Validate custom fields configuration.
 */
export function validateCustomFields(customFields: CustomField[]): { isValid: boolean; error?: string } {
  if (!customFields || customFields.length === 0) {
    return { isValid: true };
  }

  if (customFields.length > 5) {
    return { isValid: false, error: 'Maximum 5 custom fields allowed' };
  }

  const fieldNames = new Set<string>();
  const reservedNames = new Set([
    'front', 'back', 'id', 'deck_id', 'accuracy', 'total_attempts',
    'correct_answers', 'last_reviewed_at', 'created_at', 'audio_url'
  ]);

  for (const field of customFields) {
    if (!field.name || !field.label) {
      return { isValid: false, error: 'Each custom field must have both name and label' };
    }

    if (!field.name.trim() || !field.label.trim()) {
      return { isValid: false, error: 'Field name and label cannot be empty' };
    }

    if (fieldNames.has(field.name)) {
      return { isValid: false, error: `Duplicate field name: ${field.name}` };
    }

    if (reservedNames.has(field.name)) {
      return { isValid: false, error: `Field name '${field.name}' is reserved` };
    }

    fieldNames.add(field.name);
  }

  return { isValid: true };
}

/**
 * Convert field labels to CustomField objects with auto-generated names.
 */
export function processCustomFieldsForCreation(labels: string[]): CustomField[] {
  return labels.map(label => ({
    name: labelToFieldName(label),
    label: label
  }));
}

/**
 * Get display value for a custom field from card data.
 */
export function getCustomFieldValue(customData: { [key: string]: string } | undefined, fieldName: string): string {
  return customData?.[fieldName] || '';
}

/**
 * Set custom field value in card data.
 */
export function setCustomFieldValue(
  customData: { [key: string]: string } | undefined,
  fieldName: string,
  value: string
): { [key: string]: string } {
  const data = customData || {};
  if (value.trim()) {
    data[fieldName] = value.trim();
  } else {
    delete data[fieldName];
  }
  return data;
}