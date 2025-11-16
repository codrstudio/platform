// Layout Width Selector Component
// Permite selecionar a largura padrão do layout da composição

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import type { LayoutWidth } from '@/core/composition/types';
import { Monitor, Maximize2, Laptop, Smartphone } from 'lucide-react';

interface LayoutWidthSelectorProps {
  /** Largura atual */
  value: LayoutWidth;

  /** Callback quando largura muda */
  onChange: (width: LayoutWidth) => void;

  /** Desabilita edição */
  disabled?: boolean;
}

interface WidthOption {
  value: LayoutWidth;
  label: string;
  description: string;
  maxWidth: string;
  icon: typeof Monitor;
}

const WIDTH_OPTIONS: WidthOption[] = [
  {
    value: 'full',
    label: 'Largura Total',
    description: 'Ocupa 100% da largura da tela',
    maxWidth: '100%',
    icon: Maximize2,
  },
  {
    value: 'lg',
    label: 'Grande',
    description: 'Máximo de 1024px centralizado',
    maxWidth: '1024px',
    icon: Monitor,
  },
  {
    value: 'md',
    label: 'Médio',
    description: 'Máximo de 768px centralizado',
    maxWidth: '768px',
    icon: Laptop,
  },
  {
    value: 'sm',
    label: 'Pequeno',
    description: 'Máximo de 640px centralizado',
    maxWidth: '640px',
    icon: Smartphone,
  },
];

/**
 * Seletor de largura de layout para composições
 * Permite escolher entre Full, Large, Medium e Small
 */
export function LayoutWidthSelector({
  value,
  onChange,
  disabled = false,
}: LayoutWidthSelectorProps) {
  return (
    <RadioGroup
      value={value}
      onValueChange={(newValue) => onChange(newValue as LayoutWidth)}
      disabled={disabled}
      className="space-y-3"
    >
      {WIDTH_OPTIONS.map((option) => {
        const Icon = option.icon;
        return (
          <div key={option.value} className="flex items-start space-x-3">
            <RadioGroupItem
              value={option.value}
              id={`width-${option.value}`}
              className="mt-1"
            />
            <Label
              htmlFor={`width-${option.value}`}
              className="flex-1 cursor-pointer"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                    <p className="font-medium">{option.label}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {option.description}
                  </p>
                </div>
                <div className="text-xs text-muted-foreground font-mono shrink-0">
                  {option.maxWidth}
                </div>
              </div>
            </Label>
          </div>
        );
      })}
    </RadioGroup>
  );
}
