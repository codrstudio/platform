/**
 * Notification Type Definitions
 *
 * Extended types for notification creation and validation.
 */

/**
 * Notification severity levels
 *
 * Controls display urgency in frontend:
 * - low: Background notification, minimal UI
 * - normal: Standard toast/badge
 * - high: Prominent toast, sound/vibration
 * - critical: Modal dialog, requires acknowledgment
 */
export type NotificationSeverity = 'low' | 'normal' | 'high' | 'critical';

/**
 * Notification category
 *
 * Controls visual styling (color, icon):
 * - system: Platform/system events (blue)
 * - info: Informational messages (blue)
 * - success: Successful operations (green)
 * - warning: Warnings/cautions (yellow)
 * - error: Errors/failures (red)
 */
export type NotificationCategory = 'system' | 'info' | 'success' | 'warning' | 'error';

/**
 * Options for creating notifications
 */
export interface CreateNotificationOptions {
  userId: string; // Target user ID
  title?: string; // Short title (e.g., "Email Sent")
  message: string; // Notification message body
  category?: NotificationCategory; // Visual category (default: 'info')
  severity?: NotificationSeverity; // Display urgency (default: 'normal')
  priority?: 'low' | 'normal' | 'high' | 'urgent'; // Event priority (SPEC-EV-PL-007)
  actionUrl?: string; // Optional click-through URL
  iconName?: string; // Optional Lucide icon name
  metadata?: Record<string, any>; // Additional metadata
}

/**
 * Notification validation result
 */
export interface NotificationValidation {
  valid: boolean;
  errors: string[];
}
