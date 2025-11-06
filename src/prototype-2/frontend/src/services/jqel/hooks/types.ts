import type { UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type { JQELError } from '../errors';

/**
 * Retry configuration for JQEL queries
 * Based on SPEC-DA-ERR-004:005
 */
export interface RetryConfig {
  /**
   * Maximum number of retry attempts
   * @default 3
   */
  maxAttempts?: number;

  /**
   * Base delay in milliseconds for exponential backoff
   * @default 1000 (1 second)
   */
  baseDelayMs?: number;

  /**
   * Maximum delay cap in milliseconds
   * @default 30000 (30 seconds)
   */
  maxDelayMs?: number;
}

/**
 * Options for useJQELQuery hook
 * Extends TanStack Query UseQueryOptions with sensible defaults
 * Based on SPEC-DA-TQ-010:013
 */
export interface UseJQELQueryOptions<T>
  extends Omit<UseQueryOptions<T[], JQELError>, 'queryKey' | 'queryFn'> {

  /**
   * Enable/disable query execution
   * Useful for dependent queries
   * @default true
   */
  enabled?: boolean;

  /**
   * Time in ms before data is considered stale
   * @default 5 * 60 * 1000 (5 minutes)
   */
  staleTime?: number;

  /**
   * Time in ms before unused cache is garbage collected
   * @default 10 * 60 * 1000 (10 minutes)
   */
  gcTime?: number;

  /**
   * Retry failed queries
   * @default Smart retry (don't retry 4xx, retry 5xx up to 3 times)
   */
  retry?: boolean | number | ((failureCount: number, error: JQELError) => boolean);

  /**
   * Retry configuration (overrides defaults)
   * Set to false to disable retries
   */
  retryConfig?: RetryConfig | false;

  /**
   * Refetch when window regains focus
   * @default false
   */
  refetchOnWindowFocus?: boolean;

  /**
   * Refetch when component mounts
   * @default true
   */
  refetchOnMount?: boolean | 'always';

  /**
   * Transform data before returning to component
   * Useful for extracting single record from array
   */
  select?: (data: T[]) => any;

  /**
   * Custom query key override
   */
  queryKey?: readonly unknown[];
}

/**
 * Result type for useJQELQuery hook
 * Simplified interface exposing most common properties
 */
export interface UseJQELQueryResult<T> {
  /**
   * Query data (null if not loaded)
   */
  data: T | null;

  /**
   * Loading for the first time (no cached data)
   */
  isLoading: boolean;

  /**
   * Query is currently fetching (includes background refetch)
   */
  isFetching: boolean;

  /**
   * Error object if query failed
   */
  error: JQELError | null;

  /**
   * Manually trigger refetch
   */
  refetch: () => Promise<UseQueryResult<T[], JQELError>>;

  /**
   * Query succeeded at least once
   */
  isSuccess: boolean;

  /**
   * Query failed
   */
  isError: boolean;

  /**
   * No cached data exists yet
   */
  isPending: boolean;
}

/**
 * Configuration for single query in useJQELQueries
 */
export interface JQELQueryConfig<T> {
  /**
   * JQEL query object
   */
  query: any; // JQELQuery type

  /**
   * Query options (same as useJQELQuery)
   */
  options?: UseJQELQueryOptions<T>;
}
