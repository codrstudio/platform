/**
 * Special Form Fields (date, file, switch)
 *
 * SPEC Compliance: SPEC-FORMS-T-001
 */

import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Upload, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FileOptions, SwitchOptions } from '../types';
import type { FieldProps } from './BasicFields';

export function DateField({ field, value, error, onChange, onBlur }: FieldProps) {
  const validation = field.validation as { minDate?: string; maxDate?: string } | undefined;

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
        type="date"
        value={String(value || '')}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        min={validation?.minDate}
        max={validation?.maxDate}
        className={cn(error && 'border-destructive')}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

export function FileField({ field, error, onChange, onBlur }: FieldProps) {
  const options = field.options as FileOptions | undefined;
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    // Validate max files
    if (options?.maxFiles && files.length > options.maxFiles) {
      return;
    }

    // Validate file size
    if (options?.maxSize) {
      const invalidFiles = files.filter(f => f.size > options.maxSize!);
      if (invalidFiles.length > 0) {
        return;
      }
    }

    setSelectedFiles(files);
    onChange(files);
  };

  const handleRemoveFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    onChange(newFiles);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={field.fieldId}>
        {field.label}
        {field.required && <span className="text-destructive ml-1">*</span>}
      </Label>
      {field.description && (
        <p className="text-sm text-muted-foreground">{field.description}</p>
      )}

      <div className={cn(
        'border-2 border-dashed rounded-lg p-6 text-center',
        error && 'border-destructive'
      )}>
        <Input
          id={field.fieldId}
          type="file"
          onChange={handleFileChange}
          onBlur={onBlur}
          accept={options?.accept}
          multiple={options?.maxFiles ? options.maxFiles > 1 : false}
          className="hidden"
        />
        <label htmlFor={field.fieldId} className="cursor-pointer">
          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {field.placeholder || 'Clique para selecionar arquivos'}
          </p>
          {options?.maxSize && (
            <p className="text-xs text-muted-foreground mt-1">
              Tamanho máximo: {(options.maxSize / 1024 / 1024).toFixed(1)}MB
            </p>
          )}
        </label>
      </div>

      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          {selectedFiles.map((file, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
              <span className="text-sm truncate flex-1">{file.name}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveFile(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

export function SwitchField({ field, value, error, onChange, onBlur }: FieldProps) {
  const options = field.options as SwitchOptions | undefined;
  const checked = typeof value === 'boolean' ? value : options?.defaultValue || false;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor={field.fieldId}>
            {field.label}
            {field.required && <span className="text-destructive ml-1">*</span>}
          </Label>
          {field.description && (
            <p className="text-sm text-muted-foreground">{field.description}</p>
          )}
        </div>
        <Switch
          id={field.fieldId}
          checked={checked}
          onCheckedChange={onChange}
          onBlur={onBlur}
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
