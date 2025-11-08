/**
 * MarkBrowser Module Routes
 */

import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

const MarkBrowserView = lazy(() =>
  import('./pages/MarkBrowserView').then((m) => ({ default: m.MarkBrowserView }))
);

export const createMarkBrowserRoutes = (instanceId: string): RouteObject[] => {
  return [
    {
      path: '',
      element: <MarkBrowserView instanceId={instanceId} />,
    },
    {
      path: '*',
      element: <MarkBrowserView instanceId={instanceId} />,
    },
  ];
};
