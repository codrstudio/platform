import { redisService } from './redis.service.js';
import type { NotificationEvent } from '../types/events.types.js';
import type { NotificationValidation } from '../types/notification.types.js';

/**
 * NotificationService
 *
 * Creates and publishes notification events to Redis.
 *
 * Responsibilities:
 * - Validate notification payloads
 * - Generate unique IDs
 * - Publish to Redis Pub/Sub
 * - Does NOT handle delivery (SSE service does this)
 * - Does NOT store in Streams (SSE service does this)
 *
 * SPEC References:
 * - SPEC-EV-CO-005:008: Notification concepts
 * - SPEC-EV-PL-001:012: Event payload structure
 * - SPEC-EV-PS-007: platform:notifications channel
 */
export class NotificationService {
  private readonly CHANNEL = 'platform:notifications';

  /**
   * Publish notification to Redis Pub/Sub
   *
   * SPEC-EV-PS-007: Publish to platform:notifications channel
   * SPEC-EV-AR-003:004: Events contain only minimal metadata
   *
   * @param notification - Notification event to publish
   * @returns Number of subscribers that received the notification
   * @throws Error if validation fails or publishing fails
   */
  async publish(notification: NotificationEvent): Promise<number> {
    // Validate notification
    const validation = this.validate(notification);
    if (!validation.valid) {
      throw new Error(`Invalid notification: ${validation.errors.join(', ')}`);
    }

    // Ensure ID exists (generate if missing)
    if (!notification.id) {
      notification.id = this.generateId();
    }

    // Ensure timestamp exists (generate if missing)
    if (!notification.timestamp) {
      notification.timestamp = new Date().toISOString();
    }

    try {
      // Publish to Redis Pub/Sub
      // SSE service will receive via subscription and handle delivery + storage
      const subscriberCount = await redisService.publish(this.CHANNEL, notification);

      console.log(
        `✅ Notification published: ${notification.id} (${subscriberCount} subscribers)`
      );

      return subscriberCount;
    } catch (error: any) {
      console.error('❌ Failed to publish notification:', {
        notificationId: notification.id,
        userId: notification.userId,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Publish notification to specific user (convenience method)
   *
   * @param userId - Target user ID
   * @param notification - Notification without userId
   * @returns Number of subscribers
   */
  async publishToUser(
    userId: string,
    notification: Omit<NotificationEvent, 'userId' | 'type'>
  ): Promise<number> {
    return this.publish({
      ...notification,
      type: 'notification',
      userId,
    } as NotificationEvent);
  }

  /**
   * Publish notification to multiple users (broadcast)
   *
   * @param userIds - Array of target user IDs
   * @param notification - Notification template
   * @returns Array of subscriber counts per user
   */
  async publishToUsers(
    userIds: string[],
    notification: Omit<NotificationEvent, 'userId' | 'type'>
  ): Promise<number[]> {
    const results = await Promise.all(
      userIds.map((userId) => this.publishToUser(userId, notification))
    );

    console.log(`✅ Notification broadcast to ${userIds.length} users`);

    return results;
  }

  /**
   * Validate notification payload
   *
   * SPEC-EV-PL-001:008: Required fields validation
   *
   * @param notification - Notification to validate
   * @returns Validation result with errors
   */
  validate(notification: Partial<NotificationEvent>): NotificationValidation {
    const errors: string[] = [];

    // SPEC-EV-PL-002: Must have type field
    if (!notification.type) {
      errors.push('Missing required field: type');
    } else if (notification.type !== 'notification') {
      errors.push(`Invalid type: expected 'notification', got '${notification.type}'`);
    }

    // SPEC-EV-PL-004: Must have userId or userIds
    if (!notification.userId && !notification.userIds) {
      errors.push('Missing required field: userId or userIds');
    }

    // Validate category if provided
    if (notification.category) {
      const validCategories = ['system', 'info', 'success', 'warning', 'error'];
      if (!validCategories.includes(notification.category)) {
        errors.push(`Invalid category: ${notification.category}`);
      }
    }

    // Validate priority if provided
    if (notification.priority) {
      const validPriorities = ['low', 'normal', 'high', 'urgent'];
      if (!validPriorities.includes(notification.priority)) {
        errors.push(`Invalid priority: ${notification.priority}`);
      }
    }

    // Validate timestamp format if provided
    if (notification.timestamp && !this.isValidISODate(notification.timestamp)) {
      errors.push(`Invalid timestamp format: ${notification.timestamp} (must be ISO 8601)`);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Generate unique notification ID
   *
   * Uses timestamp + random suffix for uniqueness.
   * Format: notif_<timestamp>_<random>
   *
   * @returns Unique notification ID
   */
  private generateId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `notif_${timestamp}_${random}`;
  }

  /**
   * Validate ISO 8601 date string
   *
   * @param dateString - Date string to validate
   * @returns True if valid ISO 8601 format
   */
  private isValidISODate(dateString: string): boolean {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
