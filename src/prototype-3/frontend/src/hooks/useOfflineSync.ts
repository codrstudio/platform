import { useEffect, useState, useCallback } from 'react';
import { useSSE } from './useSSE';
import {
  queueEvent,
  getQueuedEvents,
  removeQueuedEvent,
  incrementRetryCount,
  clearQueue,
  getQueueStats,
} from '@/services/events/offlineSync';

/**
 * Offline Synchronization Hooks
 *
 * SPEC-EV-FR-004 to SPEC-EV-FR-006: Offline event recovery
 * SPEC-EV-SSE-027 to SPEC-EV-SSE-028: Reconnection and recovery
 * SPEC-EV-ST-013 to SPEC-EV-ST-016: Stream recovery
 *
 * Story 1.5.3: Offline sync hooks
 */

/**
 * useOfflineStatus Hook
 *
 * Detect online/offline state
 */
export function useOfflineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      console.log('[OfflineSync] Connection restored');
      setWasOffline(!isOnline); // Was offline if isOnline was false
      setIsOnline(true);
    };

    const handleOffline = () => {
      console.log('[OfflineSync] Connection lost');
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isOnline]);

  return {
    isOnline,
    isOffline: !isOnline,
    wasOffline,
  };
}

/**
 * useEventQueue Hook
 *
 * Manage offline event queue with auto-sync
 * SPEC-EV-FR-004: Reconnection triggers event recovery
 */
export function useEventQueue() {
  const { isOnline, wasOffline } = useOfflineStatus();
  const { isConnected, subscribe } = useSSE();
  const [queueSize, setQueueSize] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  // Update queue size
  const updateQueueSize = useCallback(async () => {
    const stats = await getQueueStats();
    setQueueSize(stats.totalEvents);
  }, []);

  // Queue events when offline
  useEffect(() => {
    if (!isOnline) {
      const unsubscribe = subscribe(async (event) => {
        try {
          await queueEvent(event);
          await updateQueueSize();
          const eventId = 'id' in event ? event.id : 'heartbeat';
          console.log('[OfflineSync] Event queued:', eventId);
        } catch (error) {
          console.error('[OfflineSync] Failed to queue event:', error);
        }
      });

      return unsubscribe;
    }
  }, [isOnline, subscribe, updateQueueSize]);

  // Auto-sync when connection restored
  // SPEC-EV-FR-004: Frontend fetches missed events on reconnect
  useEffect(() => {
    if (isOnline && wasOffline && isConnected) {
      syncQueue();
    }
  }, [isOnline, wasOffline, isConnected]);

  // Sync queued events
  const syncQueue = useCallback(async () => {
    setIsSyncing(true);
    setSyncError(null);

    try {
      const queuedEvents = await getQueuedEvents();

      console.log(`[OfflineSync] Syncing ${queuedEvents.length} queued events`);

      for (const queuedEvent of queuedEvents) {
        try {
          // In real implementation, would send to backend for processing
          // For now, just simulate processing and remove from queue
          const eventId = 'id' in queuedEvent.event ? queuedEvent.event.id : 'heartbeat';
          console.log('[OfflineSync] Processing queued event:', eventId);

          // Remove from queue after successful processing
          await removeQueuedEvent(queuedEvent.id);
        } catch (error) {
          console.error('[OfflineSync] Failed to process event:', error);

          // Increment retry count
          await incrementRetryCount(queuedEvent.id);

          // If retry count exceeds limit, remove from queue
          if (queuedEvent.retryCount >= 3) {
            console.warn('[OfflineSync] Max retries exceeded, removing event');
            await removeQueuedEvent(queuedEvent.id);
          }
        }
      }

      await updateQueueSize();
      console.log('[OfflineSync] Sync complete');
    } catch (error) {
      console.error('[OfflineSync] Sync failed:', error);
      setSyncError(error instanceof Error ? error.message : 'Sync failed');
    } finally {
      setIsSyncing(false);
    }
  }, [updateQueueSize]);

  // Clear queue
  const clearQueueData = useCallback(async () => {
    try {
      await clearQueue();
      await updateQueueSize();
      console.log('[OfflineSync] Queue cleared');
    } catch (error) {
      console.error('[OfflineSync] Failed to clear queue:', error);
    }
  }, [updateQueueSize]);

  // Initial queue size
  useEffect(() => {
    updateQueueSize();
  }, [updateQueueSize]);

  return {
    queueSize,
    isSyncing,
    syncError,
    syncQueue,
    clearQueue: clearQueueData,
    updateQueueSize,
  };
}

/**
 * useEventRecovery Hook
 *
 * Recover missed events from backend on reconnect
 * SPEC-EV-FR-005: Use timestamp of last event for recovery
 * SPEC-EV-ST-013 to SPEC-EV-ST-016: Query Stream for missed events
 */
export function useEventRecovery() {
  const { isConnected } = useSSE();
  const { isOnline, wasOffline } = useOfflineStatus();
  const [lastEventTimestamp, setLastEventTimestamp] = useState<string | null>(null);
  const [isRecovering, setIsRecovering] = useState(false);
  const [recoveredCount, setRecoveredCount] = useState(0);

  // Track last event timestamp
  // SPEC-EV-SSE-028: Store timestamp of last event
  useEffect(() => {
    const unsubscribe = useSSE().subscribe((event) => {
      setLastEventTimestamp(event.timestamp);
    });

    return unsubscribe;
  }, []);

  // Recover events on reconnect
  // SPEC-EV-FR-004: Fetch missed events via JQEL on reconnect
  useEffect(() => {
    if (isOnline && wasOffline && isConnected && lastEventTimestamp) {
      recoverEvents();
    }
  }, [isOnline, wasOffline, isConnected, lastEventTimestamp]);

  const recoverEvents = useCallback(async () => {
    if (!lastEventTimestamp) {
      console.log('[EventRecovery] No last event timestamp, skipping recovery');
      return;
    }

    setIsRecovering(true);
    setRecoveredCount(0);

    try {
      console.log('[EventRecovery] Recovering events since:', lastEventTimestamp);

      // In real implementation, would query backend for missed events via JQEL
      // SPEC-EV-ST-015: Query via JQEL (schema: system or backend)
      // SPEC-EV-FR-005: Use timestamp of last event

      // Example JQEL query:
      // {
      //   schema: "system",
      //   select: "events",
      //   where: { timestamp: { $gt: lastEventTimestamp } },
      //   options: { orderBy: [{ field: "timestamp", direction: "asc" }] }
      // }

      // For now, simulate recovery
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const recovered = 0; // Would be actual count from backend
      setRecoveredCount(recovered);

      console.log(`[EventRecovery] Recovered ${recovered} events`);
    } catch (error) {
      console.error('[EventRecovery] Recovery failed:', error);
    } finally {
      setIsRecovering(false);
    }
  }, [lastEventTimestamp]);

  return {
    isRecovering,
    recoveredCount,
    lastEventTimestamp,
    recoverEvents,
  };
}

/**
 * useOfflineBanner Hook
 *
 * Show offline indicator banner
 */
export function useOfflineBanner() {
  const { isOffline } = useOfflineStatus();
  const { queueSize } = useEventQueue();

  return {
    showBanner: isOffline,
    message: isOffline
      ? `You are offline. ${queueSize} event${queueSize === 1 ? '' : 's'} queued for sync.`
      : null,
  };
}
