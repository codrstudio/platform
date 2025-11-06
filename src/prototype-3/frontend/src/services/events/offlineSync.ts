import type { PlatformEvent } from '@/types/events';

/**
 * Offline Event Synchronization Service
 *
 * SPEC-EV-ST-001 to SPEC-EV-ST-016: Redis Streams buffer for offline events
 * SPEC-EV-FR-004 to SPEC-EV-FR-006: Offline event recovery
 * SPEC-EV-SSE-027 to SPEC-EV-SSE-028: Reconnection and recovery
 *
 * Story 1.5.3: Offline sync implementation
 */

const DB_NAME = 'platform-events';
const DB_VERSION = 1;
const STORE_NAME = 'event-queue';
const MAX_QUEUE_SIZE = 1000; // SPEC-EV-ST-006: Keep last 1000 messages

interface QueuedEvent {
  id: string;
  event: PlatformEvent;
  timestamp: number;
  retryCount: number;
}

/**
 * Initialize IndexedDB for event persistence
 */
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error('Failed to open IndexedDB'));
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create object store if it doesn't exist
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
}

/**
 * Queue event for later synchronization
 * SPEC-EV-ST-009: Backend adds events to Stream
 */
export async function queueEvent(event: PlatformEvent): Promise<void> {
  try {
    const db = await openDatabase();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    // HeartbeatEvent doesn't have an id field, use timestamp
    const eventId = 'id' in event ? event.id : `heartbeat_${Date.now()}`;

    const queuedEvent: QueuedEvent = {
      id: `${eventId}_${Date.now()}`,
      event,
      timestamp: Date.now(),
      retryCount: 0,
    };

    store.add(queuedEvent);

    // Cleanup old events if exceeding limit
    await cleanupOldEvents(db);

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  } catch (error) {
    console.error('[OfflineSync] Failed to queue event:', error);
    throw error;
  }
}

/**
 * Get all queued events
 */
export async function getQueuedEvents(): Promise<QueuedEvent[]> {
  try {
    const db = await openDatabase();
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('timestamp');

    return new Promise((resolve, reject) => {
      const request = index.getAll();

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('[OfflineSync] Failed to get queued events:', error);
    return [];
  }
}

/**
 * Remove event from queue after successful sync
 */
export async function removeQueuedEvent(id: string): Promise<void> {
  try {
    const db = await openDatabase();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    store.delete(id);

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  } catch (error) {
    console.error('[OfflineSync] Failed to remove queued event:', error);
    throw error;
  }
}

/**
 * Increment retry count for event
 */
export async function incrementRetryCount(id: string): Promise<void> {
  try {
    const db = await openDatabase();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    const request = store.get(id);

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const queuedEvent = request.result as QueuedEvent;
        if (queuedEvent) {
          queuedEvent.retryCount += 1;
          store.put(queuedEvent);
        }
      };

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  } catch (error) {
    console.error('[OfflineSync] Failed to increment retry count:', error);
    throw error;
  }
}

/**
 * Clear all queued events
 */
export async function clearQueue(): Promise<void> {
  try {
    const db = await openDatabase();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    store.clear();

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  } catch (error) {
    console.error('[OfflineSync] Failed to clear queue:', error);
    throw error;
  }
}

/**
 * Cleanup old events to maintain size limit
 * SPEC-EV-ST-006: Maintain last 1000 messages or 24 hours
 */
async function cleanupOldEvents(db: IDBDatabase): Promise<void> {
  const transaction = db.transaction([STORE_NAME], 'readwrite');
  const store = transaction.objectStore(STORE_NAME);
  const index = store.index('timestamp');

  const countRequest = store.count();

  countRequest.onsuccess = () => {
    const count = countRequest.result;

    if (count > MAX_QUEUE_SIZE) {
      // Get oldest events
      const cursorRequest = index.openCursor();
      let deleteCount = count - MAX_QUEUE_SIZE;

      cursorRequest.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor && deleteCount > 0) {
          cursor.delete();
          deleteCount--;
          cursor.continue();
        }
      };
    }

    // Also delete events older than 24 hours
    const twentyFourHoursAgo = Date.now() - 24 * 60 * 60 * 1000;
    const rangeCursorRequest = index.openCursor(
      IDBKeyRange.upperBound(twentyFourHoursAgo)
    );

    rangeCursorRequest.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result;
      if (cursor) {
        cursor.delete();
        cursor.continue();
      }
    };
  };
}

/**
 * Get queue statistics
 */
export async function getQueueStats(): Promise<{
  totalEvents: number;
  oldestEvent: number | null;
  newestEvent: number | null;
}> {
  try {
    const events = await getQueuedEvents();

    if (events.length === 0) {
      return {
        totalEvents: 0,
        oldestEvent: null,
        newestEvent: null,
      };
    }

    const timestamps = events.map((e) => e.timestamp);

    return {
      totalEvents: events.length,
      oldestEvent: Math.min(...timestamps),
      newestEvent: Math.max(...timestamps),
    };
  } catch (error) {
    console.error('[OfflineSync] Failed to get queue stats:', error);
    return {
      totalEvents: 0,
      oldestEvent: null,
      newestEvent: null,
    };
  }
}
