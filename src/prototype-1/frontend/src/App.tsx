/**
 * App Component
 * Root application with portal-based routing
 * SPEC-A-*, SPEC-R-* compliance
 */

import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { PortalLoader } from '@/core/routing/PortalLoader';

/**
 * Root Router Configuration
 * SPEC-R-PR-001: Main portal at "/", others at "/:portalId/*"
 *
 * Strategy: Try "main" portal first for all routes.
 * If a route segment matches a known portalId (like "setup"),
 * PortalLoader will detect and load that portal instead.
 */
const router = createBrowserRouter([
  {
    path: '/health',
    element: (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Health Check</h1>
          <div className="flex items-center justify-center gap-2">
            <span className="inline-block w-3 h-3 bg-green-500 rounded-full"></span>
            <span className="text-muted-foreground">Frontend is running</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    path: '/*',
    element: <PortalLoader />,
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
