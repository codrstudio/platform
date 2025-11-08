/**
 * useForms Hook
 *
 * Hook for form state management and validation.
 *
 * SPEC Compliance:
 * - SPEC-FORMS-R-002: JQEL storage
 * - SPEC-FORMS-R-003: Validation
 */

import { useState, useCallback } from 'react';
import { useJQELQuery, useJQELMutation } from '@/hooks/useJQEL';
import type { FormConfig, FormField, FormState, TextValidation, NumberValidation, CheckboxOptions } from '../types';

function generateUUID(): string {
  return crypto.randomUUID();
}

export interface FormsHookState {
  formConfig: FormConfig | null;
  formState: FormState;
  isLoading: boolean;
  handleFieldChange: (fieldId: string, value: unknown) => void;
  handleFieldBlur: (fieldId: string) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  resetForm: () => void;
}

export function useForms(formId: string): FormsHookState {
  // Load form configuration
  const { data: formData, isLoading } = useJQELQuery({
    schema: 'forms',
    select: 'config',
    where: { formId: { $eq: formId } }
  });

  const formConfig = ((formData?.data as unknown[])?.[0] as FormConfig) || null;

  // Initialize form state
  const getInitialState = useCallback((): FormState => {
    return {
      values: {},
      errors: {},
      touched: {},
      isSubmitting: false,
      isSubmitted: false
    };
  }, []);

  const [formState, setFormState] = useState<FormState>(getInitialState());

  // Submit mutation
  const submitMutation = useJQELMutation({
    schema: 'forms',
    mutate: 'submission',
    action: 'insert'
  });

  // Validate single field
  const validateField = useCallback((field: FormField, value: unknown): string | null => {
    // Required validation
    if (field.required) {
      if (value === null || value === undefined || String(value).trim() === '') {
        return 'Este campo é obrigatório';
      }
      if (Array.isArray(value) && value.length === 0) {
        return 'Selecione pelo menos uma opção';
      }
    }

    // Type-specific validation
    switch (field.type) {
      case 'text':
      case 'textarea': {
        const validation = field.validation as TextValidation | undefined;
        const strValue = String(value || '');

        if (validation?.minLength && strValue.length < validation.minLength) {
          return `Mínimo de ${validation.minLength} caracteres`;
        }
        if (validation?.maxLength && strValue.length > validation.maxLength) {
          return `Máximo de ${validation.maxLength} caracteres`;
        }
        if (validation?.pattern) {
          const regex = new RegExp(validation.pattern);
          if (!regex.test(strValue)) {
            return 'Formato inválido';
          }
        }
        break;
      }

      case 'email': {
        const strValue = String(value || '');
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (strValue && !emailRegex.test(strValue)) {
          return 'E-mail inválido';
        }
        break;
      }

      case 'number': {
        const validation = field.validation as NumberValidation | undefined;
        const numValue = Number(value);

        if (isNaN(numValue)) {
          return 'Número inválido';
        }
        if (validation?.min !== undefined && numValue < validation.min) {
          return `Valor mínimo: ${validation.min}`;
        }
        if (validation?.max !== undefined && numValue > validation.max) {
          return `Valor máximo: ${validation.max}`;
        }
        break;
      }

      case 'checkbox': {
        const options = field.options as CheckboxOptions | undefined;
        const selectedValues = Array.isArray(value) ? value : [];

        if (options?.minSelected && selectedValues.length < options.minSelected) {
          return `Selecione pelo menos ${options.minSelected} ${options.minSelected === 1 ? 'opção' : 'opções'}`;
        }
        if (options?.maxSelected && selectedValues.length > options.maxSelected) {
          return `Selecione no máximo ${options.maxSelected} ${options.maxSelected === 1 ? 'opção' : 'opções'}`;
        }
        break;
      }
    }

    return null;
  }, []);

  // Validate all fields
  const validateForm = useCallback((): boolean => {
    if (!formConfig) return false;

    const errors: Record<string, string> = {};
    let isValid = true;

    formConfig.fields.forEach(field => {
      const error = validateField(field, formState.values[field.fieldId]);
      if (error) {
        errors[field.fieldId] = error;
        isValid = false;
      }
    });

    setFormState(prev => ({ ...prev, errors }));
    return isValid;
  }, [formConfig, formState.values, validateField]);

  // Handle field change
  const handleFieldChange = useCallback((fieldId: string, value: unknown) => {
    setFormState(prev => ({
      ...prev,
      values: { ...prev.values, [fieldId]: value },
      errors: { ...prev.errors, [fieldId]: '' }
    }));
  }, []);

  // Handle field blur
  const handleFieldBlur = useCallback((fieldId: string) => {
    if (!formConfig) return;

    const field = formConfig.fields.find(f => f.fieldId === fieldId);
    if (!field) return;

    const error = validateField(field, formState.values[fieldId]);

    setFormState(prev => ({
      ...prev,
      touched: { ...prev.touched, [fieldId]: true },
      errors: { ...prev.errors, [fieldId]: error || '' }
    }));
  }, [formConfig, formState.values, validateField]);

  // Handle form submit
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formConfig) return;

    // Mark all fields as touched
    const touched: Record<string, boolean> = {};
    formConfig.fields.forEach(field => {
      touched[field.fieldId] = true;
    });
    setFormState(prev => ({ ...prev, touched }));

    // Validate
    if (!validateForm()) {
      return;
    }

    // Submit
    setFormState(prev => ({ ...prev, isSubmitting: true }));

    try {
      await submitMutation.mutateAsync({
        schema: 'forms',
        mutate: 'submission',
        action: 'insert',
        values: {
          submissionId: generateUUID(),
          formId: formConfig.formId,
          data: formState.values,
          submittedAt: new Date().toISOString()
        } as unknown as Record<string, unknown>
      });

      setFormState(prev => ({
        ...prev,
        isSubmitting: false,
        isSubmitted: true
      }));
    } catch (error) {
      console.error('Form submission error:', error);
      setFormState(prev => ({ ...prev, isSubmitting: false }));
    }
  }, [formConfig, formState.values, validateForm, submitMutation]);

  // Reset form
  const resetForm = useCallback(() => {
    setFormState(getInitialState());
  }, [getInitialState]);

  return {
    formConfig,
    formState,
    isLoading,
    handleFieldChange,
    handleFieldBlur,
    handleSubmit,
    resetForm
  };
}
