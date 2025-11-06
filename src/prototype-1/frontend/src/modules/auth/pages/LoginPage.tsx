/**
 * LoginPage Component
 * Full page login with routing and redirect support
 * SPEC-AUTH-F-001, SPEC-AUTH-F-017
 */

import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LoginForm, LoginFormProps } from '../components/LoginForm';

export interface LoginPageProps extends Omit<LoginFormProps, 'onSuccess'> {
  redirectTo?: string; // Default redirect after login
}

export function LoginPage({
  realm,
  schema,
  allowRealmSelection,
  allowSchemaSelection,
  redirectTo = '/',
}: LoginPageProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  // Get the original location user was trying to access
  const from = (location.state as any)?.from?.pathname || redirectTo;

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleLoginSuccess = () => {
    // Navigate to the original location or default redirect
    navigate(from, { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            Sign in to your account
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Enter your credentials to continue
          </p>
        </div>

        {/* Login Form */}
        <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <LoginForm
            realm={realm}
            schema={schema}
            allowRealmSelection={allowRealmSelection}
            allowSchemaSelection={allowSchemaSelection}
            onSuccess={handleLoginSuccess}
          />
        </div>
      </div>
    </div>
  );
}
