/**
 * MOCK AuthProvider - Temporary implementation
 *
 * This is a MOCK implementation to unblock ProtectedRoute development.
 * Will be replaced by the real implementation in Sistema 1.3 (task 1.3.3).
 *
 * DO NOT USE THIS IN PRODUCTION - it provides fake authentication state.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextValue {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * MOCK AuthProvider component
 * Provides fake authentication state for development
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  // Simulate initial auth check
  useEffect(() => {
    const timer = setTimeout(() => {
      // Check localStorage for mock session
      const mockSession = localStorage.getItem('mock_auth_session');
      if (mockSession === 'authenticated') {
        setIsAuthenticated(true);
        setUser({
          id: 'mock-user-1',
          name: 'Mock User',
          email: 'mock@example.com',
        });
      }
      setIsLoading(false);
    }, 500); // Simulate 500ms auth check

    return () => clearTimeout(timer);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Mock: accept any non-empty credentials
    if (email && password) {
      localStorage.setItem('mock_auth_session', 'authenticated');
      setIsAuthenticated(true);
      setUser({
        id: 'mock-user-1',
        name: 'Mock User',
        email,
      });
    }
    setIsLoading(false);
  };

  const logout = async () => {
    setIsLoading(true);
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    localStorage.removeItem('mock_auth_session');
    setIsAuthenticated(false);
    setUser(null);
    setIsLoading(false);
  };

  const value: AuthContextValue = {
    isAuthenticated,
    isLoading,
    user,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to access authentication context
 * Throws error if used outside AuthProvider
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error(
      'useAuth must be used within an AuthProvider. ' +
      'Wrap your component tree with <AuthProvider>.'
    );
  }

  return context;
}
