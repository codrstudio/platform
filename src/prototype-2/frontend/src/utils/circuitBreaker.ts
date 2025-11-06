/**
 * Circuit Breaker implementation
 * Based on SPEC-EH-RE-008:012
 */

import {
  CircuitState,
  CircuitBreakerError,
  type CircuitBreakerConfig,
  type CircuitBreakerState,
  type CircuitBreakerResult
} from '../types/circuitBreaker';
import { classifyError } from './retry';

const DEFAULT_CONFIG: Required<Omit<CircuitBreakerConfig, 'name' | 'onStateChange' | 'shouldCountError'>> = {
  failureThreshold: 5,
  errorThresholdPercentage: 0.5,
  windowSize: 10,
  timeout: 30000,
  halfOpenMaxRequests: 1,
};

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private consecutiveFailures = 0;
  private requestWindow: boolean[] = [];
  private halfOpenAttempts = 0;
  private lastStateChange = Date.now();
  private nextAttemptTime?: number;
  private openTimeout?: number;
  private readonly config: typeof DEFAULT_CONFIG & {
    onStateChange?: (from: CircuitState, to: CircuitState) => void;
    shouldCountError?: (error: Error) => boolean;
  };

  constructor(
    public readonly name: string,
    userConfig: Omit<CircuitBreakerConfig, 'name'> = {}
  ) {
    this.config = {
      ...DEFAULT_CONFIG,
      onStateChange: userConfig.onStateChange,
      shouldCountError: userConfig.shouldCountError
    };
  }

  getState(): CircuitBreakerState {
    const failedRequests = this.requestWindow.filter(r => !r).length;
    const totalRequests = this.requestWindow.length;
    const errorRate = totalRequests > 0 ? failedRequests / totalRequests : 0;

    return {
      state: this.state,
      consecutiveFailures: this.consecutiveFailures,
      totalRequests,
      failedRequests,
      errorRate,
      halfOpenAttempts: this.halfOpenAttempts,
      lastStateChange: this.lastStateChange,
      nextAttempt: this.nextAttemptTime
    };
  }

  private shouldCountError(error: Error): boolean {
    if (this.config.shouldCountError) {
      return this.config.shouldCountError(error);
    }
    const errorType = classifyError(error);
    return errorType === 'server' || errorType === 'network';
  }

  private transitionTo(newState: CircuitState): void {
    const oldState = this.state;
    if (oldState === newState) return;

    this.state = newState;
    this.lastStateChange = Date.now();

    if (import.meta.env.DEV) {
      console.log(`[CircuitBreaker:${this.name}] ${oldState} → ${newState}`);
    }

    if (oldState === CircuitState.OPEN && this.openTimeout) {
      clearTimeout(this.openTimeout);
      this.openTimeout = undefined;
      this.nextAttemptTime = undefined;
    }

    if (newState === CircuitState.OPEN) {
      this.nextAttemptTime = Date.now() + this.config.timeout;
      this.openTimeout = setTimeout(() => {
        this.transitionTo(CircuitState.HALF_OPEN);
      }, this.config.timeout) as unknown as number;
    }

    if (newState === CircuitState.CLOSED) {
      this.consecutiveFailures = 0;
      this.requestWindow = [];
      this.halfOpenAttempts = 0;
    } else if (newState === CircuitState.HALF_OPEN) {
      this.halfOpenAttempts = 0;
    }

    this.config.onStateChange?.(oldState, newState);
  }

  private recordSuccess(): void {
    this.consecutiveFailures = 0;
    this.requestWindow.push(true);
    if (this.requestWindow.length > this.config.windowSize) {
      this.requestWindow.shift();
    }
    if (this.state === CircuitState.HALF_OPEN) {
      this.transitionTo(CircuitState.CLOSED);
    }
  }

  private recordFailure(error: Error): void {
    if (!this.shouldCountError(error)) return;

    this.consecutiveFailures++;
    this.requestWindow.push(false);
    if (this.requestWindow.length > this.config.windowSize) {
      this.requestWindow.shift();
    }

    const failedRequests = this.requestWindow.filter(r => !r).length;
    const errorRate = this.requestWindow.length > 0 ? failedRequests / this.requestWindow.length : 0;
    const exceedsConsecutive = this.consecutiveFailures >= this.config.failureThreshold;
    const exceedsRate = this.requestWindow.length >= this.config.windowSize &&
                        errorRate >= this.config.errorThresholdPercentage;

    if (this.state === CircuitState.CLOSED) {
      if (exceedsConsecutive || exceedsRate) {
        this.transitionTo(CircuitState.OPEN);
      }
    } else if (this.state === CircuitState.HALF_OPEN) {
      this.transitionTo(CircuitState.OPEN);
    }
  }

  async execute<T>(operation: () => Promise<T>): Promise<CircuitBreakerResult<T>> {
    const initialState = this.state;

    if (this.state === CircuitState.OPEN) {
      throw new CircuitBreakerError(this.name, this.state, this.nextAttemptTime);
    }

    if (this.state === CircuitState.HALF_OPEN) {
      if (this.halfOpenAttempts >= this.config.halfOpenMaxRequests) {
        throw new CircuitBreakerError(this.name, this.state);
      }
      this.halfOpenAttempts++;
    }

    try {
      const value = await operation();
      this.recordSuccess();
      return {
        value,
        state: this.getState(),
        stateChanged: this.state !== initialState
      };
    } catch (error) {
      this.recordFailure(error as Error);
      throw error;
    }
  }

  reset(): void {
    this.transitionTo(CircuitState.CLOSED);
  }

  destroy(): void {
    if (this.openTimeout) {
      clearTimeout(this.openTimeout);
      this.openTimeout = undefined;
    }
  }
}
