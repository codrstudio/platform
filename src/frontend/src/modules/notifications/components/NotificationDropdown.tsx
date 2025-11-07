/**
 * NotificationDropdown Component
 *
 * Dropdown de acesso rápido às notificações recentes.
 *
 * SPEC Compliance:
 * - SPEC-NOTIF-UI-005: Dropdown de acesso rápido
 * - SPEC-NOTIF-UI-006: Últimas N notificações
 * - SPEC-NOTIF-UI-007: Preview de cada notificação
 * - SPEC-NOTIF-UI-008: Link "Ver todas"
 * - SPEC-NOTIF-UI-009: Ação "Marcar todas como lidas"
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Loader2, Check, Inbox } from 'lucide-react';
import { NotificationBadge } from './NotificationBadge';
import { NotificationItem } from './NotificationItem';
import { useNotifications } from '../hooks/useNotifications';
import type { NotificationModuleConfig } from '../types';

export interface NotificationDropdownProps {
  config?: Partial<NotificationModuleConfig>;
  notificationsPageUrl?: string;
  className?: string;
}

/**
 * NotificationDropdown component
 *
 * Usage:
 * ```tsx
 * <NotificationDropdown
 *   config={instanceConfig}
 *   notificationsPageUrl="/notifications"
 * />
 * ```
 */
export function NotificationDropdown({
  config,
  notificationsPageUrl = '/notifications',
  className
}: NotificationDropdownProps) {
  const [_open, setOpen] = useState(false);

  const {
    recentNotifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    isMarkingAsRead
  } = useNotifications(config);

  const hasNotifications = recentNotifications.length > 0;
  const hasUnread = unreadCount > 0;

  return (
    <DropdownMenu>
      {/* Trigger - Badge with icon (SPEC-NOTIF-UI-001 to UI-004) */}
      <DropdownMenuTrigger asChild>
        <div>
          <NotificationBadge
            unreadCount={unreadCount}
            className={className}
          />
        </div>
      </DropdownMenuTrigger>

      {/* Dropdown content (SPEC-NOTIF-UI-005) */}
      <DropdownMenuContent align="end" className="w-80">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="font-semibold text-sm">Notificações</h3>

          {/* Mark all as read button (SPEC-NOTIF-UI-009) */}
          {hasUnread && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAllAsRead()}
              disabled={isMarkingAsRead}
              className="h-8 text-xs"
            >
              {isMarkingAsRead ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <>
                  <Check className="h-3 w-3 mr-1" />
                  Marcar todas
                </>
              )}
            </Button>
          )}
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !hasNotifications && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Inbox className="h-12 w-12 text-muted-foreground/50 mb-2" />
            <p className="text-sm font-medium">Nenhuma notificação</p>
            <p className="text-xs text-muted-foreground mt-1">
              Você está em dia!
            </p>
          </div>
        )}

        {/* Notification list (SPEC-NOTIF-UI-006 to UI-007) */}
        {!isLoading && hasNotifications && (
          <div className="max-h-[400px] overflow-y-auto">
            {recentNotifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onRead={markAsRead}
                onDelete={deleteNotification}
                onClick={() => setOpen(false)}
                compact
              />
            ))}
          </div>
        )}

        {/* Footer with "View all" link (SPEC-NOTIF-UI-008) */}
        {hasNotifications && (
          <>
            <DropdownMenuSeparator />
            <div className="p-2">
              <Link to={notificationsPageUrl}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-center"
                  onClick={() => setOpen(false)}
                >
                  Ver todas
                </Button>
              </Link>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
