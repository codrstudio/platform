/**
 * Auth Module
 * Authentication UI/UX components and flows
 * SPEC-module-auth.md compliance
 */

import type { ModuleManifest } from '@/core/modules/types';
import { LoginPage } from './pages/LoginPage';

/**
 * Auth Module Manifest
 * SPEC-AUTH-R-*, SPEC-AUTH-E-*
 */
const authModule: ModuleManifest = {
  moduleId: 'auth',
  name: 'Authentication',
  type: 'functionality',
  version: '1.0.0',
  dependencies: [], // No dependencies - uses core auth infrastructure
  exports: {
    // Routes exported by the module
    routes: [
      {
        path: '/login',
        element: LoginPage,
        requiresAuth: false,
        metadata: {
          title: 'Sign In',
          description: 'User authentication page',
        },
      },
    ],
    // Components exported by the module
    components: {},
    // No widgets for this module
    widgets: {},
  },
  metadata: {
    description: 'Authentication module providing login, logout, and session management UI',
    icon: 'lock',
    category: 'auth',
  },
};

export default authModule;

// Export components for use by other modules
export { LoginForm } from './components/LoginForm';
export { LogoutButton } from './components/LogoutButton';
export { UserAvatar } from './components/UserAvatar';
export { ProtectedRoute } from './components';

// Export hooks
export { useAuth } from './hooks';

// Export pages
export { LoginPage } from './pages/LoginPage';
