/**
 * HomepageHeader Component
 *
 * Header opcional para homepage com integração de autenticação.
 * Mostra botões Login/Signup se não autenticado, ou avatar/menu se autenticado.
 *
 * @see spec/SPEC-module-homepage.md - Integração com Outros Módulos
 */

import { useAuth } from '@/contexts/AuthContext';
import { UserAvatar, LogoutMenuItem } from '@/components/auth';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Home, Settings, User } from 'lucide-react';

export interface HomepageHeaderProps {
  /**
   * Se deve exibir o header
   * @default true
   */
  show?: boolean;

  /**
   * Rota para redirect após login (opcional)
   */
  redirectAfterLogin?: string;

  /**
   * Classes CSS adicionais
   */
  className?: string;
}

/**
 * HomepageHeader - Integração com Auth Module
 */
export function HomepageHeader({
  show = true,
  redirectAfterLogin,
  className,
}: HomepageHeaderProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  // Não renderizar se show = false
  if (!show) {
    return null;
  }

  // Loading state (skeleton)
  if (isLoading) {
    return (
      <header className={className}>
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Home className="h-6 w-6" />
            <span className="font-semibold text-lg">Platform</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-9 w-20 bg-muted animate-pulse rounded-md" />
            <div className="h-9 w-20 bg-muted animate-pulse rounded-md" />
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className={className}>
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo / Brand */}
        <div className="flex items-center gap-2">
          <Home className="h-6 w-6" />
          <span className="font-semibold text-lg">Platform</span>
        </div>

        {/* Auth Actions */}
        <div className="flex items-center gap-3">
          {isAuthenticated && user ? (
            // Authenticated: Show avatar with dropdown
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full">
                  <UserAvatar size="sm" />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.username}</p>
                    {user.email && (
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    )}
                  </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => navigate('/setup')}>
                  <Settings className="mr-2 h-4 w-4" />
                  Setup
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <LogoutMenuItem />
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            // Not authenticated: Show login/signup buttons
            <>
              <Button
                variant="ghost"
                onClick={() => {
                  const loginPath = redirectAfterLogin
                    ? `/auth/login?redirect=${encodeURIComponent(redirectAfterLogin)}`
                    : '/auth/login';
                  navigate(loginPath);
                }}
              >
                Login
              </Button>

              <Button
                onClick={() => {
                  const signupPath = redirectAfterLogin
                    ? `/auth/signup?redirect=${encodeURIComponent(redirectAfterLogin)}`
                    : '/auth/signup';
                  navigate(signupPath);
                }}
              >
                Sign Up
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
