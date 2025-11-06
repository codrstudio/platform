/**
 * LogoutButton Component
 * Logout action component with optional redirect
 * SPEC-AUTH-F-007, SPEC-AUTH-F-010
 */

import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export interface LogoutButtonProps {
  redirectTo?: string; // Where to redirect after logout
  className?: string; // Custom CSS classes
  children?: React.ReactNode; // Custom button content
}

export function LogoutButton({
  redirectTo = '/login',
  className,
  children,
}: LogoutButtonProps) {
  const { logout, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate(redirectTo, { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      // Still navigate even if logout fails
      navigate(redirectTo, { replace: true });
    }
  };

  const defaultClassName =
    'px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors';

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      className={className || defaultClassName}
      aria-label="Sign out"
    >
      {children || (isLoading ? 'Signing out...' : 'Sign Out')}
    </button>
  );
}
