/**
 * Login Page Component
 * SPEC-AUTH-F-017: Redirects to original route after successful login
 * Full page login with routing integration
 */

import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LoginForm, LoginFormProps } from '../components/LoginForm';

export interface LoginPageProps extends LoginFormProps {
  /** Route to redirect after successful login (defaults to location state or '/') */
  redirectTo?: string;
}

/**
 * LoginPage Component
 * SPEC-AUTH-F-017: Redirects to original requested route after login
 */
export function LoginPage(props: LoginPageProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  // Get the redirect path from location state or use default
  const from = (location.state as any)?.from?.pathname || props.redirectTo || '/';

  /**
   * Redirect if already authenticated
   */
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  /**
   * Handle successful login
   * SPEC-AUTH-F-017: Redirect to original route
   */
  const handleSuccess = () => {
    navigate(from, { replace: true });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <LoginForm {...props} onSuccess={handleSuccess} />
    </div>
  );
}
