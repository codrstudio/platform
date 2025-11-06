/**
 * Auth Module Components
 * Barrel export for all auth components
 */

export { LoginForm } from './LoginForm';
export type { LoginFormProps } from './LoginForm';

export { LogoutButton } from './LogoutButton';
export type { LogoutButtonProps } from './LogoutButton';

export { UserAvatar } from './UserAvatar';
export type { UserAvatarProps } from './UserAvatar';

// Re-export ProtectedRoute from core components
export { ProtectedRoute } from '@/components/ProtectedRoute';
