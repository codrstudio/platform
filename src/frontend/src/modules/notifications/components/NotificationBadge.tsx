/**
 * NotificationBadge Component
 *
 * Badge de notificações que exibe quantidade de não-lidas.
 *
 * SPEC Compliance:
 * - SPEC-NOTIF-UI-001: Ícone de notificações na UI
 * - SPEC-NOTIF-UI-002: Badge com contagem de não-lidas
 * - SPEC-NOTIF-UI-003: Badge desaparece quando todas lidas
 * - SPEC-NOTIF-UI-004: Clicável para abrir dropdown
 */

import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface NotificationBadgeProps {
  unreadCount: number;
  onClick?: () => void;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

/**
 * NotificationBadge component
 *
 * Usage:
 * ```tsx
 * <NotificationBadge
 *   unreadCount={5}
 *   onClick={() => setDropdownOpen(true)}
 * />
 * ```
 */
export function NotificationBadge({
  unreadCount,
  onClick,
  variant = 'ghost',
  size = 'icon',
  className
}: NotificationBadgeProps) {
  const hasUnread = unreadCount > 0;

  return (
    <Button
      variant={variant}
      size={size}
      onClick={onClick}
      className={cn('relative', className)}
      aria-label={`Notificações${hasUnread ? ` (${unreadCount} não lidas)` : ''}`}
    >
      <Bell className="h-5 w-5" />

      {/* Badge with unread count (SPEC-NOTIF-UI-002 to UI-003) */}
      {hasUnread && (
        <Badge
          variant="destructive"
          className="absolute -top-1 -right-1 h-5 min-w-[20px] flex items-center justify-center p-0 px-1 text-[10px] font-bold"
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </Badge>
      )}
    </Button>
  );
}

/**
 * Compact variant for sidebars
 */
export function NotificationBadgeCompact(props: NotificationBadgeProps) {
  return <NotificationBadge {...props} size="sm" />;
}
