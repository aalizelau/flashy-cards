import { useState } from 'react';
import { CustomField } from '@/shared/types/api';
import { labelToFieldName, validateCustomFields } from '@/shared/utils/customFields';

export const useCustomFields = (initialFields: CustomField[] = []) => {
  const [customFields, setCustomFields] = useState<CustomField[]>(initialFields);

  const addCustomField = () => {
    if (customFields.length < 5) {
      setCustomFields([...customFields, { name: '', label: '' }]);
    }
  };

  const removeCustomField = (index: number) => {
    setCustomFields(customFields.filter((_, i) => i !== index));
  };

  const updateCustomFieldLabel = (index: number, label: string) => {
    const updated = [...customFields];
    // Generate name from label using the utility function
    const name = labelToFieldName(label);
    updated[index] = { name, label };
    setCustomFields(updated);
  };

  const validateCustomFieldsState = () => {
    const validation = validateCustomFields(customFields);
    if (!validation.isValid) {
      return { isValid: false, error: validation.error };
    }

    // Check for empty labels
    for (let i = 0; i < customFields.length; i++) {
      if (!customFields[i].label.trim()) {
        return { isValid: false, error: 'Field label cannot be empty', fieldIndex: i };
      }
    }

    return { isValid: true };
  };

  // Clean up card data when a custom field is removed
  const cleanupCardCustomData = (
    cardCustomData: { [fieldName: string]: string } | undefined,
    removedFieldName: string
  ): { [fieldName: string]: string } | undefined => {
    if (!cardCustomData) return undefined;

    const cleanedData = { ...cardCustomData };
    delete cleanedData[removedFieldName];

    // Return undefined if no custom data remains
    return Object.keys(cleanedData).length > 0 ? cleanedData : undefined;
  };

  return {
    customFields,
    setCustomFields,
    addCustomField,
    removeCustomField,
    updateCustomFieldLabel,
    validateCustomFieldsState,
    cleanupCardCustomData,
  };
};