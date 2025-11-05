/**
 * Logout Button Component
 * SPEC-AUTH-F-007 to SPEC-AUTH-F-010
 * Provides logout functionality
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, Loader2 } from 'lucide-react';

export interface LogoutButtonProps {
  /** Route to redirect after logout */
  redirectTo?: string;
  /** Button variant */
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  /** Button size */
  size?: 'default' | 'sm' | 'lg' | 'icon';
  /** Show only icon (no text) */
  iconOnly?: boolean;
  /** Custom className */
  className?: string;
  /** Callback after successful logout */
  onSuccess?: () => void;
  /** Callback on logout error */
  onError?: (error: Error) => void;
}

/**
 * LogoutButton Component
 * SPEC-AUTH-F-007: Provides logout functionality
 * SPEC-AUTH-F-008: Calls /api/1/auth/logout with refresh_token
 * SPEC-AUTH-F-009: Removes tokens after logout
 * SPEC-AUTH-F-010: Redirects to configured route
 */
export function LogoutButton({
  redirectTo = '/login',
  variant = 'outline',
  size = 'default',
  iconOnly = false,
  className,
  onSuccess,
  onError,
}: LogoutButtonProps) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  /**
   * Handle logout click
   * SPEC-AUTH-F-008 to SPEC-AUTH-F-010
   */
  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      await logout();

      onSuccess?.();

      // SPEC-AUTH-F-010: Redirect to configured route
      navigate(redirectTo, { replace: true });
    } catch (error: any) {
      console.error('Logout error:', error);
      onError?.(error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleLogout}
      disabled={isLoggingOut}
    >
      {isLoggingOut ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          {!iconOnly && <span className="ml-2">Logging out...</span>}
        </>
      ) : (
        <>
          <LogOut className="h-4 w-4" />
          {!iconOnly && <span className="ml-2">Sign Out</span>}
        </>
      )}
    </Button>
  );
}
