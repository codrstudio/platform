/**
 * NotificationItem Component
 *
 * Item individual de notificação com preview e ações.
 *
 * SPEC Compliance:
 * - SPEC-NOTIF-UI-007: Preview com ícone, título, timestamp, indicador
 * - SPEC-NOTIF-F-006: Clicar marca como lida
 * - SPEC-NOTIF-O-017 to O-019: Ações inline opcionais
 */

import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Bell, AlertCircle, Info, CheckCircle, Trophy, X, Archive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Notification } from '../types';

export interface NotificationItemProps {
  notification: Notification;
  onRead?: (id: string) => void;
  onDelete?: (id: string) => void;
  onArchive?: (id: string) => void;
  onClick?: (notification: Notification) => void;
  showActions?: boolean;
  compact?: boolean;
  className?: string;
}

/**
 * Get icon for notification category
 */
function getCategoryIcon(category: string) {
  const icons: Record<string, React.ReactNode> = {
    system_info: <Info className="h-4 w-4" />,
    batch_processing: <CheckCircle className="h-4 w-4" />,
    user_action: <Bell className="h-4 w-4" />,
    milestone: <Trophy className="h-4 w-4" />,
    alert: <AlertCircle className="h-4 w-4" />
  };

  return icons[category] || <Bell className="h-4 w-4" />;
}

/**
 * Get color classes for priority
 * SPEC-NOTIF-T-003
 */
function getPriorityClasses(priority: string, read: boolean) {
  if (read) {
    return 'text-muted-foreground';
  }

  const classes: Record<string, string> = {
    low: 'text-blue-600 dark:text-blue-400',
    normal: 'text-foreground',
    high: 'text-orange-600 dark:text-orange-400'
  };

  return classes[priority] || classes.normal;
}

/**
 * NotificationItem component
 */
export function NotificationItem({
  notification,
  onRead,
  onDelete,
  onArchive,
  onClick,
  showActions = false,
  compact = false,
  className
}: NotificationItemProps) {
  const { id, category, priority, timestamp, read, data } = notification;
  const { title, message, url } = data;

  const handleClick = () => {
    // SPEC-NOTIF-F-006: Mark as read on click
    if (!read && onRead) {
      onRead(id);
    }

    if (onClick) {
      onClick(notification);
    } else if (url) {
      window.location.href = url;
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) onDelete(id);
  };

  const handleArchive = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onArchive) onArchive(id);
  };

  // Format relative time
  const relativeTime = formatDistanceToNow(new Date(timestamp), {
    addSuffix: true,
    locale: ptBR
  });

  const priorityClasses = getPriorityClasses(priority, read);

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-3 rounded-lg transition-colors cursor-pointer',
        'hover:bg-accent',
        !read && 'bg-accent/50',
        className
      )}
      onClick={handleClick}
    >
      {/* Icon (SPEC-NOTIF-UI-007) */}
      <div className={cn('flex-shrink-0 mt-0.5', priorityClasses)}>
        {data.icon ? (
          <img src={data.icon} alt="" className="h-4 w-4" />
        ) : (
          getCategoryIcon(category)
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1">
        {/* Title */}
        {title && (
          <p className={cn(
            'text-sm font-medium leading-none',
            read ? 'text-muted-foreground' : 'text-foreground'
          )}>
            {title}
          </p>
        )}

        {/* Message */}
        {!compact && message && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {message}
          </p>
        )}

        {/* Timestamp (SPEC-NOTIF-UI-007) */}
        <p className="text-xs text-muted-foreground">
          {relativeTime}
        </p>

        {/* Inline actions (SPEC-NOTIF-O-017 to O-019) */}
        {!compact && data.actions && data.actions.length > 0 && (
          <div className="flex gap-2 mt-2">
            {data.actions.map((action: any) => (
              <Button
                key={action.id}
                size="sm"
                variant={action.variant || 'default'}
                onClick={(e) => {
                  e.stopPropagation();
                  // TODO: Handle action
                  console.log('Action:', action);
                }}
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Unread indicator */}
      {!read && (
        <div className="flex-shrink-0">
          <div className="h-2 w-2 rounded-full bg-primary" />
        </div>
      )}

      {/* Actions (SPEC-NOTIF-F-013, SPEC-NOTIF-O-014) */}
      {showActions && (
        <div className="flex-shrink-0 flex items-center gap-1">
          {onArchive && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleArchive}
              aria-label="Arquivar"
            >
              <Archive className="h-4 w-4" />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleDelete}
              aria-label="Excluir"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
