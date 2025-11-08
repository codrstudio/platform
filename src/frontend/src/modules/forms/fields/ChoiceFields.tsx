/**
 * Choice Form Fields (select, radio, checkbox)
 *
 * SPEC Compliance: SPEC-FORMS-T-001
 */

import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import type { SelectOptions, RadioOptions, CheckboxOptions } from '../types';
import type { FieldProps } from './BasicFields';

export function SelectField({ field, value, error, onChange, onBlur }: FieldProps) {
  const options = field.options as SelectOptions;

  return (
    <div className="space-y-2">
      <Label htmlFor={field.fieldId}>
        {field.label}
        {field.required && <span className="text-destructive ml-1">*</span>}
      </Label>
      {field.description && (
        <p className="text-sm text-muted-foreground">{field.description}</p>
      )}
      <Select
        value={String(value || '')}
        onValueChange={onChange}
      >
        <SelectTrigger
          id={field.fieldId}
          className={cn(error && 'border-destructive')}
          onBlur={onBlur}
        >
          <SelectValue placeholder={field.placeholder || 'Selecione uma opção'} />
        </SelectTrigger>
        <SelectContent>
          {options.choices.map((choice) => (
            <SelectItem key={choice.value} value={choice.value}>
              {choice.label}
            </SelectItem>
          ))}
          {options.allowOther && (
            <SelectItem value="__other__">Outro</SelectItem>
          )}
        </SelectContent>
      </Select>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

export function RadioField({ field, value, error, onChange, onBlur }: FieldProps) {
  const options = field.options as RadioOptions;
  const layout = options.layout || 'vertical';

  return (
    <div className="space-y-2">
      <Label>
        {field.label}
        {field.required && <span className="text-destructive ml-1">*</span>}
      </Label>
      {field.description && (
        <p className="text-sm text-muted-foreground">{field.description}</p>
      )}
      <RadioGroup
        value={String(value || '')}
        onValueChange={onChange}
        onBlur={onBlur}
        className={cn(
          layout === 'horizontal' && 'flex flex-wrap gap-4',
          error && 'border-destructive'
        )}
      >
        {options.choices.map((choice) => (
          <div key={choice.value} className="flex items-center space-x-2">
            <RadioGroupItem value={choice.value} id={`${field.fieldId}-${choice.value}`} />
            <Label htmlFor={`${field.fieldId}-${choice.value}`} className="font-normal cursor-pointer">
              {choice.label}
            </Label>
          </div>
        ))}
        {options.allowOther && (
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="__other__" id={`${field.fieldId}-other`} />
            <Label htmlFor={`${field.fieldId}-other`} className="font-normal cursor-pointer">
              Outro
            </Label>
          </div>
        )}
      </RadioGroup>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

export function CheckboxField({ field, value, error, onChange, onBlur }: FieldProps) {
  const options = field.options as CheckboxOptions;
  const selectedValues = Array.isArray(value) ? value : [];

  const handleCheckboxChange = (choiceValue: string, checked: boolean) => {
    let newValues: string[];
    if (checked) {
      newValues = [...selectedValues, choiceValue];
    } else {
      newValues = selectedValues.filter(v => v !== choiceValue);
    }
    onChange(newValues);
  };

  return (
    <div className="space-y-2">
      <Label>
        {field.label}
        {field.required && <span className="text-destructive ml-1">*</span>}
      </Label>
      {field.description && (
        <p className="text-sm text-muted-foreground">{field.description}</p>
      )}
      <div className="space-y-2" onBlur={onBlur}>
        {options.choices.map((choice) => (
          <div key={choice.value} className="flex items-center space-x-2">
            <Checkbox
              id={`${field.fieldId}-${choice.value}`}
              checked={selectedValues.includes(choice.value)}
              onCheckedChange={(checked: boolean) => handleCheckboxChange(choice.value, checked === true)}
            />
            <Label htmlFor={`${field.fieldId}-${choice.value}`} className="font-normal cursor-pointer">
              {choice.label}
            </Label>
          </div>
        ))}
      </div>
      {options.minSelected && (
        <p className="text-xs text-muted-foreground">
          Mínimo: {options.minSelected} {options.minSelected === 1 ? 'opção' : 'opções'}
        </p>
      )}
      {options.maxSelected && (
        <p className="text-xs text-muted-foreground">
          Máximo: {options.maxSelected} {options.maxSelected === 1 ? 'opção' : 'opções'}
        </p>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
