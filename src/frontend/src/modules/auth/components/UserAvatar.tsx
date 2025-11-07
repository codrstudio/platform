/**
 * UserAvatar Component - Auth Module
 *
 * SPEC Compliance:
 * - SPEC-AUTH-E-002: UserAvatar component opcional
 * - spec/ui/auth-module-interfaces.md (Section 11.1 - User Menu)
 */

import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, Settings, LogOut, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface UserAvatarProps {
  showDropdown?: boolean;
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

/**
 * UserAvatar component with optional dropdown menu
 *
 * Usage:
 * ```tsx
 * // Simple avatar
 * <UserAvatar />
 *
 * // With dropdown menu
 * <UserAvatar showDropdown />
 *
 * // Custom size
 * <UserAvatar size="lg" showDropdown />
 * ```
 */
export function UserAvatar({
  showDropdown = false,
  size = 'default',
  className = ''
}: UserAvatarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  if (!user) {
    return null;
  }

  // Generate initials from user name
  const initials = (user as any).name
    ? (user as any).name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : (user as any).email?.[0]?.toUpperCase() || '?';

  // Size mappings
  const sizeClasses = {
    sm: 'h-8 w-8',
    default: 'h-10 w-10',
    lg: 'h-12 w-12'
  };

  const avatarElement = (
    <Avatar className={`${sizeClasses[size]} ${className}`}>
      <AvatarImage src={(user as any).avatar} alt={(user as any).name || (user as any).email} />
      <AvatarFallback className="bg-primary text-primary-foreground">
        {initials}
      </AvatarFallback>
    </Avatar>
  );

  // Without dropdown (simple avatar)
  if (!showDropdown) {
    return avatarElement;
  }

  // With dropdown menu (SPEC: spec/ui/auth-module-interfaces.md Section 11.1)
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
      setIsLoggingOut(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="rounded-full focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          aria-label="Menu do usuário"
        >
          {avatarElement}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {/* User Info */}
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{(user as any).name || 'Usuário'}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {(user as any).email}
            </p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {/* Profile */}
        <DropdownMenuItem onClick={() => navigate('/profile')}>
          <User className="mr-2 h-4 w-4" />
          Perfil
        </DropdownMenuItem>

        {/* Settings */}
        <DropdownMenuItem onClick={() => navigate('/settings')}>
          <Settings className="mr-2 h-4 w-4" />
          Configurações
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Logout */}
        <DropdownMenuItem
          onClick={handleLogout}
          className="text-destructive focus:text-destructive"
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
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * UserAvatarCompact - Smaller version for sidebars/headers
 */
export function UserAvatarCompact() {
  return <UserAvatar size="sm" showDropdown />;
}
