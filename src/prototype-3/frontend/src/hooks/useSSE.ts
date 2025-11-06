import { useEffect, useState, useCallback } from 'react';
import { useSSEContext } from '../providers/SSEProvider';
import type {
  PlatformEvent,
  NotificationEvent,
  TaskEvent,
  DataChangedEvent,
  JobCompletedEvent,
  JobFailedEvent,
  JobProgressEvent,
  EventType,
} from '../types/events';

/**
 * useSSE Hook - Subscribe to SSE events
 *
 * SPEC-EV-FR-001 to SPEC-EV-FR-006: Frontend event processing
 *
 * @example
 * ```tsx
 * const { events, lastEvent } = useSSE();
 *
 * useEffect(() => {
 *   if (lastEvent?.type === 'notification') {
 *     toast.info(lastEvent.id);
 *   }
 * }, [lastEvent]);
 * ```
 */
export function useSSE() {
  const { state, lastEvent, lastEventTime, subscribe } = useSSEContext();

  return {
    state,
    lastEvent,
    lastEventTime,
    isConnected: state === 'connected',
    isConnecting: state === 'connecting',
    isDisconnected: state === 'disconnected',
    subscribe,
  };
}

/**
 * useSSEEvent Hook - Subscribe to specific event type
 *
 * @param eventType - Event type to listen for
 * @param handler - Event handler function
 *
 * @example
 * ```tsx
 * useSSEEvent('notification', (event) => {
 *   toast.info(`Notification: ${event.id}`);
 * });
 * ```
 */
export function useSSEEvent<T extends PlatformEvent = PlatformEvent>(
  eventType: EventType | EventType[],
  handler: (event: T) => void
) {
  const { subscribe } = useSSEContext();

  useEffect(() => {
    const types = Array.isArray(eventType) ? eventType : [eventType];

    const unsubscribe = subscribe((event) => {
      if (types.includes(event.type)) {
        handler(event as T);
      }
    });

    return unsubscribe;
  }, [eventType, handler, subscribe]);
}

/**
 * useNotifications Hook - Subscribe to notification events
 *
 * @example
 * ```tsx
 * const { notifications, lastNotification } = useNotifications();
 *
 * useEffect(() => {
 *   if (lastNotification) {
 *     toast.info(lastNotification.id);
 *   }
 * }, [lastNotification]);
 * ```
 */
export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationEvent[]>([]);
  const [lastNotification, setLastNotification] = useState<NotificationEvent | null>(null);

  useSSEEvent<NotificationEvent>('notification', (event) => {
    setLastNotification(event);
    setNotifications((prev) => [event, ...prev].slice(0, 100)); // Keep last 100
  });

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setLastNotification(null);
  }, []);

  return {
    notifications,
    lastNotification,
    clearNotifications,
  };
}

/**
 * useTasks Hook - Subscribe to task events
 *
 * @example
 * ```tsx
 * const { tasks, pendingTasks } = useTasks();
 *
 * // Display pending tasks to user
 * ```
 */
export function useTasks() {
  const [tasks, setTasks] = useState<TaskEvent[]>([]);
  const [lastTask, setLastTask] = useState<TaskEvent | null>(null);

  useSSEEvent<TaskEvent>('task', (event) => {
    setLastTask(event);
    setTasks((prev) => {
      // Update existing or add new
      const index = prev.findIndex((t) => t.id === event.id);
      if (index >= 0) {
        const updated = [...prev];
        updated[index] = event;
        return updated;
      }
      return [event, ...prev];
    });
  });

  const pendingTasks = tasks.filter((t) => t.data?.status === 'pending');
  const completedTasks = tasks.filter((t) => t.data?.status === 'completed');

  const clearTasks = useCallback(() => {
    setTasks([]);
    setLastTask(null);
  }, []);

  return {
    tasks,
    lastTask,
    pendingTasks,
    completedTasks,
    clearTasks,
  };
}

/**
 * useJobStatus Hook - Monitor job progress
 *
 * @param jobId - Job ID to monitor
 *
 * @example
 * ```tsx
 * const { progress, status, result, error } = useJobStatus('job_12345');
 *
 * if (status === 'completed') {
 *   console.log('Job result:', result);
 * }
 * ```
 */
export function useJobStatus(jobId: string | null) {
  const [progress, setProgress] = useState<number>(0);
  const [status, setStatus] = useState<'pending' | 'progress' | 'completed' | 'failed'>('pending');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useSSEEvent<JobCompletedEvent | JobFailedEvent | JobProgressEvent>(
    ['job-completed', 'job-failed', 'job-progress'],
    (event) => {
      if (!jobId || event.data.jobId !== jobId) {
        return;
      }

      if (event.type === 'job-completed') {
        setProgress(100);
        setStatus('completed');
        setResult(event.data.result);
      } else if (event.type === 'job-failed') {
        setStatus('failed');
        setError(event.data.error);
      } else if (event.type === 'job-progress') {
        setProgress(event.data.progress);
        setStatus('progress');
      }
    }
  );

  const reset = useCallback(() => {
    setProgress(0);
    setStatus('pending');
    setResult(null);
    setError(null);
  }, []);

  return {
    progress,
    status,
    result,
    error,
    isCompleted: status === 'completed',
    isFailed: status === 'failed',
    isInProgress: status === 'progress',
    reset,
  };
}

/**
 * useDataChanges Hook - Monitor data changes for specific schema/entity
 *
 * @param schema - Schema name
 * @param entity - Entity name (optional)
 *
 * @example
 * ```tsx
 * const { lastChange, changedIds } = useDataChanges('backend', 'portal');
 *
 * useEffect(() => {
 *   if (lastChange) {
 *     console.log('Portals changed:', changedIds);
 *   }
 * }, [lastChange]);
 * ```
 */
export function useDataChanges(schema: string, entity?: string) {
  const [lastChange, setLastChange] = useState<DataChangedEvent | null>(null);
  const [changedIds, setChangedIds] = useState<(string | number)[]>([]);

  useSSEEvent<DataChangedEvent>('data_changed', (event) => {
    if (event.data.schema !== schema) {
      return;
    }

    if (entity && event.data.entity !== entity) {
      return;
    }

    setLastChange(event);
    setChangedIds(event.data.ids || []);
  });

  return {
    lastChange,
    changedIds,
    hasChanges: lastChange !== null,
  };
}
