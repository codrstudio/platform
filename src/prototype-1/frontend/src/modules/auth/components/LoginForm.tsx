/**
 * LoginForm Component
 * Provides login interface with realm/schema support
 * SPEC-AUTH-F-001, SPEC-AUTH-F-002, SPEC-AUTH-F-003
 */

import { useState, FormEvent } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import type { LoginRequest } from '@/services/auth/types';

export interface LoginFormProps {
  realm?: string; // Default realm
  schema?: string; // Default schema
  allowRealmSelection?: boolean; // Allow user to change realm
  allowSchemaSelection?: boolean; // Allow user to change schema
  onSuccess?: () => void; // Callback on successful login
  onError?: (error: Error) => void; // Callback on error
}

export function LoginForm({
  realm = '',
  schema = '',
  allowRealmSelection = false,
  allowSchemaSelection = false,
  onSuccess,
  onError,
}: LoginFormProps) {
  const { login, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    realm: realm,
    schema: schema,
  });
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const loginRequest: LoginRequest = {
        username: formData.username,
        password: formData.password,
      };

      // Add realm if provided
      if (formData.realm) {
        loginRequest.realm = formData.realm;
      }

      // Add schema if provided
      if (formData.schema) {
        loginRequest.schema = formData.schema;
      }

      await login(loginRequest);
      onSuccess?.();
    } catch (err: any) {
      const errorMessage = err.message || 'Login failed';
      setError(errorMessage);
      onError?.(err);
    }
  };

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md">
      {/* Username Field */}
      <div>
        <label
          htmlFor="username"
          className="block text-sm font-medium mb-1"
        >
          Username
        </label>
        <input
          id="username"
          type="text"
          required
          autoComplete="username"
          value={formData.username}
          onChange={(e) => handleChange('username', e.target.value)}
          disabled={isLoading}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
      </div>

      {/* Password Field */}
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium mb-1"
        >
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            required
            autoComplete="current-password"
            value={formData.password}
            onChange={(e) => handleChange('password', e.target.value)}
            disabled={isLoading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            disabled={isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-500 hover:text-gray-700 disabled:cursor-not-allowed"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>
      </div>

      {/* Realm Field (optional) */}
      {allowRealmSelection && (
        <div>
          <label
            htmlFor="realm"
            className="block text-sm font-medium mb-1"
          >
            Realm (optional)
          </label>
          <input
            id="realm"
            type="text"
            value={formData.realm}
            onChange={(e) => handleChange('realm', e.target.value)}
            disabled={isLoading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
        </div>
      )}

      {/* Schema Field (optional) */}
      {allowSchemaSelection && (
        <div>
          <label
            htmlFor="schema"
            className="block text-sm font-medium mb-1"
          >
            Schema (optional)
          </label>
          <input
            id="schema"
            type="text"
            value={formData.schema}
            onChange={(e) => handleChange('schema', e.target.value)}
            disabled={isLoading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div
          className="p-3 rounded-md bg-red-50 border border-red-200 text-red-800 text-sm"
          role="alert"
          aria-live="polite"
        >
          {error}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  );
}
