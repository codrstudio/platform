import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface UserAvatarProps {
  className?: string;
  showName?: boolean;
  size?: AvatarSize;
}

/**
 * UserAvatar Component
 *
 * Displays the authenticated user's avatar.
 * Falls back to initials if no avatar image is available.
 *
 * Part of the global platform infrastructure (not from auth module).
 */
export function UserAvatar({ className, showName = false, size = 'md' }: UserAvatarProps) {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  // Generate initials from username or email
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const initials = getInitials(user.username || user.email || 'U');
  const displayName = user.username || user.email || 'User';

  // Size classes for avatar
  const sizeClasses: Record<AvatarSize, string> = {
    xs: 'h-6 w-6 text-xs',
    sm: 'h-8 w-8 text-sm',
    md: 'h-10 w-10 text-base',
    lg: 'h-12 w-12 text-lg',
    xl: 'h-16 w-16 text-xl',
  };

  return (
    <div className={`flex items-center gap-2 ${className || ''}`}>
      <Avatar className={sizeClasses[size]}>
        <AvatarImage src={undefined} alt={displayName} />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      {showName && (
        <span className="text-sm font-medium">{displayName}</span>
      )}
    </div>
  );
}
