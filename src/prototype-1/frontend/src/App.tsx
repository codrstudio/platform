/**
 * App Component
 * Root application with portal-based routing
 * SPEC-A-*, SPEC-R-* compliance
 */

import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Toaster } from 'sonner';
import { PortalLoader } from '@/core/routing/PortalLoader';
import { UpdateAvailableDialog } from '@/components/pwa/UpdateAvailableDialog';

/**
 * Root Router Configuration
 * SPEC-R-PR-001: Main portal at "/", others at "/:portalId/*"
 */
const router = createBrowserRouter([
  {
    path: '/',
    element: <PortalLoader portalId="main" />,
  },
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
    path: '/:portalId/*',
    element: <PortalLoader />,
  },
  {
    path: '*',
    element: (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold mb-2">404 - Page Not Found</h1>
          <p className="text-muted-foreground">
            The requested page does not exist.
          </p>
        </div>
      </div>
    ),
  },
]);

function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster position="bottom-right" richColors />
      <UpdateAvailableDialog />
    </>
  );
}

export default App;
