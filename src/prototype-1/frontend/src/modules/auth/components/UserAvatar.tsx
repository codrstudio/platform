/**
 * User Avatar Component
 * SPEC-AUTH-E-002: Optional component for displaying user
 * Shows authenticated user's avatar and name
 */

import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User } from 'lucide-react';

export interface UserAvatarProps {
  /** Show user name next to avatar */
  showName?: boolean;
  /** Avatar size */
  size?: 'sm' | 'md' | 'lg';
  /** Custom className */
  className?: string;
}

/**
 * UserAvatar Component
 * Displays the current authenticated user's avatar
 */
export function UserAvatar({
  showName = false,
  size = 'md',
  className = '',
}: UserAvatarProps) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return null;
  }

  // Get user initials for fallback
  const getInitials = (name?: string): string => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Get display name from user payload
  const displayName = user.username || user.email?.split('@')[0] || 'User';
  const initials = getInitials(displayName);

  // Avatar size classes
  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Avatar className={sizeClasses[size]}>
        <AvatarFallback>
          {initials || <User className="h-4 w-4" />}
        </AvatarFallback>
      </Avatar>

      {showName && (
        <div className="flex flex-col">
          <span className="text-sm font-medium">{displayName}</span>
          {user.email && (
            <span className="text-xs text-muted-foreground">{user.email}</span>
          )}
        </div>
      )}
    </div>
  );
}
