/**
 * useTasks Hook
 *
 * Hook para gerenciamento de tarefas interativas com integração SSE e JQEL.
 *
 * SPEC Compliance:
 * - SPEC-TASKS-E-001 to E-005: Escuta Canal de Eventos (SSE)
 * - SPEC-TASKS-R-001 to R-005: Envio de Respostas
 * - SPEC-TASKS-ST-001 to ST-003: Gerenciamento de Status
 * - SPEC-TASKS-PERF-004 to PERF-006: Optimistic Updates
 */

import { useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEvents } from '@/contexts/EventContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { Task, TaskFilters, TaskModuleConfig, TaskResponse } from '../types';
import type { TaskEvent } from '@/types/event';

const DEFAULT_CONFIG: TaskModuleConfig = {
  iconPosition: 'header',
  taskRoute: '/tasks',
  previewSize: 5,
  defaultView: 'list',
  enableKanban: false,
  enableSound: true,
  soundUrl: '/sounds/task.mp3',
  enableToast: true,
  autoRefresh: 0,
  categories: {
    email_approval: {
      icon: 'mail-check',
      color: '#3b82f6',
      label: 'Aprovação de Email'
    },
    system_error: {
      icon: 'alert-triangle',
      color: '#ef4444',
      label: 'Erro do Sistema'
    },
    data_validation: {
      icon: 'file-check',
      color: '#f59e0b',
      label: 'Validação de Dados'
    },
    manual_review: {
      icon: 'eye',
      color: '#8b5cf6',
      label: 'Revisão Manual'
    },
    configuration_required: {
      icon: 'settings',
      color: '#06b6d4',
      label: 'Configuração Necessária'
    }
  }
};

/**
 * Fetch tasks from JQEL
 * SPEC-TASKS-E-001 to E-004
 */
async function fetchTasks(
  _userId: string,
  _config: TaskModuleConfig,
  _filters?: TaskFilters
): Promise<Task[]> {
  // TODO: Implement JQEL query
  // For now, return mock data
  return [];
}

/**
 * Execute task action (respond to task)
 * SPEC-TASKS-R-001 to R-005
 */
async function executeAction(
  response: TaskResponse,
  _config: TaskModuleConfig
): Promise<void> {
  // TODO: Implement JQEL mutation
  console.log('Execute task action:', response);
}

/**
 * Update task status
 * SPEC-TASKS-ST-001 to ST-003
 */
async function updateTaskStatus(
  taskId: string,
  status: Task['status'],
  _config: TaskModuleConfig
): Promise<void> {
  // TODO: Implement JQEL mutation
  console.log('Update task status:', taskId, status);
}

/**
 * Cancel task
 */
async function cancelTask(
  taskId: string,
  _config: TaskModuleConfig
): Promise<void> {
  // TODO: Implement JQEL mutation
  console.log('Cancel task:', taskId);
}

/**
 * useTasks Hook
 */
export function useTasks(
  config: Partial<TaskModuleConfig> = {},
  filters?: TaskFilters
) {
  const { user } = useAuth();
  const { lastEvent } = useEvents();
  const queryClient = useQueryClient();

  const fullConfig: TaskModuleConfig = {
    ...DEFAULT_CONFIG,
    ...config,
    categories: { ...DEFAULT_CONFIG.categories, ...config.categories }
  };

  const userId = user?.id ? String(user.id) : null;

  // Fetch tasks (SPEC-TASKS-E-001 to E-004)
  const {
    data: tasks = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['tasks', userId, filters],
    queryFn: () => fetchTasks(userId!, fullConfig, filters),
    enabled: !!userId,
    staleTime: 1000 * 60 * 2 // 2 minutes
  });

  // Execute action mutation (SPEC-TASKS-R-001 to R-005)
  const executeActionMutation = useMutation({
    mutationFn: (response: TaskResponse) => executeAction(response, fullConfig),
    // Optimistic update (SPEC-TASKS-PERF-004 to PERF-006)
    onMutate: async (response) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: ['tasks'] });

      // Snapshot previous value
      const previousTasks = queryClient.getQueryData<Task[]>(['tasks', userId, filters]);

      // Optimistically update to completed
      queryClient.setQueryData<Task[]>(['tasks', userId, filters], (old = []) => {
        return old.map(task =>
          task.id === response.taskId
            ? {
                ...task,
                status: 'completed' as const,
                response: {
                  actionId: response.actionId,
                  data: response.data,
                  respondedBy: response.userId,
                  respondedAt: response.timestamp
                },
                completedAt: response.timestamp
              }
            : task
        );
      });

      return { previousTasks };
    },
    onError: (_err, _response, context) => {
      // Revert on error (SPEC-TASKS-PERF-006)
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks', userId, filters], context.previousTasks);
      }
      toast.error('Erro ao executar ação', {
        description: 'Não foi possível processar sua resposta. Tente novamente.'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Ação executada com sucesso');
    }
  });

  // Update status mutation (SPEC-TASKS-ST-001 to ST-003)
  const updateStatusMutation = useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: Task['status'] }) =>
      updateTaskStatus(taskId, status, fullConfig),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    }
  });

  // Cancel task mutation
  const cancelTaskMutation = useMutation({
    mutationFn: (taskId: string) => cancelTask(taskId, fullConfig),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    }
  });

  // Listen to SSE events (SPEC-TASKS-E-001 to E-005)
  useEffect(() => {
    if (!lastEvent || lastEvent.type !== 'task') return;

    const taskEvent = lastEvent as TaskEvent;

    // Only process events for current user
    if (Array.isArray(taskEvent.userId)) {
      if (!taskEvent.userId.includes(userId!)) return;
    } else {
      if (taskEvent.userId !== userId) return;
    }

    // Show toast (SPEC-TASKS-CFG-002)
    if (fullConfig.enableToast) {
      const title = (taskEvent.data as any)?.title || 'Nova tarefa';
      const description = (taskEvent.data as any)?.description || '';

      toast(title, {
        description,
        action: (taskEvent.data as any)?.url ? {
          label: 'Ver',
          onClick: () => {
            window.location.href = (taskEvent.data as any).url;
          }
        } : undefined
      });
    }

    // Play sound (SPEC-TASKS-CFG-002)
    if (fullConfig.enableSound) {
      const audio = new Audio(fullConfig.soundUrl);
      audio.play().catch(console.error);
    }

    // Invalidate queries to fetch new task (SPEC-TASKS-E-005)
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
  }, [lastEvent, userId, fullConfig, queryClient]);

  // Auto-refresh (SPEC-TASKS-CFG-002)
  useEffect(() => {
    if (fullConfig.autoRefresh <= 0) return;

    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    }, fullConfig.autoRefresh);

    return () => clearInterval(interval);
  }, [fullConfig.autoRefresh, queryClient]);

  // Calculate pending count (for badge)
  const pendingCount = useMemo(() => {
    return tasks.filter(t => t.status === 'pending').length;
  }, [tasks]);

  // Get recent tasks for preview (SPEC-TASKS-P-001 to P-007)
  const recentTasks = useMemo(() => {
    return tasks
      .filter(t => t.status === 'pending' || t.status === 'in_progress')
      .sort((a, b) => {
        // Sort by priority first, then by creation date
        const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 };
        if (a.priority !== b.priority) {
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      })
      .slice(0, fullConfig.previewSize);
  }, [tasks, fullConfig.previewSize]);

  return {
    tasks,
    recentTasks,
    pendingCount,
    isLoading,
    error,
    executeAction: executeActionMutation.mutate,
    updateStatus: updateStatusMutation.mutate,
    cancelTask: cancelTaskMutation.mutate,
    isExecuting: executeActionMutation.isPending,
    isUpdating: updateStatusMutation.isPending
  };
}
