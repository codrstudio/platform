/**
 * LayoutSelector Component
 *
 * Provides UI for selecting the layout width of a composition
 */

import React from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Monitor, Tablet, Smartphone, Maximize } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LayoutSelectorProps {
  value: 'full' | 'lg' | 'md' | 'sm';
  onChange: (value: 'full' | 'lg' | 'md' | 'sm') => void;
  disabled?: boolean;
}

const layoutOptions = [
  {
    value: 'full' as const,
    label: 'Full Width',
    description: '100% width',
    icon: Maximize,
    preview: 'w-full',
  },
  {
    value: 'lg' as const,
    label: 'Large',
    description: '1024px max',
    icon: Monitor,
    preview: 'w-4/5',
  },
  {
    value: 'md' as const,
    label: 'Medium',
    description: '768px max',
    icon: Tablet,
    preview: 'w-3/5',
  },
  {
    value: 'sm' as const,
    label: 'Small',
    description: '640px max',
    icon: Smartphone,
    preview: 'w-2/5',
  },
];

export function LayoutSelector({ value, onChange, disabled }: LayoutSelectorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Layout Width</CardTitle>
        <CardDescription>
          Choose the maximum width for your composition's content area
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={value}
          onValueChange={onChange as (value: string) => void}
          disabled={disabled}
          className="grid gap-4"
        >
          {layoutOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = value === option.value;

            return (
              <div key={option.value} className="relative">
                <RadioGroupItem
                  value={option.value}
                  id={`layout-${option.value}`}
                  className="peer sr-only"
                />
                <Label
                  htmlFor={`layout-${option.value}`}
                  className={cn(
                    'flex items-center gap-4 rounded-lg border p-4 hover:bg-accent cursor-pointer transition-colors',
                    isSelected && 'border-primary bg-accent',
                    disabled && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium">{option.label}</p>
                    <p className="text-sm text-muted-foreground">
                      {option.description}
                    </p>
                  </div>
                  <div className="w-20 h-12 bg-muted rounded border flex items-center justify-center p-2">
                    <div className={cn('h-full bg-primary/20 rounded', option.preview)} />
                  </div>
                </Label>
              </div>
            );
          })}
        </RadioGroup>
      </CardContent>
    </Card>
  );
}