/**
 * Page Skeleton Loader
 *
 * Skeleton loader for lazy-loaded page components.
 * Provides visual feedback during code splitting load times.
 */

/**
 * Page Skeleton Component
 *
 * Generic skeleton loader for pages being lazy loaded.
 * Used as Suspense fallback for React.lazy() components.
 */
export function PageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 p-8 animate-pulse">
      {/* Header skeleton */}
      <div className="max-w-4xl mx-auto">
        <div className="h-10 bg-gray-200 rounded w-1/3 mb-6"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3 mb-8"></div>

        {/* Content skeleton */}
        <div className="space-y-4">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 rounded w-4/6"></div>
        </div>

        {/* Additional content blocks */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  );
}

/**
 * Portal Skeleton Component
 *
 * Skeleton specifically for portal root components.
 * Used during initial portal load.
 */
export function PortalSkeleton() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        {/* Spinner */}
        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-gray-300 border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite] mb-4" />

        {/* Loading text skeleton */}
        <div className="h-6 bg-gray-200 rounded w-48 mx-auto mb-2 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-32 mx-auto animate-pulse"></div>
      </div>
    </div>
  );
}

/**
 * Module Skeleton Component
 *
 * Skeleton for lazy-loaded module components.
 * Lighter than portal skeleton for faster perceived performance.
 */
export function ModuleSkeleton() {
  return (
    <div className="p-8 animate-pulse">
      <div className="max-w-6xl mx-auto">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-48 bg-gray-200 rounded"></div>
          <div className="h-48 bg-gray-200 rounded"></div>
          <div className="h-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  );
}

/**
 * Minimal Loading Indicator
 *
 * Minimal spinner for quick transitions.
 * Use when loading is expected to be very fast.
 */
export function MinimalLoader() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-solid border-gray-400 border-r-transparent" />
    </div>
  );
}
