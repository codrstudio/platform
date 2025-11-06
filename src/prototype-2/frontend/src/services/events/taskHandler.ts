/**
 * Task Event Handler
 *
 * Processes task events and tracks task progress.
 * Displays progress bars and status updates.
 *
 * SPEC References:
 * - SPEC-EV-CO-009:013: Task concepts (interactive, requires action)
 * - SPEC-EV-TA-001:010: Task event structure and status
 */

import { toast } from '../../hooks/use-toast';
import type { TaskEvent } from '../../types/events';
import type { QueryClient } from '@tanstack/react-query';

// QueryClient access (set during initialization)
let queryClient: QueryClient | null = null;

// Task state tracking
interface TaskState {
  taskId: string;
  jobId: string;
  status: string;
  progress: number;
  message?: string;
  toastId?: string; // Track toast for updates
  startTime: number;
}

const activeTasks = new Map<string, TaskState>();

/**
 * Initialize task handler with QueryClient
 *
 * @param client - TanStack QueryClient instance
 */
export function initTaskHandler(client: QueryClient): void {
  queryClient = client;
  console.log('[TaskHandler] Initialized');
}

/**
 * Update task state
 *
 * @param taskId - Task identifier
 * @param updates - Partial task state updates
 */
function updateTaskState(taskId: string, updates: Partial<TaskState>): void {
  const existing = activeTasks.get(taskId);
  if (existing) {
    activeTasks.set(taskId, { ...existing, ...updates });
  } else {
    activeTasks.set(taskId, {
      taskId,
      jobId: updates.jobId || taskId,
      status: updates.status || 'pending',
      progress: updates.progress || 0,
      message: updates.message,
      toastId: updates.toastId,
      startTime: updates.startTime || Date.now(),
    });
  }
}

/**
 * Remove task from tracking
 *
 * @param taskId - Task identifier
 */
function removeTask(taskId: string): void {
  activeTasks.delete(taskId);
  console.log('[TaskHandler] Task removed from tracking:', taskId);
}

/**
 * Handle task event
 *
 * Main handler function registered with EventHandlerRegistry.
 *
 * SPEC-EV-CO-010: Task must have status
 * SPEC-EV-CO-011: Task must allow interaction
 *
 * @param event - Task event
 */
export async function handleTask(event: TaskEvent): Promise<void> {
  console.log('[TaskHandler] Processing task:', event.id);

  const taskId = event.id;
  const data = event.data;
  const status = event.status || data?.status || 'pending';
  const progress = data?.progress || 0;
  const message = data?.message || event.category;

  // Update task state
  updateTaskState(taskId, {
    jobId: data?.jobId || taskId,
    status,
    progress,
    message,
  });

  // Handle different statuses
  switch (status) {
    case 'pending':
      // Show pending toast
      const pendingToast = toast({
        title: 'Task Pending',
        description: message || 'Task queued for processing',
        variant: 'default',
        duration: 3000,
      });
      updateTaskState(taskId, { toastId: pendingToast.id });
      break;

    case 'running':
      // Show/update progress toast
      const runningToast = toast({
        title: 'Task Running',
        description: `${message || 'Processing'} (${progress}%)`,
        variant: 'default',
        duration: null, // No auto-dismiss
      });
      updateTaskState(taskId, { toastId: runningToast.id });
      break;

    case 'completed':
      // Show success toast
      toast({
        title: 'Task Completed',
        description: message || 'Task completed successfully',
        variant: 'success',
        duration: 5000,
      });

      // Invalidate task queries
      if (queryClient) {
        await queryClient.invalidateQueries({ queryKey: ['tasks'] });
        await queryClient.invalidateQueries({ queryKey: ['tasks', taskId] });
      }

      // Remove from tracking after delay
      setTimeout(() => removeTask(taskId), 5000);
      break;

    case 'failed':
      // Show error toast with retry option
      toast({
        title: 'Task Failed',
        description: data?.error || message || 'Task failed to complete',
        variant: 'error',
        duration: null, // Don't auto-dismiss errors
        action: data?.result?.retryable
          ? {
              label: 'Retry',
              onClick: () => {
                console.log('[TaskHandler] Retry task:', taskId);
                // Emit retry event or call API
                // TODO: Implement retry logic
              },
            }
          : undefined,
      });

      // Invalidate task queries
      if (queryClient) {
        await queryClient.invalidateQueries({ queryKey: ['tasks'] });
      }

      // Remove from tracking after delay
      setTimeout(() => removeTask(taskId), 10000);
      break;

    case 'cancelled':
      // Show cancelled toast
      toast({
        title: 'Task Cancelled',
        description: message || 'Task was cancelled',
        variant: 'warning',
        duration: 5000,
      });

      // Invalidate task queries
      if (queryClient) {
        await queryClient.invalidateQueries({ queryKey: ['tasks'] });
      }

      // Remove from tracking
      removeTask(taskId);
      break;

    default:
      console.warn('[TaskHandler] Unknown task status:', status);
  }

  console.log('[TaskHandler] Task processed:', taskId);
}

/**
 * Get all active tasks
 *
 * Useful for displaying task list UI.
 *
 * @returns Array of active task states
 */
export function getActiveTasks(): TaskState[] {
  return Array.from(activeTasks.values());
}

/**
 * Get specific task state
 *
 * @param taskId - Task identifier
 * @returns Task state or undefined
 */
export function getTaskState(taskId: string): TaskState | undefined {
  return activeTasks.get(taskId);
}
