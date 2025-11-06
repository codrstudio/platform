/**
 * Portal Router
 *
 * Main router component that handles portal-based routing.
 * Implements SPEC-R-STR-001 to SPEC-R-PRI-006.
 * Implements SPEC-R-RP-001 to SPEC-R-RP-011 (Protected Routes).
 * Implements SPEC-R-LD-001 to SPEC-R-LD-005, SPEC-A-LL-001 to SPEC-A-LL-010 (Lazy Loading).
 */

import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PortalLoader } from './PortalLoader';
import { ProtectedRoute } from '@/components/routing/ProtectedRoute';
import { LazyErrorBoundary } from '@/components/error/LazyErrorBoundary';
import { PageSkeleton, PortalSkeleton } from '@/components/loading/PageSkeleton';
import { portalRequiresAuth } from '@/utils/portalConfig';
import type { Portal } from '@/types/portal';

// Lazy-loaded page components - SPEC-R-LD-003, SPEC-R-LD-005
// SPEC-A-LL-004: Modules loaded under demand (code splitting)
// SPEC-R-PE-003: Routes use React.lazy()
const Login = lazy(() => import('@/pages/Login').then(m => ({ default: m.Login })));
const NotFound = lazy(() => import('@/pages/NotFound').then(m => ({ default: m.NotFound })));
const PortalContent = lazy(() => import('@/pages/PortalContent').then(m => ({ default: m.PortalContent })));

/**
 * Portal Router Component
 *
 * SPEC-R-STR-001: Main portal uses "/", others use "/:portalId/*"
 * SPEC-R-PRI-001: Route priority - exact match > partial match > wildcard
 * SPEC-R-RP-001: Routes MAY require authentication (not MUST - now optional)
 * SPEC-R-RP-009: Protection is module responsibility (checked per portal)
 * SPEC-R-LD-001: Modules loaded on portal opening
 */
export function PortalRouter() {
  return (
    <BrowserRouter>
      {/* SPEC-R-TE-007: Error Boundary to capture lazy loading errors */}
      <LazyErrorBoundary>
        <Routes>
          {/* Public route: Login - SPEC-R-RP-004 */}
          <Route
            path="/login"
            element={
              <Suspense fallback={<PageSkeleton />}>
                <Login />
              </Suspense>
            }
          />

          {/* Portal routes: Protection applied conditionally per portal */}
          {/* SPEC-R-RP-001: Routes MAY require auth (portal decides) */}
          <Route
            path="/*"
            element={
              <PortalLoader>
                {(portals) => <PortalRoutes portals={portals} />}
              </PortalLoader>
            }
          />
        </Routes>
      </LazyErrorBoundary>
    </BrowserRouter>
  );
}

/**
 * Portal Routes Component
 *
 * Renders routes for all loaded portals.
 * Protection applied conditionally per portal based on auth module activation.
 * SPEC-R-LD-002: Inactive modules not loaded
 * SPEC-R-RP-001: Routes MAY require authentication (portal decides)
 * SPEC-R-RP-009: Protection is module responsibility
 */
interface PortalRoutesProps {
  portals: Portal[];
}

function PortalRoutes({ portals }: PortalRoutesProps) {
  // Filter active portals only - SPEC-R-LD-002
  const activePortals = portals.filter((p) => p.active);

  // Find main portal (portalId === "main")
  const mainPortal = activePortals.find((p) => p.portalId === 'main');

  // Other portals (not main)
  const otherPortals = activePortals.filter((p) => p.portalId !== 'main');

  return (
    <Routes>
      {/* Main portal routes (if exists) - SPEC-R-STR-001 */}
      {mainPortal && (
        <Route
          path="/*"
          element={
            portalRequiresAuth(mainPortal) ? (
              <ProtectedRoute redirectTo="/login">
                <Suspense fallback={<PortalSkeleton />}>
                  <PortalContent portal={mainPortal} />
                </Suspense>
              </ProtectedRoute>
            ) : (
              <Suspense fallback={<PortalSkeleton />}>
                <PortalContent portal={mainPortal} />
              </Suspense>
            )
          }
        />
      )}

      {/* Other portal routes - SPEC-R-STR-001 */}
      {otherPortals.map((portal) => (
        <Route
          key={portal.portalId}
          path={`/${portal.portalId}/*`}
          element={
            portalRequiresAuth(portal) ? (
              <ProtectedRoute redirectTo="/login">
                <Suspense fallback={<PortalSkeleton />}>
                  <PortalContent portal={portal} />
                </Suspense>
              </ProtectedRoute>
            ) : (
              <Suspense fallback={<PortalSkeleton />}>
                <PortalContent portal={portal} />
              </Suspense>
            )
          }
        />
      ))}

      {/* Fallback: Redirect to main portal or 404 */}
      {mainPortal ? (
        <Route path="*" element={<Navigate to="/" replace />} />
      ) : (
        <Route
          path="*"
          element={
            <Suspense fallback={<PageSkeleton />}>
              <NotFound />
            </Suspense>
          }
        />
      )}
    </Routes>
  );
}
