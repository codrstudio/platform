import { redisService } from './redis.service.js';
import { EVENT_CHANNELS } from '../types/events.types.js';
import { buildTaskEvent, sanitizeError } from '../utils/taskEventHelpers.js';
import type {
  TaskStartedParams,
  TaskProgressParams,
  TaskCompletedParams,
  TaskFailedParams,
  TaskCancelledParams,
  TaskEventPayload,
} from '../types/job.types.js';

/**
 * Task Events Service
 *
 * Publishes task lifecycle events to Redis Pub/Sub for SSE delivery.
 *
 * Features:
 * - Type-safe event construction
 * - Automatic validation and sanitization
 * - Best-effort delivery (errors logged, not thrown)
 * - Integration with existing SSE event system
 *
 * SPEC References:
 * - SPEC-EV-CO-009:013: Task event requirements
 * - SPEC-EV-QUEUE-001:011: Queue event integration
 * - SPEC-EV-PS-009:012: Pub/Sub publishing
 * - SPEC-EV-PL-001:017: Event payload structure
 *
 * USAGE EXAMPLES
 *
 * === In n8n Workflow ===
 *
 * Use Function node with this code:
 *
 * ```javascript
 * // Import (if available in n8n environment)
 * const { taskEventsService } = require('./services');
 *
 * // Or use direct Redis client in n8n
 * const Redis = require('ioredis');
 * const redis = new Redis(process.env.REDIS_URL);
 *
 * // Publish job started
 * const event = {
 *   type: 'job-started',
 *   id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
 *   userId: $json.userId,
 *   timestamp: new Date().toISOString(),
 *   category: 'email_processing',
 *   priority: 'normal',
 *   data: {
 *     jobId: $json.jobId,
 *     queueName: 'email-queue',
 *     status: 'running'
 *   }
 * };
 *
 * await redis.publish('platform:tasks', JSON.stringify(event));
 * return event;
 * ```
 *
 * === In Backend Worker ===
 *
 * ```typescript
 * import { taskEventsService } from './services';
 *
 * // Job started
 * await taskEventsService.publishTaskStarted({
 *   jobId: job.id,
 *   userId: job.userId,
 *   queueName: 'file-processing',
 *   category: 'data_import',
 *   priority: 'high',
 *   metadata: { filename: job.data.filename }
 * });
 *
 * // Job progress (25%)
 * await taskEventsService.publishTaskProgress({
 *   jobId: job.id,
 *   userId: job.userId,
 *   queueName: 'file-processing',
 *   progress: 25,
 *   message: 'Validating data format...',
 *   currentStep: '1/4'
 * });
 *
 * // Job completed
 * await taskEventsService.publishTaskCompleted({
 *   jobId: job.id,
 *   userId: job.userId,
 *   queueName: 'file-processing',
 *   category: 'data_import',
 *   result: { rowsImported: 1500, errors: 0 },
 *   duration: 120
 * });
 *
 * // OR Job failed
 * await taskEventsService.publishTaskFailed({
 *   jobId: job.id,
 *   userId: job.userId,
 *   queueName: 'file-processing',
 *   category: 'data_import',
 *   error: 'Invalid data format in row 42',
 *   errorCode: 'VALIDATION_ERROR',
 *   retryable: true,
 *   retryCount: job.attemptsMade
 * });
 * ```
 *
 * === Event Flow ===
 *
 * 1. Worker/n8n publishes event → Redis Pub/Sub (platform:tasks)
 * 2. SSEService receives → stores in Redis Stream (events:<userId>)
 * 3. SSEService sends to connected user via SSE
 * 4. Frontend receives → invalidates cache → fetches full data via JQEL
 * 5. UI updates with progress/status
 */
export class TaskEventsService {
  /**
   * Publish job started event
   *
   * Notifies user that an asynchronous job has begun execution.
   *
   * @param params - Job start parameters
   *
   * @example
   * await taskEventsService.publishTaskStarted({
   *   jobId: 'job_123',
   *   userId: 'user_456',
   *   queueName: 'file-processing',
   *   category: 'file_upload',
   *   priority: 'normal',
   *   metadata: { filename: 'data.csv', size: 1048576 }
   * });
   */
  async publishTaskStarted(params: TaskStartedParams): Promise<void> {
    try {
      const event = buildTaskEvent('job-started', params);
      await this.publish(event);
      console.log(`✅ Task started event published: ${params.jobId}`);
    } catch (error) {
      console.error(`❌ Failed to publish task started event:`, { params, error });
      // Do not throw - event publishing is best-effort
    }
  }

  /**
   * Publish job progress event
   *
   * Updates user on job execution progress (0-100%).
   *
   * @param params - Job progress parameters
   *
   * @example
   * await taskEventsService.publishTaskProgress({
   *   jobId: 'job_123',
   *   userId: 'user_456',
   *   queueName: 'file-processing',
   *   progress: 45,
   *   message: 'Processing rows 450/1000',
   *   currentStep: 'Validating data'
   * });
   */
  async publishTaskProgress(params: TaskProgressParams): Promise<void> {
    try {
      const event = buildTaskEvent('job-progress', params);
      await this.publish(event);
      console.log(`ℹ️  Task progress event published: ${params.jobId} (${params.progress}%)`);
    } catch (error) {
      console.error(`❌ Failed to publish task progress event:`, { params, error });
      // Do not throw - event publishing is best-effort
    }
  }

  /**
   * Publish job completed event
   *
   * Notifies user that job finished successfully.
   *
   * @param params - Job completion parameters
   *
   * @example
   * await taskEventsService.publishTaskCompleted({
   *   jobId: 'job_123',
   *   userId: 'user_456',
   *   queueName: 'file-processing',
   *   category: 'file_upload',
   *   result: { rowsProcessed: 1000, errors: 0 },
   *   duration: 45
   * });
   */
  async publishTaskCompleted(params: TaskCompletedParams): Promise<void> {
    try {
      const event = buildTaskEvent('job-completed', params);
      await this.publish(event);
      console.log(`✅ Task completed event published: ${params.jobId}`);
    } catch (error) {
      console.error(`❌ Failed to publish task completed event:`, { params, error });
      // Do not throw - event publishing is best-effort
    }
  }

  /**
   * Publish job failed event
   *
   * Notifies user that job failed with error details.
   *
   * @param params - Job failure parameters
   *
   * @example
   * await taskEventsService.publishTaskFailed({
   *   jobId: 'job_123',
   *   userId: 'user_456',
   *   queueName: 'file-processing',
   *   category: 'file_upload',
   *   error: 'Invalid CSV format: missing header row',
   *   errorCode: 'INVALID_FORMAT',
   *   retryable: true
   * });
   */
  async publishTaskFailed(params: TaskFailedParams): Promise<void> {
    try {
      // Sanitize error message
      const sanitizedParams = {
        ...params,
        error: sanitizeError(params.error),
      };

      const event = buildTaskEvent('job-failed', sanitizedParams);
      await this.publish(event);
      console.log(`❌ Task failed event published: ${params.jobId}`);
    } catch (error) {
      console.error(`❌ Failed to publish task failed event:`, { params, error });
      // Do not throw - event publishing is best-effort
    }
  }

  /**
   * Publish job cancelled event
   *
   * Notifies user that job was cancelled (by user or system).
   *
   * @param params - Job cancellation parameters
   *
   * @example
   * await taskEventsService.publishTaskCancelled({
   *   jobId: 'job_123',
   *   userId: 'user_456',
   *   queueName: 'file-processing',
   *   reason: 'User requested cancellation',
   *   cancelledBy: 'user'
   * });
   */
  async publishTaskCancelled(params: TaskCancelledParams): Promise<void> {
    try {
      const event = buildTaskEvent('job-cancelled', params);
      await this.publish(event);
      console.log(`ℹ️  Task cancelled event published: ${params.jobId}`);
    } catch (error) {
      console.error(`❌ Failed to publish task cancelled event:`, { params, error });
      // Do not throw - event publishing is best-effort
    }
  }

  /**
   * Publish event to Redis Pub/Sub
   *
   * Internal method - publishes to platform:tasks channel.
   * SSE service listens to this channel and routes to connected users.
   *
   * SPEC-EV-PS-007: Type-specific channel platform:tasks
   * SPEC-EV-PS-010: Message must be JSON
   * SPEC-EV-PS-011: Publishing must be async (non-blocking)
   *
   * @param event - Complete task event payload
   */
  private async publish(event: TaskEventPayload): Promise<void> {
    try {
      // Publish to task-specific channel
      // SPEC-EV-PS-007: platform:tasks channel
      const subscriberCount = await redisService.publish(EVENT_CHANNELS.TASKS, event);

      console.log(`ℹ️  Published ${event.type} to ${EVENT_CHANNELS.TASKS}: ${subscriberCount} subscribers`);
    } catch (error: any) {
      console.error(`❌ Redis publish failed:`, {
        eventType: event.type,
        eventId: event.id,
        error: error.message,
      });

      // SPEC-EV-PS-012: Error in publication should not interrupt workflow
      // Log and continue - do not throw
    }
  }
}

// Export singleton instance
export const taskEventsService = new TaskEventsService();
