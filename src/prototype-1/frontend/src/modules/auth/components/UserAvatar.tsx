/**
 * UserAvatar Component
 * User display component with initials fallback
 * SPEC-AUTH-E-002
 */

import { useAuth } from '@/contexts/AuthContext';

export interface UserAvatarProps {
  size?: 'sm' | 'md' | 'lg'; // Avatar size
  showName?: boolean; // Show user name next to avatar
  className?: string; // Custom CSS classes
}

export function UserAvatar({
  size = 'md',
  showName = false,
  className,
}: UserAvatarProps) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return null;
  }

  // Extract user initials from name or username
  const getUserInitials = (): string => {
    const name = user.name || user.username || 'U';

    // If name has spaces, take first letter of first two words
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }

    // Otherwise, take first two letters
    return name.substring(0, 2).toUpperCase();
  };

  const initials = getUserInitials();
  const displayName = user.name || user.username;

  // Size classes
  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
  };

  return (
    <div className={`flex items-center gap-2 ${className || ''}`}>
      {/* Avatar Circle */}
      <div
        className={`${sizeClasses[size]} rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold`}
        aria-label={`Avatar for ${displayName}`}
        title={displayName}
      >
        {initials}
      </div>

      {/* User Name */}
      {showName && (
        <span className="text-sm font-medium truncate">
          {displayName}
        </span>
      )}
    </div>
  );
}
