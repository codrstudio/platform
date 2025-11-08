/**
 * FormRenderer Component
 *
 * SPEC Compliance: SPEC-FORMS-*
 */

import { TextField, TextareaField, EmailField, NumberField } from '../fields/BasicFields';
import { SelectField, RadioField, CheckboxField } from '../fields/ChoiceFields';
import { DateField, FileField, SwitchField } from '../fields/SpecialFields';
import type { FormField, FormState } from '../types';

export interface FormRendererProps {
  fields: FormField[];
  formState: FormState;
  onFieldChange: (fieldId: string, value: unknown) => void;
  onFieldBlur: (fieldId: string) => void;
}

export function FormRenderer({ fields, formState, onFieldChange, onFieldBlur }: FormRendererProps) {
  const shouldShowField = (field: FormField): boolean => {
    if (!field.showIf) return true;

    const condition = field.showIf;
    const dependentValue = formState.values[condition.fieldId];

    switch (condition.operator) {
      case 'equals':
        return dependentValue === condition.value;
      case 'notEquals':
        return dependentValue !== condition.value;
      case 'contains':
        return String(dependentValue || '').includes(String(condition.value || ''));
      case 'isEmpty':
        return !dependentValue || String(dependentValue).trim() === '';
      default:
        return true;
    }
  };

  const renderField = (field: FormField) => {
    if (!shouldShowField(field)) {
      return null;
    }

    const commonProps = {
      field,
      value: formState.values[field.fieldId],
      error: formState.touched[field.fieldId] ? formState.errors[field.fieldId] : undefined,
      onChange: (value: unknown) => onFieldChange(field.fieldId, value),
      onBlur: () => onFieldBlur(field.fieldId)
    };

    switch (field.type) {
      case 'text':
        return <TextField key={field.fieldId} {...commonProps} />;
      case 'textarea':
        return <TextareaField key={field.fieldId} {...commonProps} />;
      case 'email':
        return <EmailField key={field.fieldId} {...commonProps} />;
      case 'number':
        return <NumberField key={field.fieldId} {...commonProps} />;
      case 'select':
        return <SelectField key={field.fieldId} {...commonProps} />;
      case 'radio':
        return <RadioField key={field.fieldId} {...commonProps} />;
      case 'checkbox':
        return <CheckboxField key={field.fieldId} {...commonProps} />;
      case 'date':
        return <DateField key={field.fieldId} {...commonProps} />;
      case 'file':
        return <FileField key={field.fieldId} {...commonProps} />;
      case 'switch':
        return <SwitchField key={field.fieldId} {...commonProps} />;
      default:
        return (
          <div key={field.fieldId} className="p-4 border rounded bg-muted">
            <p className="text-sm text-muted-foreground">
              Tipo de campo não suportado: {field.type}
            </p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {fields.map(renderField)}
    </div>
  );
}
