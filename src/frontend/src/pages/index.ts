// Lazy-loaded Pages
// Based on SPEC-routing.md (SPEC-R-LL-*) and SPEC-architecture.md (SPEC-A-LL-*)

import { lazy } from 'react';

/**
 * Lazy-loaded pages for code splitting
 * SPEC-A-LL-001 to SPEC-A-LL-005: Lazy loading requirements
 * SPEC-R-LD-001 to SPEC-R-LD-005: Lazy loading implementation
 */

// Authentication
export const LoginPage = lazy(() =>
  import('./LoginPage').then((module) => ({ default: module.LoginPage }))
);

// Error pages
export const NotFoundPage = lazy(() =>
  import('./NotFoundPage').then((module) => ({ default: module.NotFoundPage }))
);

export const UnauthorizedPage = lazy(() =>
  import('./UnauthorizedPage').then((module) => ({ default: module.UnauthorizedPage }))
);

// Re-export non-lazy components if needed
// (currently none, but structure allows for future expansion)
