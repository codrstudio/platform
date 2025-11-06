/**
 * Login Page
 *
 * Public page for user authentication.
 * SPEC-R-RP-004: Unauthenticated users are redirected here.
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import { LoginForm } from '@/components/auth/LoginForm';

export function Login() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect to home if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Platform</h1>
          <p className="text-gray-600">Modular Application Platform</p>
        </div>

        <LoginForm />
      </div>
    </div>
  );
}
