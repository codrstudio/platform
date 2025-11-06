import { useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { Button } from '../components/ui/button';
import {
  useSSE,
  useNotifications,
  useTasks,
  useJobStatus,
  useDataChanges,
  useSSEEvent,
} from '../hooks/useSSE';
import type { PlatformEvent } from '../types/events';

/**
 * SSE Examples - Demonstrating real-time event handling
 *
 * SPEC-EV-FR-001 to SPEC-EV-FR-006: Frontend event processing
 * SPEC-DA-EV-001 to SPEC-DA-EV-008: Cache invalidation via events
 *
 * Story 1.4.3: Real-time data updates
 */

/**
 * Example 1: Basic SSE Connection Status
 *
 * Shows connection state and last event received
 */
export function SSEConnectionStatus() {
  const { state, lastEvent, lastEventTime, isConnected } = useSSE();

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold">SSE Connection Status</h3>
      <div className="flex items-center gap-2">
        <div
          className={`w-3 h-3 rounded-full ${
            isConnected ? 'bg-green-500' : 'bg-red-500'
          }`}
        />
        <span className="text-sm font-medium capitalize">{state}</span>
      </div>

      {lastEvent && (
        <div className="text-sm text-muted-foreground">
          <div>Last Event: {lastEvent.type}</div>
          {'id' in lastEvent && <div>Event ID: {lastEvent.id}</div>}
          {lastEventTime && (
            <div>Time: {new Date(lastEventTime).toLocaleTimeString()}</div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Example 2: Notification Display
 *
 * Shows recent notifications received via SSE
 */
export function NotificationDisplay() {
  const { notifications, lastNotification, clearNotifications } = useNotifications();

  useEffect(() => {
    if (lastNotification) {
      console.log('[Example] New notification:', lastNotification);
    }
  }, [lastNotification]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Notifications ({notifications.length})</h3>
        <Button variant="outline" onClick={clearNotifications}>
          Clear All
        </Button>
      </div>

      {notifications.length === 0 ? (
        <p className="text-sm text-muted-foreground">No notifications yet</p>
      ) : (
        <div className="space-y-2">
          {notifications.slice(0, 5).map((notif) => (
            <Alert key={notif.id}>
              <AlertTitle className="text-sm">
                {notif.category || 'Notification'}
              </AlertTitle>
              <AlertDescription className="text-xs">
                ID: {notif.id}
                <br />
                Time: {new Date(notif.timestamp).toLocaleString()}
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Example 3: Task Queue
 *
 * Shows pending tasks that require user action
 */
export function TaskQueue() {
  const { pendingTasks, completedTasks, clearTasks } = useTasks();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          Tasks ({pendingTasks.length} pending, {completedTasks.length} completed)
        </h3>
        <Button variant="outline" onClick={clearTasks}>
          Clear All
        </Button>
      </div>

      {pendingTasks.length === 0 ? (
        <p className="text-sm text-muted-foreground">No pending tasks</p>
      ) : (
        <div className="space-y-2">
          {pendingTasks.map((task) => (
            <Alert key={task.id}>
              <AlertTitle className="text-sm">
                {task.category || 'Task'} - {task.data?.status}
              </AlertTitle>
              <AlertDescription className="text-xs">
                ID: {task.id}
                <br />
                Priority: {task.priority || 'normal'}
                <br />
                Time: {new Date(task.timestamp).toLocaleString()}
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Example 4: Job Progress Monitor
 *
 * Monitors a specific job's progress
 */
export function JobProgressMonitor({ jobId }: { jobId: string | null }) {
  const { progress, status, result, error, isCompleted, isFailed, reset } =
    useJobStatus(jobId);

  if (!jobId) {
    return (
      <div className="text-sm text-muted-foreground">No job selected for monitoring</div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Job Monitor: {jobId}</h3>
        <Button variant="outline" onClick={reset}>
          Reset
        </Button>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span>Status:</span>
          <span className="font-medium capitalize">{status}</span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span>Progress:</span>
          <span className="font-medium">{progress}%</span>
        </div>

        {progress > 0 && (
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {isCompleted && result && (
          <Alert>
            <AlertTitle className="text-sm">Job Completed</AlertTitle>
            <AlertDescription className="text-xs">
              Result: {JSON.stringify(result)}
            </AlertDescription>
          </Alert>
        )}

        {isFailed && error && (
          <Alert variant="destructive">
            <AlertTitle className="text-sm">Job Failed</AlertTitle>
            <AlertDescription className="text-xs">{error}</AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}

/**
 * Example 5: Data Change Monitor
 *
 * Monitors data changes for a specific schema/entity
 */
export function DataChangeMonitor({
  schema,
  entity,
}: {
  schema: string;
  entity?: string;
}) {
  const { lastChange, changedIds, hasChanges } = useDataChanges(schema, entity);

  useEffect(() => {
    if (hasChanges && lastChange) {
      console.log(`[Data Changed] ${schema}.${lastChange.data.entity}:`, changedIds);
    }
  }, [hasChanges, lastChange, schema, changedIds]);

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold">
        Data Changes: {schema}
        {entity && `.${entity}`}
      </h3>

      {!hasChanges ? (
        <p className="text-sm text-muted-foreground">No changes detected yet</p>
      ) : (
        <div className="space-y-2">
          <Alert>
            <AlertTitle className="text-sm">
              {lastChange?.data.schema}.{lastChange?.data.entity}
            </AlertTitle>
            <AlertDescription className="text-xs">
              {changedIds.length > 0 ? (
                <>
                  Changed IDs: {changedIds.join(', ')}
                  <br />
                </>
              ) : (
                <>
                  All records invalidated
                  <br />
                </>
              )}
              Time: {lastChange && new Date(lastChange.timestamp).toLocaleString()}
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
}

/**
 * Example 6: Custom Event Handler
 *
 * Shows how to subscribe to any event type with custom logic
 */
export function CustomEventHandler() {
  const [eventLog, setEventLog] = useState<PlatformEvent[]>([]);

  useSSEEvent(['notification', 'task', 'data_changed'], (event) => {
    console.log('[Custom Handler] Event received:', event);
    setEventLog((prev) => [event, ...prev].slice(0, 10));
  });

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Event Log (Last 10)</h3>

      {eventLog.length === 0 ? (
        <p className="text-sm text-muted-foreground">No events yet</p>
      ) : (
        <div className="space-y-2">
          {eventLog.map((event, index) => (
            <div
              key={'id' in event ? event.id : index}
              className="text-xs font-mono bg-gray-50 p-2 rounded"
            >
              <div>
                <span className="font-semibold">{event.type}</span>
                {'id' in event && <> - {event.id}</>}
              </div>
              <div className="text-gray-600">
                {new Date(event.timestamp).toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Example 7: Complete SSE Dashboard
 *
 * Combines all examples into a single dashboard
 */
export function SSEDashboard() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Real-time Events Dashboard</h1>
        <p className="text-muted-foreground">
          Demonstrating Server-Sent Events (SSE) for real-time data updates
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border rounded-lg p-4">
          <SSEConnectionStatus />
        </div>

        <div className="border rounded-lg p-4">
          <DataChangeMonitor schema="backend" entity="portal" />
        </div>

        <div className="border rounded-lg p-4">
          <NotificationDisplay />
        </div>

        <div className="border rounded-lg p-4">
          <TaskQueue />
        </div>

        <div className="border rounded-lg p-4">
          <JobProgressMonitor jobId={null} />
        </div>

        <div className="border rounded-lg p-4">
          <CustomEventHandler />
        </div>
      </div>

      <div className="border rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-2">Usage Notes</h3>
        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
          <li>SSE automatically connects when user is authenticated</li>
          <li>Connection auto-reconnects with exponential backoff on failure</li>
          <li>Cache invalidation happens automatically on data_changed events</li>
          <li>All events are typed and validated for forward compatibility</li>
          <li>Heartbeat sent every 30 seconds to keep connection alive</li>
        </ul>
      </div>
    </div>
  );
}

// Fix missing import
import { useState } from 'react';
