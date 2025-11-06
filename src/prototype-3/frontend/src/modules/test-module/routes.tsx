/**
 * Test Module Routes
 */

import type { ModuleRoute } from '../../types/module';

// Simple test component
function TestPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Test Module</h1>
      <p className="mt-4 text-muted-foreground">
        This module depends on the 'setup' module.
        If you see this page, dependency loading is working correctly!
      </p>
    </div>
  );
}

export const routes: ModuleRoute[] = [
  {
    path: '/test',
    component: TestPage,
    requiresAuth: false,
  },
];
