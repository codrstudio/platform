import React, { Suspense } from 'react';
import { RouteLoading } from '../../components/loading';

interface RouteSuspenseProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  moduleName?: string;
  minDisplayTime?: number;
}

/**
 * Enhanced Suspense boundary for routes
 * Provides better UX with minimum display time and custom fallback
 */
export default function RouteSuspense({
  children,
  fallback,
  moduleName,
  minDisplayTime = 0
}: RouteSuspenseProps) {
  const defaultFallback = <RouteLoading moduleName={moduleName} />;

  // If minDisplayTime is 0, use standard Suspense
  if (minDisplayTime === 0) {
    return (
      <Suspense fallback={fallback || defaultFallback}>
        {children}
      </Suspense>
    );
  }

  // TODO: Implement minimum display time logic
  // For now, just use standard Suspense
  // Future: Use startTransition or custom hook
  return (
    <Suspense fallback={fallback || defaultFallback}>
      {children}
    </Suspense>
  );
}
