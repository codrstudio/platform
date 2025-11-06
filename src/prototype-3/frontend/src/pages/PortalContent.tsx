/**
 * Portal Content Page
 *
 * Renders module routes for the portal.
 * This component is lazy-loaded to reduce initial bundle size.
 */

import type { Portal } from '@/types/portal';

export interface PortalContentProps {
  portal: Portal;
}

/**
 * Portal Content Component
 *
 * Renders module routes for the portal.
 * This is a placeholder - will be replaced with ModuleRouter in future tasks.
 *
 * SPEC-R-LD-001: Loaded on demand when user navigates to portal routes.
 */
export function PortalContent({ portal }: PortalContentProps) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">Portal: {portal.name}</h1>
        <p className="mt-4 text-gray-600">Module routing not yet implemented.</p>
        <p className="mt-2 text-sm text-gray-500">
          Active modules: {portal.activeModules.join(', ') || 'None'}
        </p>
      </div>
    </div>
  );
}
