import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

/**
 * Spinner Component
 *
 * SPEC-ERR-UI-026 a SPEC-ERR-UI-028: Loading inline para botões e pequenos componentes
 * Tamanhos: sm, md, lg
 */

export interface SpinnerProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8'
};

export function Spinner({ className, size = 'md', label }: SpinnerProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Loader2
        className={cn('animate-spin text-muted-foreground', sizeClasses[size])}
        aria-hidden="true"
      />
      {label && (
        <span className="text-sm text-muted-foreground">{label}</span>
      )}
      <span className="sr-only">Carregando...</span>
    </div>
  );
}

/**
 * Button Spinner - Para uso dentro de botões
 * SPEC-ERR-UI-028: Durante loading, botões DEVEM usar propriedade disabled e mostrar Spinner
 */
export function ButtonSpinner({ className }: { className?: string }) {
  return (
    <Loader2 className={cn('h-4 w-4 animate-spin', className)} aria-hidden="true" />
  );
}

/**
 * Page Spinner - Para loading de página inteira
 */
export function PageSpinner({ label = 'Carregando...' }: { label?: string }) {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <Spinner size="lg" label={label} />
    </div>
  );
}

/**
 * Inline Spinner - Para loading inline com texto
 */
export function InlineSpinner({ label }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
      {label && <span className="text-sm">{label}</span>}
    </span>
  );
}