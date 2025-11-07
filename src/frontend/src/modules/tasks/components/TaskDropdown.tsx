/**
 * TaskDropdown Component
 *
 * Dropdown de acesso rápido às tarefas pendentes.
 *
 * SPEC Compliance:
 * - SPEC-TASKS-P-001: Dropdown de acesso rápido
 * - SPEC-TASKS-P-002: Últimas N tarefas
 * - SPEC-TASKS-P-003: Preview de cada tarefa
 * - SPEC-TASKS-P-004: Ordenação (prioridade → data)
 * - SPEC-TASKS-P-005: Link "Ver todas"
 * - SPEC-TASKS-P-006: Ações inline se configurado
 * - SPEC-TASKS-P-007: Estados vazio/carregando
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Loader2, Inbox } from 'lucide-react';
import { TaskBadge } from './TaskBadge';
import { TaskItem } from './TaskItem';
import { useTasks } from '../hooks/useTasks';
import type { TaskModuleConfig } from '../types';

export interface TaskDropdownProps {
  config?: Partial<TaskModuleConfig>;
  tasksPageUrl?: string;
  className?: string;
}

/**
 * TaskDropdown component
 *
 * Usage:
 * ```tsx
 * <TaskDropdown
 *   config={instanceConfig}
 *   tasksPageUrl="/tasks"
 * />
 * ```
 */
export function TaskDropdown({
  config,
  tasksPageUrl = '/tasks',
  className
}: TaskDropdownProps) {
  const [_open, setOpen] = useState(false);

  const {
    recentTasks,
    pendingCount,
    isLoading,
    executeAction
  } = useTasks(config);

  const hasTasks = recentTasks.length > 0;

  const handleAction = (taskId: string, actionId: string, data?: Record<string, unknown>) => {
    executeAction({
      taskId,
      actionId,
      userId: 'current-user', // Will be replaced by actual user ID
      data: data || {},
      timestamp: new Date().toISOString()
    });
  };

  return (
    <DropdownMenu>
      {/* Trigger - Badge with icon (SPEC-TASKS-B-001 to B-006) */}
      <DropdownMenuTrigger asChild>
        <div>
          <TaskBadge
            pendingCount={pendingCount}
            className={className}
          />
        </div>
      </DropdownMenuTrigger>

      {/* Dropdown content (SPEC-TASKS-P-001) */}
      <DropdownMenuContent align="end" className="w-96">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="font-semibold text-sm">Tarefas Pendentes</h3>
          {pendingCount > 0 && (
            <span className="text-xs text-muted-foreground">
              {pendingCount} pendente{pendingCount > 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Loading state (SPEC-TASKS-P-007) */}
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Empty state (SPEC-TASKS-P-007) */}
        {!isLoading && !hasTasks && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Inbox className="h-12 w-12 text-muted-foreground/50 mb-2" />
            <p className="text-sm font-medium">Nenhuma tarefa pendente</p>
            <p className="text-xs text-muted-foreground mt-1">
              Você está em dia!
            </p>
          </div>
        )}

        {/* Task list (SPEC-TASKS-P-002 to P-004) */}
        {!isLoading && hasTasks && (
          <div className="max-h-[500px] overflow-y-auto">
            <div className="p-2 space-y-2">
              {recentTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  config={config}
                  onAction={handleAction}
                  onClick={() => setOpen(false)}
                  compact
                />
              ))}
            </div>
          </div>
        )}

        {/* Footer with "View all" link (SPEC-TASKS-P-005) */}
        {hasTasks && (
          <>
            <DropdownMenuSeparator />
            <div className="p-2">
              <Link to={tasksPageUrl}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-center"
                  onClick={() => setOpen(false)}
                >
                  Ver todas as tarefas
                </Button>
              </Link>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
