/**
 * LogoutButton Component - Auth Module
 *
 * SPEC Compliance:
 * - SPEC-AUTH-F-007: Funcionalidade de logout
 * - SPEC-AUTH-F-008: Chama /api/1/auth/logout
 * - SPEC-AUTH-F-009: Remove tokens após logout
 * - SPEC-AUTH-F-010: Redireciona após logout
 * - SPEC-AUTH-I-003: Fluxo de logout
 * - spec/ui/auth-module-interfaces.md (Section 11.1)
 */

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { LogOut, Loader2 } from 'lucide-react';

interface LogoutButtonProps {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showIcon?: boolean;
  showText?: boolean;
  text?: string;
  confirmLogout?: boolean;
  className?: string;
}

/**
 * LogoutButton component with optional confirmation
 *
 * Usage:
 * ```tsx
 * // Simple button
 * <LogoutButton />
 *
 * // With confirmation dialog
 * <LogoutButton confirmLogout />
 *
 * // Custom styling
 * <LogoutButton variant="ghost" showIcon={false} text="Sign out" />
 *
 * // Icon only
 * <LogoutButton size="icon" showText={false} />
 * ```
 */
export function LogoutButton({
  variant = 'ghost',
  size = 'default',
  showIcon = true,
  showText = true,
  text = 'Sair',
  confirmLogout = false,
  className = ''
}: LogoutButtonProps) {
  const { logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      // Redirect is handled by AuthContext
    } catch (error) {
      console.error('Logout failed:', error);
      setIsLoggingOut(false);
    }
  };

  const buttonContent = (
    <Button
      variant={variant}
      size={size}
      onClick={confirmLogout ? undefined : handleLogout}
      disabled={isLoggingOut}
      className={className}
      aria-label={text}
    >
      {isLoggingOut ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          {showText && size !== 'icon' && <span className="ml-2">Saindo...</span>}
        </>
      ) : (
        <>
          {showIcon && <LogOut className="h-4 w-4" />}
          {showText && size !== 'icon' && <span className={showIcon ? 'ml-2' : ''}>{text}</span>}
        </>
      )}
    </Button>
  );

  // Without confirmation (SPEC: spec/ui/auth-module-interfaces.md Section 11.1 - Simple)
  if (!confirmLogout) {
    return buttonContent;
  }

  // With confirmation dialog (SPEC: spec/ui/auth-module-interfaces.md Section 11.1 - With Confirmation)
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {buttonContent}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Sair da conta?</AlertDialogTitle>
          <AlertDialogDescription>
            Você será desconectado e redirecionado para login.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleLogout} disabled={isLoggingOut}>
            {isLoggingOut ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saindo...
              </>
            ) : (
              'Sair'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/**
 * Compact LogoutButton for menus/dropdowns
 *
 * Usage in dropdown:
 * ```tsx
 * <DropdownMenuItem onClick={handleLogout}>
 *   <LogOut className="mr-2 h-4 w-4" />
 *   Sair
 * </DropdownMenuItem>
 * ```
 */
export function LogoutMenuItem({
  onClick,
  className = ''
}: {
  onClick?: () => void;
  className?: string;
}) {
  const { logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleClick = async () => {
    try {
      setIsLoggingOut(true);
      if (onClick) onClick();
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
      setIsLoggingOut(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoggingOut}
      className={`flex items-center w-full px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground rounded-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {isLoggingOut ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Saindo...
        </>
      ) : (
        <>
          <LogOut className="mr-2 h-4 w-4" />
          Sair
        </>
      )}
    </button>
  );
}
