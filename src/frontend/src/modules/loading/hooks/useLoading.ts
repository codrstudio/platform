/**
 * useLoading Hook
 *
 * Hook for managing loading states.
 *
 * SPEC Compliance: SPEC-LOAD-*
 */

import { useState, useCallback } from 'react';
import type { LoadingState } from '../types';

/**
 * useLoading Hook
 *
 * Manages loading state with helper functions.
 *
 * Usage:
 * ```tsx
 * const { isLoading, setLoading, withLoading } = useLoading();
 *
 * // Manual control
 * const handleClick = async () => {
 *   setLoading(true);
 *   await doSomething();
 *   setLoading(false);
 * };
 *
 * // Automatic control
 * const handleClick = () => {
 *   withLoading(async () => {
 *     await doSomething();
 *   });
 * };
 * ```
 */
export function useLoading(initialState = false): LoadingState {
  const [isLoading, setIsLoading] = useState(initialState);

  const setLoading = useCallback((loading: boolean) => {
    setIsLoading(loading);
  }, []);

  const withLoading = useCallback(async <T,>(promise: Promise<T>): Promise<T> => {
    setIsLoading(true);
    try {
      const result = await promise;
      return result;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    setLoading,
    withLoading
  };
}
