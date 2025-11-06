/**
 * Circuit Breaker types
 * Based on SPEC-error-handling.md SPEC-EH-RE-008:012
 */

/**
 * Circuit breaker states
 */
export enum CircuitState {
  /** Normal operation - requests pass through */
  CLOSED = 'CLOSED',
  /** Service failing - reject all requests */
  OPEN = 'OPEN',
  /** Testing recovery - allow limited requests */
  HALF_OPEN = 'HALF_OPEN'
}

/**
 * Circuit breaker configuration
 */
export interface CircuitBreakerConfig {
  /**
   * Circuit name (unique identifier)
   */
  name: string;

  /**
   * Number of consecutive failures before opening circuit
   * @default 5
   */
  failureThreshold?: number;

  /**
   * Error rate threshold (0-1) to open circuit
   * If error rate exceeds this in window, circuit opens
   * @default 0.5 (50%)
   */
  errorThresholdPercentage?: number;

  /**
   * Window size for calculating error rate (number of requests)
   * @default 10
   */
  windowSize?: number;

  /**
   * Time in ms to wait in open state before attempting half-open
   * @default 30000 (30 seconds)
   */
  timeout?: number;

  /**
   * Number of requests to allow through in half-open state
   * @default 1
   */
  halfOpenMaxRequests?: number;

  /**
   * Callback on state change
   */
  onStateChange?: (from: CircuitState, to: CircuitState) => void;

  /**
   * Custom error classifier - return true if error should count towards threshold
   * @default Only count server errors (5xx) and network errors
   */
  shouldCountError?: (error: Error) => boolean;
}

/**
 * Circuit breaker state snapshot
 */
export interface CircuitBreakerState {
  /** Current state */
  state: CircuitState;
  /** Number of consecutive failures */
  consecutiveFailures: number;
  /** Total requests in current window */
  totalRequests: number;
  /** Failed requests in current window */
  failedRequests: number;
  /** Error rate (0-1) */
  errorRate: number;
  /** Number of requests allowed in half-open state */
  halfOpenAttempts: number;
  /** Timestamp of last state change */
  lastStateChange: number;
  /** Timestamp when circuit will attempt half-open (if currently open) */
  nextAttempt?: number;
}

/**
 * Result of circuit breaker execution
 */
export interface CircuitBreakerResult<T> {
  /** Execution result value */
  value: T;
  /** State after execution */
  state: CircuitBreakerState;
  /** Whether circuit state changed */
  stateChanged: boolean;
}

/**
 * Circuit breaker error - thrown when circuit is open
 */
export class CircuitBreakerError extends Error {
  constructor(
    public circuitName: string,
    public state: CircuitState,
    public nextAttempt?: number
  ) {
    const message = state === CircuitState.OPEN
      ? `Circuit breaker '${circuitName}' is open. Next attempt at ${new Date(nextAttempt || 0).toISOString()}`
      : `Circuit breaker '${circuitName}' is in ${state} state and cannot accept more requests`;

    super(message);
    this.name = 'CircuitBreakerError';

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CircuitBreakerError);
    }
  }
}

/**
 * Type guard for CircuitBreakerError
 */
export function isCircuitBreakerError(error: unknown): error is CircuitBreakerError {
  return error instanceof CircuitBreakerError;
}
