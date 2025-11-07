/**
 * Notifications Module - Main Export
 *
 * SPEC Compliance:
 * - SPEC-NOTIF-R-001: Interface para visualização de notificações
 * - SPEC-NOTIF-R-002: Consumo de eventos SSE
 * - SPEC-NOTIF-R-004: Persistência via JQEL
 */

import { notificationsManifest } from './manifest';
import routes from './routes';
import type { ModuleExports } from '@/types/module';

// Components
export * from './components';

// Pages
export { NotificationList } from './pages/NotificationList';

// Hooks
export { useNotifications, requestNotificationPermission } from './hooks/useNotifications';

// Types
export type {
  Notification,
  NotificationPriority,
  NotificationCategory,
  NotificationStatus,
  NotificationAction,
  NotificationFilters,
  NotificationModuleConfig
} from './types';

// Module Exports
export const notificationsModule: ModuleExports = {
  manifest: notificationsManifest,
  routes
};

// Auto-register module on import
import { moduleRegistry } from '@/core/modules';

moduleRegistry.register(notificationsModule);
