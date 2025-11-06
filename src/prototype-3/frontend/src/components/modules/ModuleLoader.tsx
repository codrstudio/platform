/**
 * ModuleLoader Component
 *
 * Component wrapper for lazy-loaded modules.
 * Shows loading skeleton while loading and error fallback on failure.
 *
 * References:
 * - SPEC-modules.md (SPEC-MO-LC-*, SPEC-MO-PE-*)
 * - SPEC-architecture.md (SPEC-A-LL-*)
 *
 * Story 1.5.3: Load modules dynamically
 */

import React from 'react';
import { useModuleLoader } from '../../hooks/useModuleLoader';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Button } from '../ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

/**
 * ModuleLoader Props
 */
export interface ModuleLoaderProps {
  /** Unique module identifier to load */
  moduleId: string;

  /** Children function that receives loaded module */
  children: (module: any) => React.ReactNode;

  /** Custom loading component (optional) */
  loading?: React.ReactNode;

  /** Custom error component (optional) */
  error?: (error: Error, retry: () => void) => React.ReactNode;
}

/**
 * Default loading skeleton
 * Simple animated skeleton for module loading state
 */
function DefaultLoadingSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-6">
      <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      <div className="h-32 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
    </div>
  );
}

/**
 * Default error fallback
 * User-friendly error display with retry button
 *
 * SPEC-MO-LC-004: Errors handled gracefully
 */
function DefaultErrorFallback({
  error,
  moduleId,
  onRetry,
}: {
  error: Error;
  moduleId: string;
  onRetry: () => void;
}) {
  return (
    <Alert variant="destructive" className="m-6">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Failed to load module</AlertTitle>
      <AlertDescription className="mt-2 space-y-2">
        <p>
          Module <code className="font-mono text-sm">{moduleId}</code> could not be loaded.
        </p>
        {import.meta.env.DEV && (
          <p className="text-xs font-mono bg-black/10 dark:bg-white/10 p-2 rounded">
            {error.message}
          </p>
        )}
        <Button
          variant="outline"
          onClick={onRetry}
          className="mt-2"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </AlertDescription>
    </Alert>
  );
}

/**
 * ModuleLoader - Component wrapper for lazy-loaded modules
 *
 * Features:
 * - Automatic module loading
 * - Loading skeleton display
 * - Error fallback with retry
 * - Customizable loading and error components
 * - Render prop pattern for module content
 *
 * SPEC-MO-LC-001: Module loaded when needed
 * SPEC-MO-LC-003: Asynchronous loading
 * SPEC-MO-LC-004: Graceful error handling
 * SPEC-A-LL-001: Lazy loading implementation
 *
 * @example
 * ```tsx
 * <ModuleLoader moduleId="setup">
 *   {(module) => (
 *     <SetupDashboard module={module} />
 *   )}
 * </ModuleLoader>
 * ```
 *
 * @example With custom loading
 * ```tsx
 * <ModuleLoader
 *   moduleId="chat"
 *   loading={<CustomSpinner />}
 * >
 *   {(module) => <ChatWindow module={module} />}
 * </ModuleLoader>
 * ```
 */
export function ModuleLoader({
  moduleId,
  children,
  loading,
  error: customError,
}: ModuleLoaderProps) {
  const { module, isLoading, error, retry } = useModuleLoader(moduleId);

  // Loading state
  if (isLoading) {
    return <>{loading || <DefaultLoadingSkeleton />}</>;
  }

  // Error state
  if (error) {
    if (customError) {
      return <>{customError(error, retry)}</>;
    }

    return (
      <DefaultErrorFallback
        error={error}
        moduleId={moduleId}
        onRetry={retry}
      />
    );
  }

  // Module not loaded yet (pending state)
  if (!module) {
    return <>{loading || <DefaultLoadingSkeleton />}</>;
  }

  // Render children with loaded module
  return <>{children(module)}</>;
}

/**
 * ModuleLoaderSuspense - Alternative using React.Suspense
 *
 * For use with React.lazy() components.
 * Provides consistent loading UI with ModuleLoader.
 *
 * @example
 * ```tsx
 * const LazySetupModule = React.lazy(() => import('@/modules/setup'));
 *
 * <ModuleLoaderSuspense>
 *   <LazySetupModule />
 * </ModuleLoaderSuspense>
 * ```
 */
export function ModuleLoaderSuspense({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  return (
    <React.Suspense fallback={fallback || <DefaultLoadingSkeleton />}>
      {children}
    </React.Suspense>
  );
}
