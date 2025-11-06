/**
 * Portal Landing Page
 *
 * Default landing page for a portal.
 * This component is lazy-loaded to reduce initial bundle size.
 */

import type { Portal } from '@/types/portal';

export interface PortalLandingProps {
  portal: Portal;
}

/**
 * Portal Landing Component
 *
 * Displays portal information and active module count.
 * SPEC-R-LD-001: Loaded on demand when portal is accessed.
 */
export function PortalLanding({ portal }: PortalLandingProps) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900">{portal.name}</h1>
        {portal.description && (
          <p className="mt-4 text-lg text-gray-600">{portal.description}</p>
        )}
        <div className="mt-8">
          <p className="text-sm text-gray-500">Portal ID: {portal.portalId}</p>
          <p className="text-sm text-gray-500">
            Active Modules: {portal.activeModules.length}
          </p>
        </div>
      </div>
    </div>
  );
}
