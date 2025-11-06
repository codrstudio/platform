/**
 * Job Type Definitions
 *
 * SPEC References:
 * - SPEC-EV-CO-009:013: Task events and lifecycle
 * - SPEC-EV-QUEUE-001:011: Queue event integration
 */

import type { TaskEventData } from './events.types.js';

// Job execution status
export type JobStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

// Job metadata
export interface JobMetadata {
  jobId: string;
  queueName: string;
  userId: string;
  startTime?: string; // ISO 8601
  endTime?: string;   // ISO 8601
}

// Task event type discriminator
export type TaskEventType =
  | 'job-started'
  | 'job-progress'
  | 'job-completed'
  | 'job-failed'
  | 'job-cancelled';

// Base parameters for all task events
export interface BaseTaskParams {
  jobId: string;
  userId: string;
  queueName: string;
  category?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  metadata?: Record<string, any>;
}

// Task started event parameters
export interface TaskStartedParams extends BaseTaskParams {
  estimatedDuration?: number; // seconds
}

// Task progress event parameters
export interface TaskProgressParams extends BaseTaskParams {
  progress: number; // 0-100
  message?: string; // Human-readable status
  currentStep?: string; // "Processing file 2 of 10"
}

// Task completed event parameters
export interface TaskCompletedParams extends BaseTaskParams {
  result?: any; // Keep minimal - full result via JQEL
  duration?: number; // seconds
}

// Task failed event parameters
export interface TaskFailedParams extends BaseTaskParams {
  error: string; // Error message
  errorCode?: string; // Machine-readable error code
  retryable?: boolean; // Can job be retried?
  retryCount?: number; // Number of retries attempted
  stack?: string; // Stack trace (for debugging, not shown to user)
}

// Task cancelled event parameters
export interface TaskCancelledParams extends BaseTaskParams {
  reason?: string; // Cancellation reason
  cancelledBy?: 'user' | 'system' | 'timeout';
}

// Union type for all task event parameters
export type TaskEventParams =
  | TaskStartedParams
  | TaskProgressParams
  | TaskCompletedParams
  | TaskFailedParams
  | TaskCancelledParams;

// Complete task event payload (published to Redis)
export interface TaskEventPayload {
  type: TaskEventType;
  id: string;
  userId: string;
  timestamp: string; // ISO 8601
  category?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  data: TaskEventData;
}
