/**
 * Auth Module - Routes
 *
 * SPEC Compliance:
 * - SPEC-AUTH-C-001: Rota de login configurada
 * - SPEC-AUTH-C-002: Rota de login única no portal
 * - SPEC-AUTH-O-001: Rota de registro (opcional)
 * - SPEC-AUTH-O-003: Rota de recuperação (opcional)
 */

import { lazy } from 'react';
import type { ModuleRoute } from '@/types/module';

// Lazy-loaded pages for code splitting
const LoginPage = lazy(() =>
  import('./pages/LoginPage').then(m => ({ default: m.LoginPage }))
);

/**
 * Auth module routes
 *
 * Note: Routes are relative to the portal.
 * Portal prefix is injected automatically by PortalRouter.
 *
 * Configuration via instance config:
 * - loginRoute: Path for login page (default: '/login')
 * - signupRoute: Path for signup page (if enabled)
 * - recoveryRoute: Path for password recovery (if enabled)
 */
export const routes: ModuleRoute[] = [
  {
    path: '/login',
    component: LoginPage,
    isPublic: true, // No authentication required
    meta: {
      title: 'Login',
      description: 'Página de autenticação'
    }
  }
  // Additional routes (signup, recovery) can be added based on instance config
  // These would be dynamically registered when the module is activated
];

export default routes;
