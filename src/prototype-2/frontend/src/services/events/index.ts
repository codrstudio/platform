/**
 * Events Service Public API
 */

export { sseClient, SSEClient } from './sseClient';
export {
  registerHandler,
  registerWildcardHandler,
  dispatchEvent,
  clearHandlers,
  getHandlerCount
} from './eventHandlers';
export { handleNotification, initNotificationHandler } from './notificationHandler';
export { handleTask, initTaskHandler } from './taskHandler';
export { initializeEventHandlers } from './initHandlers';
