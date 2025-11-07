/**
 * Notification Types
 *
 * SPEC Compliance:
 * - SPEC-NOTIF-D-001: Estrutura de notificação
 * - SPEC-NOTIF-T-001: Categorias de notificação
 * - SPEC-NOTIF-T-002: Prioridades
 */

/**
 * Notification Priority
 * SPEC-NOTIF-T-002
 */
export type NotificationPriority = 'low' | 'normal' | 'high';

/**
 * Notification Category
 * SPEC-NOTIF-T-001
 */
export type NotificationCategory =
  | 'system_info'
  | 'batch_processing'
  | 'user_action'
  | 'milestone'
  | 'alert'
  | string; // Allow custom categories

/**
 * Notification Status
 */
export type NotificationStatus = 'unread' | 'read' | 'archived';

/**
 * Notification Data Structure
 * SPEC-NOTIF-D-001
 */
export interface Notification {
  id: string;
  userId: string;
  type: 'notification';
  category: NotificationCategory;
  priority: NotificationPriority;
  timestamp: string; // ISO 8601
  read: boolean;
  readAt?: string; // ISO 8601
  archived?: boolean;
  archivedAt?: string; // ISO 8601
  data: {
    title?: string;
    message?: string;
    icon?: string;
    url?: string;
    actions?: NotificationAction[];
    [key: string]: unknown;
  };
}

/**
 * Notification Action (Inline Actions)
 * SPEC-NOTIF-O-017 to SPEC-NOTIF-O-019
 */
export interface NotificationAction {
  id: string;
  label: string;
  variant?: 'default' | 'primary' | 'destructive';
  action: {
    type: 'jqel' | 'navigation' | 'agent';
    payload: unknown;
  };
}

/**
 * Notification Filter Options
 */
export interface NotificationFilters {
  category?: NotificationCategory | NotificationCategory[];
  priority?: NotificationPriority | NotificationPriority[];
  status?: NotificationStatus;
  startDate?: string;
  endDate?: string;
  search?: string;
}

/**
 * Notification Module Configuration
 */
export interface NotificationModuleConfig {
  dataSource: {
    schema: string;
    entity: string;
  };
  ui: {
    dropdownLimit: number;
    pageSize: number;
    showToast: boolean;
    toastDuration: number;
    playSound: boolean;
    soundFile: string;
    enableBrowserNotifications: boolean;
  };
  features: {
    enableSearch: boolean;
    enableFilters: boolean;
    enableGrouping: boolean;
    enableArchive: boolean;
    enableInlineActions: boolean;
  };
}
