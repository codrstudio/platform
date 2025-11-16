import * as React from 'react';
import { Search, X } from 'lucide-react';
import { SidebarInput } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface SidebarSearchProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SidebarSearch({
  value: controlledValue,
  onChange,
  placeholder = 'Buscar...',
  className,
}: SidebarSearchProps) {
  const [internalValue, setInternalValue] = React.useState('');
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Use controlled value se fornecido, caso contrário use valor interno
  const value = controlledValue !== undefined ? controlledValue : internalValue;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    if (controlledValue === undefined) {
      setInternalValue(newValue);
    }

    onChange?.(newValue);
  };

  const handleClear = () => {
    if (controlledValue === undefined) {
      setInternalValue('');
    }

    onChange?.('');
    inputRef.current?.focus();
  };

  // Atalho Ctrl+K / Cmd+K para focar no search
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className={cn('relative', className)}>
      <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-sidebar-foreground/50 pointer-events-none" />

      <SidebarInput
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        className="pl-8 pr-8"
      />

      {value && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-0 top-1/2 h-8 w-8 -translate-y-1/2 hover:bg-transparent"
          onClick={handleClear}
          aria-label="Limpar busca"
        >
          <X className="h-4 w-4 text-sidebar-foreground/50" />
        </Button>
      )}

      <div className="sr-only" aria-live="polite">
        {value ? `Buscando por: ${value}` : 'Campo de busca vazio'}
      </div>
    </div>
  );
}
