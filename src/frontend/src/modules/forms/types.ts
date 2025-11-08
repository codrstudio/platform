/**
 * Forms Module Types
 *
 * SPEC Compliance: SPEC-FORMS-*
 */

export type FieldType =
  | 'text'
  | 'textarea'
  | 'email'
  | 'number'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'date'
  | 'file'
  | 'switch';

export interface Choice {
  value: string;
  label: string;
}

export interface TextValidation {
  minLength?: number;
  maxLength?: number;
  pattern?: string;
}

export interface NumberValidation {
  min?: number;
  max?: number;
  step?: number;
}

export interface DateValidation {
  minDate?: string;
  maxDate?: string;
}

export interface FileOptions {
  accept?: string;
  maxSize?: number;
  maxFiles?: number;
}

export interface TextareaOptions {
  rows?: number;
  maxLength?: number;
}

export interface SelectOptions {
  choices: Choice[];
  allowOther?: boolean;
}

export interface RadioOptions {
  choices: Choice[];
  allowOther?: boolean;
  layout?: 'vertical' | 'horizontal';
}

export interface CheckboxOptions {
  choices: Choice[];
  minSelected?: number;
  maxSelected?: number;
}

export interface SwitchOptions {
  defaultValue?: boolean;
}

export type FieldOptions =
  | TextareaOptions
  | SelectOptions
  | RadioOptions
  | CheckboxOptions
  | FileOptions
  | SwitchOptions;

export type FieldValidation =
  | TextValidation
  | NumberValidation
  | DateValidation;

export interface ConditionalLogic {
  fieldId: string;
  operator: 'equals' | 'notEquals' | 'contains' | 'isEmpty';
  value?: string;
}

export interface FormField {
  fieldId: string;
  type: FieldType;
  label: string;
  description?: string;
  placeholder?: string;
  required: boolean;
  validation?: FieldValidation;
  options?: FieldOptions;
  showIf?: ConditionalLogic;
}

export interface FormSettings {
  allowMultipleSubmissions: boolean;
  requireAuth: boolean;
  showProgressBar: boolean;
  shuffleFields: boolean;
  confirmationMessage: string;
  redirectUrl?: string;
  expiresAt?: string;
  maxSubmissions?: number;
  notifyOnSubmit?: string[];
}

export interface FormStyling {
  theme?: 'default' | 'compact';
  accentColor?: string;
}

export interface FormConfig {
  formId: string;
  title: string;
  description?: string;
  fields: FormField[];
  settings: FormSettings;
  styling?: FormStyling;
}

export interface FormSubmission {
  submissionId: string;
  formId: string;
  userId?: string;
  data: Record<string, unknown>;
  submittedAt: string;
}

export interface FormInstanceConfig {
  instanceId: string;
  formId: string;
  route: string;
  title?: string;
}

export interface FormState {
  values: Record<string, unknown>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isSubmitted: boolean;
}
