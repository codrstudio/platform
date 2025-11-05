/**
 * Auth Module
 * SPEC-module-auth.md compliance
 * Provides UI/UX for authentication system
 */

import type { ModuleManifest } from '@/core/modules/types';
import { LoginPage } from './pages/LoginPage';
import { AuthHome } from './pages/AuthHome';

// Export components for external use
export { LoginForm } from './components/LoginForm';
export type { LoginFormProps } from './components/LoginForm';
export { LoginPage } from './pages/LoginPage';
export type { LoginPageProps } from './pages/LoginPage';
export { AuthHome } from './pages/AuthHome';
export { ProtectedRoute } from './components/ProtectedRoute';
export { LogoutButton } from './components/LogoutButton';
export type { LogoutButtonProps } from './components/LogoutButton';
export { UserAvatar } from './components/UserAvatar';
export type { UserAvatarProps } from './components/UserAvatar';

// Re-export auth hook from context for convenience
export { useAuth } from '@/contexts/AuthContext';

/**
 * Auth Module Manifest
 * SPEC-AUTH-R-001: Module provides authentication UI components
 * SPEC-AUTH-R-002: Does NOT implement auth logic (uses AuthContext)
 * SPEC-AUTH-R-003: Wrapper over /api/1/auth/* authentication channel
 */
const authModule: ModuleManifest = {
  moduleId: 'auth',
  name: 'Authentication',
  type: 'functionality',
  version: '1.0.0',
  dependencies: [],
  exports: {
    routes: [
      {
        path: '/',
        element: AuthHome,
        requiresAuth: false,
        metadata: {
          title: 'Home',
          description: 'Authentication home page',
        },
      },
      {
        path: '/login',
        element: LoginPage,
        requiresAuth: false,
        metadata: {
          title: 'Sign In',
          description: 'User authentication login page',
        },
      },
    ],
  },
  metadata: {
    description: 'Authentication module providing login, logout, and user management UI',
    icon: 'lock',
    category: 'security',
  },
};

export default authModule;
