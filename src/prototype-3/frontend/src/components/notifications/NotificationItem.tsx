import { formatDistanceToNow } from 'date-fns';
import {
  Info,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Bell,
  X,
  Circle,
  CheckCheck,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { NotificationEvent, EventPriority } from '@/types/events';

/**
 * NotificationItem Component
 *
 * Displays a single notification with visual indicators
 * SPEC-EV-CO-005 to SPEC-EV-CO-008: Notification display
 * SPEC-EV-PL-007: Priority visual indicators
 * SPEC-EV-PL-006: Category badges
 */

interface NotificationItemProps {
  notification: NotificationEvent;
  read?: boolean;
  onDismiss?: (id: string) => void;
  onMarkRead?: (id: string) => void;
  onMarkUnread?: (id: string) => void;
  compact?: boolean;
}

const priorityConfig: Record<
  EventPriority,
  { color: string; icon: typeof AlertCircle; label: string }
> = {
  low: {
    color: 'text-gray-500',
    icon: Info,
    label: 'Low',
  },
  normal: {
    color: 'text-blue-500',
    icon: Bell,
    label: 'Normal',
  },
  high: {
    color: 'text-orange-500',
    icon: AlertTriangle,
    label: 'High',
  },
  urgent: {
    color: 'text-red-500',
    icon: AlertCircle,
    label: 'Urgent',
  },
};

const categoryConfig: Record<
  string,
  { variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: typeof Info }
> = {
  info: { variant: 'default', icon: Info },
  success: { variant: 'default', icon: CheckCircle2 },
  warning: { variant: 'outline', icon: AlertTriangle },
  error: { variant: 'destructive', icon: AlertCircle },
  system: { variant: 'secondary', icon: Bell },
};

export function NotificationItem({
  notification,
  read = false,
  onDismiss,
  onMarkRead,
  onMarkUnread,
  compact = false,
}: NotificationItemProps) {
  const priority = notification.priority || 'normal';
  const category = notification.category || 'info';

  const priorityData = priorityConfig[priority];
  const categoryData = categoryConfig[category] || categoryConfig.info;

  const PriorityIcon = priorityData.icon;
  const CategoryIcon = categoryData.icon;

  const timestamp = new Date(notification.timestamp);
  const timeAgo = formatDistanceToNow(timestamp, { addSuffix: true });

  if (compact) {
    return (
      <div
        className={cn(
          'flex items-center gap-2 p-2 rounded-md hover:bg-accent transition-colors',
          !read && 'bg-accent/50'
        )}
      >
        <CategoryIcon className={cn('h-4 w-4', priorityData.color)} />
        <div className="flex-1 min-w-0">
          <p className="text-sm truncate">{notification.id}</p>
          <p className="text-xs text-muted-foreground">{timeAgo}</p>
        </div>
        {!read && <Circle className="h-2 w-2 fill-blue-500 text-blue-500" />}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex gap-3 p-4 rounded-lg border transition-colors',
        !read && 'bg-accent/50 border-accent',
        read && 'hover:bg-accent/20'
      )}
    >
      {/* Priority Icon */}
      <div className="flex-shrink-0">
        <div className={cn('p-2 rounded-full bg-accent')}>
          <PriorityIcon className={cn('h-5 w-5', priorityData.color)} />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-2">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <Badge variant={categoryData.variant}>{category}</Badge>
            {priority !== 'normal' && (
              <Badge variant="outline" className={priorityData.color}>
                {priorityData.label}
              </Badge>
            )}
          </div>
          {!read && (
            <Circle className="h-2 w-2 fill-blue-500 text-blue-500 mt-1 flex-shrink-0" />
          )}
        </div>

        {/* Notification ID/Message */}
        <div>
          <p className="text-sm font-medium break-words">{notification.id}</p>
          <p className="text-xs text-muted-foreground">{timeAgo}</p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {!read && onMarkRead && (
            <Button
              variant="ghost"
              onClick={() => onMarkRead(notification.id)}
              className="h-7 px-2 py-1 text-xs"
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              Mark as read
            </Button>
          )}
          {read && onMarkUnread && (
            <Button
              variant="ghost"
              onClick={() => onMarkUnread(notification.id)}
              className="h-7 px-2 py-1 text-xs"
            >
              <Circle className="h-3 w-3 mr-1" />
              Mark as unread
            </Button>
          )}
          {onDismiss && (
            <Button
              variant="ghost"
              onClick={() => onDismiss(notification.id)}
              className="h-7 px-2 py-1 text-xs"
            >
              <X className="h-3 w-3 mr-1" />
              Dismiss
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
