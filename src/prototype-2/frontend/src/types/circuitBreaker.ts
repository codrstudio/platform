/**
 * Circuit Breaker types
 * Based on SPEC-error-handling.md SPEC-EH-RE-008:012
 */

export enum CircuitState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN'
}

export interface CircuitBreakerConfig {
  name: string;
  failureThreshold?: number;
  errorThresholdPercentage?: number;
  windowSize?: number;
  timeout?: number;
  halfOpenMaxRequests?: number;
  onStateChange?: (from: CircuitState, to: CircuitState) => void;
  shouldCountError?: (error: Error) => boolean;
}

export interface CircuitBreakerState {
  state: CircuitState;
  consecutiveFailures: number;
  totalRequests: number;
  failedRequests: number;
  errorRate: number;
  halfOpenAttempts: number;
  lastStateChange: number;
  nextAttempt?: number;
}

export interface CircuitBreakerResult<T> {
  value: T;
  state: CircuitBreakerState;
  stateChanged: boolean;
}

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

export function isCircuitBreakerError(error: unknown): error is CircuitBreakerError {
  return error instanceof CircuitBreakerError;
}
