/**
 * TaskBadge Component
 *
 * Badge de tarefas pendentes com contador.
 *
 * SPEC Compliance:
 * - SPEC-TASKS-B-001: Ícone de tarefas (clipboard-check)
 * - SPEC-TASKS-B-002: Badge com número de pendentes
 * - SPEC-TASKS-B-003: Badge visível apenas quando > 0
 * - SPEC-TASKS-B-004: Badge limitado a 99+
 * - SPEC-TASKS-B-005: Clique abre preview dropdown
 * - SPEC-TASKS-B-006: Visual estado ativo/inativo
 * - SPEC-TASKS-A11Y-001: aria-label com contagem
 */

import { ClipboardCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface TaskBadgeProps {
  pendingCount: number;
  onClick?: () => void;
  className?: string;
  variant?: 'header' | 'navbar' | 'custom';
}

/**
 * TaskBadge component
 *
 * Usage:
 * ```tsx
 * <TaskBadge
 *   pendingCount={5}
 *   onClick={() => setOpen(true)}
 * />
 * ```
 */
export function TaskBadge({
  pendingCount,
  onClick,
  className,
  variant = 'header'
}: TaskBadgeProps) {
  const hasPending = pendingCount > 0;
  const displayCount = pendingCount > 99 ? '99+' : pendingCount;

  // SPEC-TASKS-A11Y-001: aria-label with count
  const ariaLabel = hasPending
    ? `${pendingCount} tarefa${pendingCount > 1 ? 's' : ''} pendente${pendingCount > 1 ? 's' : ''}`
    : 'Nenhuma tarefa pendente';

  const baseClasses = cn(
    'relative',
    variant === 'header' && 'h-9 w-9',
    variant === 'navbar' && 'h-10 w-10',
    className
  );

  return (
    <Button
      variant="ghost"
      size="icon"
      className={baseClasses}
      onClick={onClick}
      aria-label={ariaLabel}
    >
      {/* Icon (SPEC-TASKS-B-001) */}
      <ClipboardCheck className={cn(
        'h-5 w-5',
        hasPending ? 'text-foreground' : 'text-muted-foreground'
      )} />

      {/* Badge (SPEC-TASKS-B-002 to B-004) */}
      {hasPending && (
        <span
          className={cn(
            'absolute -top-1 -right-1',
            'flex items-center justify-center',
            'min-w-[18px] h-[18px] px-1',
            'text-[10px] font-bold text-white',
            'bg-blue-600 rounded-full',
            'ring-2 ring-background'
          )}
          aria-hidden="true"
        >
          {displayCount}
        </span>
      )}
    </Button>
  );
}
