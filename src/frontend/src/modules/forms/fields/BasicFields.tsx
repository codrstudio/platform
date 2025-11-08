/**
 * Basic Form Fields (text, textarea, email, number)
 *
 * SPEC Compliance: SPEC-FORMS-T-001
 */

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { FormField, TextareaOptions } from '../types';

export interface FieldProps {
  field: FormField;
  value: unknown;
  error?: string;
  onChange: (value: unknown) => void;
  onBlur: () => void;
}

export function TextField({ field, value, error, onChange, onBlur }: FieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={field.fieldId}>
        {field.label}
        {field.required && <span className="text-destructive ml-1">*</span>}
      </Label>
      {field.description && (
        <p className="text-sm text-muted-foreground">{field.description}</p>
      )}
      <Input
        id={field.fieldId}
        type="text"
        placeholder={field.placeholder}
        value={String(value || '')}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        className={cn(error && 'border-destructive')}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

export function TextareaField({ field, value, error, onChange, onBlur }: FieldProps) {
  const options = field.options as TextareaOptions | undefined;
  const rows = options?.rows || 4;
  const maxLength = options?.maxLength;

  return (
    <div className="space-y-2">
      <Label htmlFor={field.fieldId}>
        {field.label}
        {field.required && <span className="text-destructive ml-1">*</span>}
      </Label>
      {field.description && (
        <p className="text-sm text-muted-foreground">{field.description}</p>
      )}
      <Textarea
        id={field.fieldId}
        placeholder={field.placeholder}
        value={String(value || '')}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value)}
        onBlur={onBlur}
        rows={rows}
        maxLength={maxLength}
        className={cn(error && 'border-destructive')}
      />
      {maxLength && (
        <p className="text-xs text-muted-foreground text-right">
          {String(value || '').length} / {maxLength}
        </p>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

export function EmailField({ field, value, error, onChange, onBlur }: FieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={field.fieldId}>
        {field.label}
        {field.required && <span className="text-destructive ml-1">*</span>}
      </Label>
      {field.description && (
        <p className="text-sm text-muted-foreground">{field.description}</p>
      )}
      <Input
        id={field.fieldId}
        type="email"
        placeholder={field.placeholder}
        value={String(value || '')}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        className={cn(error && 'border-destructive')}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

export function NumberField({ field, value, error, onChange, onBlur }: FieldProps) {
  const validation = field.validation as { min?: number; max?: number; step?: number } | undefined;

  return (
    <div className="space-y-2">
      <Label htmlFor={field.fieldId}>
        {field.label}
        {field.required && <span className="text-destructive ml-1">*</span>}
      </Label>
      {field.description && (
        <p className="text-sm text-muted-foreground">{field.description}</p>
      )}
      <Input
        id={field.fieldId}
        type="number"
        placeholder={field.placeholder}
        value={value !== null && value !== undefined ? String(value) : ''}
        onChange={(e) => onChange(e.target.value ? parseFloat(e.target.value) : null)}
        onBlur={onBlur}
        min={validation?.min}
        max={validation?.max}
        step={validation?.step}
        className={cn(error && 'border-destructive')}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
