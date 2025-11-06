import type { TaskEventType, TaskEventParams, TaskEventPayload } from '../types/job.types.js';
import type { TaskEventData } from '../types/events.types.js';

/**
 * Task Event Helper Functions
 *
 * Utilities for constructing, validating, and formatting task events.
 *
 * SPEC References:
 * - SPEC-EV-PL-001:012: Event payload structure
 * - SPEC-EV-PL-009:012: Payload size and content restrictions
 */

/**
 * Generate unique event ID
 *
 * Format: evt_<timestamp>_<random6chars>
 * Example: evt_1730808600000_a4f2e9
 */
export function generateEventId(prefix: string = 'evt'): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}_${timestamp}_${random}`;
}

/**
 * Validate and normalize progress value
 *
 * Ensures progress is integer between 0-100.
 *
 * @param progress - Raw progress value
 * @returns Clamped integer 0-100
 * @throws Error if progress is NaN
 */
export function validateProgress(progress: number): number {
  if (isNaN(progress)) {
    throw new Error('Progress must be a number');
  }

  // Clamp to 0-100 and round to integer
  return Math.min(100, Math.max(0, Math.round(progress)));
}

/**
 * Create ISO 8601 timestamp
 *
 * @returns Current timestamp in ISO 8601 format
 */
export function createTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Validate required task event parameters
 *
 * @param params - Event parameters to validate
 * @throws Error if required fields missing or invalid
 */
export function validateTaskEventParams(params: any): void {
  if (!params) {
    throw new Error('Task event parameters are required');
  }

  if (!params.jobId || typeof params.jobId !== 'string') {
    throw new Error('jobId is required and must be a string');
  }

  if (!params.userId || typeof params.userId !== 'string') {
    throw new Error('userId is required and must be a string');
  }

  if (!params.queueName || typeof params.queueName !== 'string') {
    throw new Error('queueName is required and must be a string');
  }

  // Validate priority if provided
  if (params.priority) {
    const validPriorities = ['low', 'normal', 'high', 'urgent'];
    if (!validPriorities.includes(params.priority)) {
      throw new Error(`Invalid priority: ${params.priority}. Must be one of: ${validPriorities.join(', ')}`);
    }
  }
}

/**
 * Map event type to job status
 */
function getStatusForEventType(type: TaskEventType): string {
  switch (type) {
    case 'job-started':
      return 'running';
    case 'job-progress':
      return 'running';
    case 'job-completed':
      return 'completed';
    case 'job-failed':
      return 'failed';
    case 'job-cancelled':
      return 'cancelled';
    default:
      return 'pending';
  }
}

/**
 * Build complete task event payload
 *
 * Constructs fully-formed event ready for Redis publishing.
 *
 * @param type - Task event type
 * @param params - Event parameters
 * @returns Complete task event payload
 */
export function buildTaskEvent(type: TaskEventType, params: TaskEventParams): TaskEventPayload {
  // Validate required fields
  validateTaskEventParams(params);

  // Extract base fields
  const { jobId, userId, queueName, category, priority, metadata, ...rest } = params;

  // Build data object based on event type
  const data: TaskEventData = {
    jobId,
    queueName,
    status: getStatusForEventType(type) as any,
    metadata,
    ...rest, // Include type-specific fields (progress, error, result, etc.)
  };

  // Validate progress if present
  if ('progress' in rest && typeof rest.progress === 'number') {
    data.progress = validateProgress(rest.progress);
  }

  // Build complete payload
  const payload: TaskEventPayload = {
    type,
    id: generateEventId(),
    userId,
    timestamp: createTimestamp(),
    category,
    priority: priority || 'normal',
    data,
  };

  return payload;
}

/**
 * Calculate estimated completion time
 *
 * @param startTime - Job start time (ISO 8601)
 * @param progress - Current progress (0-100)
 * @returns Estimated completion time (ISO 8601) or null if not calculable
 */
export function calculateEstimatedCompletion(startTime: string, progress: number): string | null {
  if (progress === 0) return null;

  const start = new Date(startTime).getTime();
  const now = Date.now();
  const elapsed = now - start;

  // Calculate estimated total duration based on progress
  const estimatedTotal = (elapsed / progress) * 100;
  const estimatedCompletion = start + estimatedTotal;

  return new Date(estimatedCompletion).toISOString();
}

/**
 * Sanitize error for event payload
 *
 * Removes sensitive information and limits size.
 *
 * @param error - Error object or message
 * @returns Sanitized error string
 */
export function sanitizeError(error: any): string {
  if (typeof error === 'string') {
    return error.substring(0, 500); // Limit to 500 chars
  }

  if (error instanceof Error) {
    return error.message.substring(0, 500);
  }

  return String(error).substring(0, 500);
}
