/**
 * TaskItem Component
 *
 * Componente para exibir uma tarefa individual.
 *
 * SPEC Compliance:
 * - SPEC-TASKS-V-003: Visual distinto por prioridade
 * - SPEC-TASKS-EXP-002: Indicador de expiração
 * - SPEC-TASKS-C-002 to C-004: Renderização por categoria
 * - SPEC-TASKS-D-001 to D-003: Exibição de dados da task
 */

import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import * as LucideIcons from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Task, TaskModuleConfig } from '../types';

export interface TaskItemProps {
  task: Task;
  config?: Partial<TaskModuleConfig>;
  onAction?: (taskId: string, actionId: string, data?: Record<string, unknown>) => void;
  onClick?: () => void;
  compact?: boolean;
}

/**
 * TaskItem component
 *
 * Usage:
 * ```tsx
 * <TaskItem
 *   task={task}
 *   config={instanceConfig}
 *   onAction={handleAction}
 *   onClick={() => openDetails(task.id)}
 * />
 * ```
 */
export function TaskItem({
  task,
  config,
  onAction,
  onClick,
  compact = false
}: TaskItemProps) {
  const isExpired = task.expiresAt && new Date(task.expiresAt) < new Date();
  const isUrgent = task.priority === 'urgent' || task.priority === 'high';

  // Get category config
  const categoryConfig = config?.categories?.[task.category];
  const iconName = categoryConfig?.icon || task.data.icon || 'clipboard-check';
  const categoryColor = categoryConfig?.color || '#6b7280';

  // Get icon component
  const IconComponent = (LucideIcons as any)[
    iconName.split('-').map((s: string) => s.charAt(0).toUpperCase() + s.slice(1)).join('')
  ] || LucideIcons.ClipboardCheck;

  // Priority colors (SPEC-TASKS-V-003)
  const priorityColors = {
    urgent: 'text-red-600 bg-red-50 border-red-200',
    high: 'text-orange-600 bg-orange-50 border-orange-200',
    normal: 'text-blue-600 bg-blue-50 border-blue-200',
    low: 'text-gray-600 bg-gray-50 border-gray-200'
  };

  const priorityLabels = {
    urgent: 'URGENTE',
    high: 'ALTA',
    normal: 'NORMAL',
    low: 'BAIXA'
  };

  // Format relative time
  const relativeTime = formatDistanceToNow(new Date(task.createdAt), {
    addSuffix: true,
    locale: ptBR
  });

  // Calculate expiration time
  let expirationText = '';
  if (task.expiresAt) {
    if (isExpired) {
      expirationText = 'Expirada';
    } else {
      expirationText = `Expira ${formatDistanceToNow(new Date(task.expiresAt), {
        addSuffix: true,
        locale: ptBR
      })}`;
    }
  }

  return (
    <div
      className={cn(
        'border rounded-lg transition-colors',
        compact ? 'p-3' : 'p-4',
        onClick && 'cursor-pointer hover:bg-accent',
        isUrgent && 'border-l-4',
        isExpired && 'opacity-60',
        priorityColors[task.priority]
      )}
      onClick={onClick}
    >
      <div className="flex gap-3">
        {/* Icon */}
        <div
          className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: categoryColor + '20', color: categoryColor }}
        >
          <IconComponent className="h-5 w-5" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Priority Badge (SPEC-TASKS-V-003) */}
              <span className={cn(
                'text-[10px] font-bold px-2 py-0.5 rounded',
                priorityColors[task.priority]
              )}>
                {priorityLabels[task.priority]}
              </span>

              {/* Category Label */}
              {categoryConfig?.label && (
                <span className="text-xs text-muted-foreground">
                  {categoryConfig.label}
                </span>
              )}
            </div>

            {/* Time */}
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {relativeTime}
            </span>
          </div>

          {/* Title */}
          <h4 className={cn(
            'font-medium mb-1',
            compact ? 'text-sm' : 'text-base'
          )}>
            {task.data.title}
          </h4>

          {/* Description */}
          {task.data.description && !compact && (
            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
              {task.data.description}
            </p>
          )}

          {/* Expiration Warning (SPEC-TASKS-EXP-002 to EXP-005) */}
          {task.expiresAt && (
            <div className={cn(
              'flex items-center gap-1 text-xs mb-2',
              isExpired ? 'text-red-600' : 'text-orange-600'
            )}>
              <LucideIcons.Clock className="h-3 w-3" />
              <span>{expirationText}</span>
            </div>
          )}

          {/* Actions (SPEC-TASKS-D-002) */}
          {task.actions.length > 0 && onAction && !compact && (
            <div className="flex gap-2 flex-wrap mt-3">
              {task.actions.map((action) => {
                const ActionIcon = action.icon
                  ? (LucideIcons as any)[
                      action.icon.split('-').map((s: string) =>
                        s.charAt(0).toUpperCase() + s.slice(1)
                      ).join('')
                    ]
                  : null;

                return (
                  <Button
                    key={action.id}
                    variant={action.variant || (action.primary ? 'default' : 'outline')}
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAction(task.id, action.id);
                    }}
                  >
                    {ActionIcon && <ActionIcon className="h-3 w-3 mr-1" />}
                    {action.label}
                  </Button>
                );
              })}
            </div>
          )}

          {/* Compact mode: show action count */}
          {compact && task.actions.length > 0 && (
            <div className="text-xs text-muted-foreground mt-2">
              {task.actions.length} ação{task.actions.length > 1 ? 'ões' : ''} disponível{task.actions.length > 1 ? 'is' : ''}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
