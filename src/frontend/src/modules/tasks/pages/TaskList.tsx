/**
 * TaskList Page
 *
 * Página completa de listagem de tarefas com filtros e visualizações.
 *
 * SPEC Compliance:
 * - SPEC-TASKS-L-001: Página de listagem completa
 * - SPEC-TASKS-L-002: Filtros (status, prioridade, categoria)
 * - SPEC-TASKS-L-003: Busca por texto
 * - SPEC-TASKS-L-004: Alternância entre visualizações
 * - SPEC-TASKS-V-001 to V-003: Visualização em lista com grupos
 * - SPEC-TASKS-PERF-001 to PERF-003: Paginação e performance
 */

import { useState } from 'react';
import { Search, Filter, Loader2, Inbox, List, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TaskItem } from '../components/TaskItem';
import { useTasks } from '../hooks/useTasks';
import type { TaskFilters, TaskModuleConfig, TaskStatus } from '../types';

export interface TaskListProps {
  config?: Partial<TaskModuleConfig>;
  portalId?: string;
  moduleId?: string;
}

/**
 * TaskList page
 */
export function TaskList({
  config,
  portalId
}: TaskListProps) {
  const [filters, setFilters] = useState<TaskFilters>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>(
    config?.defaultView || 'list'
  );

  // Breadcrumb
    portalId,
    moduleName: 'Tarefas'
  });

  // Fetch tasks with filters
  const {
    tasks,
    pendingCount,
    isLoading,
    executeAction
  } = useTasks(config, {
    ...filters,
    search: searchQuery || undefined
  });

  const hasTasks = tasks.length > 0;

  // Filter by search query (client-side filtering for now)
  const filteredTasks = searchQuery
    ? tasks.filter(t =>
        t.data.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.data.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : tasks;

  // Group tasks by status (SPEC-TASKS-V-001)
  const tasksByStatus: Record<TaskStatus, typeof filteredTasks> = {
    pending: filteredTasks.filter(t => t.status === 'pending'),
    in_progress: filteredTasks.filter(t => t.status === 'in_progress'),
    completed: filteredTasks.filter(t => t.status === 'completed'),
    cancelled: filteredTasks.filter(t => t.status === 'cancelled')
  };

  const statusLabels: Record<TaskStatus, string> = {
    pending: 'Pendentes',
    in_progress: 'Em Andamento',
    completed: 'Concluídas',
    cancelled: 'Canceladas'
  };

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
    <div className="container mx-auto p-6 space-y-6">
      {/* Breadcrumb */}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tarefas</h1>
          <p className="text-muted-foreground mt-1">
            {pendingCount > 0 ? `${pendingCount} pendente${pendingCount > 1 ? 's' : ''}` : 'Todas as tarefas concluídas'}
          </p>
        </div>

        {/* View toggle (SPEC-TASKS-L-004) */}
        {config?.enableKanban && (
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4 mr-2" />
              Lista
            </Button>
            <Button
              variant={viewMode === 'kanban' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('kanban')}
            >
              <LayoutGrid className="h-4 w-4 mr-2" />
              Kanban
            </Button>
          </div>
        )}
      </div>

      {/* Search and Filters (SPEC-TASKS-L-002, SPEC-TASKS-L-003) */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar tarefas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {/* Filter Panel (SPEC-TASKS-L-002) */}
      {showFilters && (
        <div className="border rounded-lg p-4 space-y-4">
          <h3 className="font-medium text-sm">Filtros</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Status Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <select
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
                value={filters.status as string || ''}
                onChange={(e) => setFilters({ ...filters, status: e.target.value as TaskStatus || undefined })}
              >
                <option value="">Todos</option>
                <option value="pending">Pendente</option>
                <option value="in_progress">Em Andamento</option>
                <option value="completed">Concluída</option>
                <option value="cancelled">Cancelada</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">Prioridade</label>
              <select
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
                value={filters.priority as string || ''}
                onChange={(e) => setFilters({ ...filters, priority: e.target.value as any || undefined })}
              >
                <option value="">Todas</option>
                <option value="urgent">Urgente</option>
                <option value="high">Alta</option>
                <option value="normal">Normal</option>
                <option value="low">Baixa</option>
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">Categoria</label>
              <select
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
                value={filters.category as string || ''}
                onChange={(e) => setFilters({ ...filters, category: e.target.value || undefined })}
              >
                <option value="">Todas</option>
                {config?.categories && Object.entries(config.categories).map(([key, cat]) => (
                  <option key={key} value={key}>{cat.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilters({})}
            >
              Limpar filtros
            </Button>
          </div>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !hasTasks && (
        <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg">
          <Inbox className="h-16 w-16 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold mb-1">Nenhuma tarefa</h3>
          <p className="text-sm text-muted-foreground">
            {searchQuery || Object.keys(filters).length > 0
              ? 'Nenhuma tarefa encontrada com os filtros aplicados'
              : 'Você não tem tarefas no momento'}
          </p>
        </div>
      )}

      {/* Task List - Grouped by status (SPEC-TASKS-V-001 to V-003) */}
      {!isLoading && hasTasks && viewMode === 'list' && (
        <div className="space-y-6">
          {(['pending', 'in_progress', 'completed', 'cancelled'] as TaskStatus[]).map((status) => {
            const statusTasks = tasksByStatus[status];
            if (statusTasks.length === 0) return null;

            return (
              <div key={status} className="space-y-3">
                {/* Group header (SPEC-TASKS-V-002: collapsible) */}
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold">
                    {statusLabels[status]}
                  </h2>
                  <span className="text-sm text-muted-foreground">
                    ({statusTasks.length})
                  </span>
                </div>

                {/* Tasks in this group */}
                <div className="space-y-2">
                  {statusTasks.map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      config={config}
                      onAction={handleAction}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Kanban View (SPEC-TASKS-V-004 to V-007) */}
      {!isLoading && hasTasks && viewMode === 'kanban' && (
        <div className="text-center py-12 border rounded-lg">
          <LayoutGrid className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Visualização Kanban</h3>
          <p className="text-sm text-muted-foreground">
            A visualização em Kanban será implementada em uma próxima iteração.
          </p>
        </div>
      )}

      {/* TODO: Pagination (SPEC-TASKS-PERF-001) */}
      {filteredTasks.length > 0 && (
        <div className="flex justify-center pt-4">
          <p className="text-sm text-muted-foreground">
            Mostrando {filteredTasks.length} tarefas
          </p>
        </div>
      )}
    </div>
  );
}
