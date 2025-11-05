// Main Portal Router - Renders main portal with empty state support
// Based on SPEC-routing.md and SPEC-concepts.md

import { Link } from 'react-router-dom';
import type { Portal } from '../../types/portal';

interface MainPortalRouterProps {
  portal: Portal;
}

export function MainPortalRouter({ portal }: MainPortalRouterProps) {
  // TODO: In future tasks, load and render module routes here
  // For now, show empty state since main portal starts with no modules (SPEC-C-S-002)

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center max-w-md px-4">
        <h1 className="text-2xl font-bold mb-2">{portal.name}</h1>
        {portal.description && (
          <p className="text-muted-foreground mb-4">{portal.description}</p>
        )}

        {portal.activeModules.length === 0 ? (
          <>
            <p className="text-muted-foreground mb-4">
              This portal has no active modules. Activate modules from the setup portal to get started.
            </p>
            <Link
              to="/setup"
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              Go to Setup
            </Link>
          </>
        ) : (
          <div className="text-muted-foreground">
            <p className="mb-2">Active modules:</p>
            <ul className="list-disc list-inside">
              {portal.activeModules.map((moduleId) => (
                <li key={moduleId}>{moduleId}</li>
              ))}
            </ul>
            <p className="mt-4 text-sm">
              Module loading will be implemented in upcoming tasks.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
