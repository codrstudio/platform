import { useState, useMemo } from 'react';
import { Bell, Check, Filter, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import { useNotifications } from '@/hooks/useSSE';
import { NotificationItem } from './NotificationItem';
import type { EventPriority } from '@/types/events';

/**
 * NotificationCenter Component
 *
 * Central notification panel with filtering and management
 * SPEC-EV-CO-005 to SPEC-EV-CO-008: Notification system
 * SPEC-EV-FR-003: Visual feedback for events
 *
 * Story 1.5.1: Real-time notification UI
 */

type FilterCategory = 'all' | 'info' | 'success' | 'warning' | 'error' | 'system';
type FilterPriority = 'all' | EventPriority;
type FilterRead = 'all' | 'unread' | 'read';

export function NotificationCenter() {
  const { notifications, clearNotifications } = useNotifications();
  const [readNotifications, setReadNotifications] = useState<Set<string>>(new Set());

  // Filters
  const [categoryFilter, setCategoryFilter] = useState<FilterCategory>('all');
  const [priorityFilter, setPriorityFilter] = useState<FilterPriority>('all');
  const [readFilter, setReadFilter] = useState<FilterRead>('all');

  // Handlers
  const handleMarkRead = (id: string) => {
    setReadNotifications((prev) => new Set([...prev, id]));
  };

  const handleMarkUnread = (id: string) => {
    setReadNotifications((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const handleDismiss = (id: string) => {
    setReadNotifications((prev) => new Set([...prev, id]));
  };

  const handleMarkAllRead = () => {
    setReadNotifications(new Set(notifications.map((n) => n.id)));
  };

  const handleClearAll = () => {
    clearNotifications();
    setReadNotifications(new Set());
  };

  // Filtered notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter((notif) => {
      // Category filter
      if (categoryFilter !== 'all' && notif.category !== categoryFilter) {
        return false;
      }

      // Priority filter
      if (priorityFilter !== 'all' && notif.priority !== priorityFilter) {
        return false;
      }

      // Read filter
      const isRead = readNotifications.has(notif.id);
      if (readFilter === 'unread' && isRead) {
        return false;
      }
      if (readFilter === 'read' && !isRead) {
        return false;
      }

      return true;
    });
  }, [notifications, categoryFilter, priorityFilter, readFilter, readNotifications]);

  // Stats
  const unreadCount = notifications.filter((n) => !readNotifications.has(n.id)).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-96">
        {/* Header */}
        <div className="flex items-center justify-between p-2">
          <DropdownMenuLabel className="p-0">Notifications</DropdownMenuLabel>
          <div className="flex items-center gap-1">
            {/* Filter Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8">
                  <Filter className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                <DropdownMenuSeparator />

                {/* Category */}
                <DropdownMenuLabel className="text-xs text-muted-foreground">
                  Category
                </DropdownMenuLabel>
                {(['all', 'info', 'success', 'warning', 'error', 'system'] as FilterCategory[]).map(
                  (cat) => (
                    <DropdownMenuCheckboxItem
                      key={cat}
                      checked={categoryFilter === cat}
                      onCheckedChange={() => setCategoryFilter(cat)}
                    >
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </DropdownMenuCheckboxItem>
                  )
                )}

                <DropdownMenuSeparator />

                {/* Priority */}
                <DropdownMenuLabel className="text-xs text-muted-foreground">
                  Priority
                </DropdownMenuLabel>
                {(['all', 'low', 'normal', 'high', 'urgent'] as FilterPriority[]).map((pri) => (
                  <DropdownMenuCheckboxItem
                    key={pri}
                    checked={priorityFilter === pri}
                    onCheckedChange={() => setPriorityFilter(pri)}
                  >
                    {pri.charAt(0).toUpperCase() + pri.slice(1)}
                  </DropdownMenuCheckboxItem>
                ))}

                <DropdownMenuSeparator />

                {/* Read Status */}
                <DropdownMenuLabel className="text-xs text-muted-foreground">
                  Status
                </DropdownMenuLabel>
                {(['all', 'unread', 'read'] as FilterRead[]).map((status) => (
                  <DropdownMenuCheckboxItem
                    key={status}
                    checked={readFilter === status}
                    onCheckedChange={() => setReadFilter(status)}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mark All Read */}
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                className="h-8 w-8"
                onClick={handleMarkAllRead}
                title="Mark all as read"
              >
                <Check className="h-4 w-4" />
              </Button>
            )}

            {/* Clear All */}
            {notifications.length > 0 && (
              <Button
                variant="ghost"
                className="h-8 w-8"
                onClick={handleClearAll}
                title="Clear all notifications"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <DropdownMenuSeparator />

        {/* Notification List */}
        {filteredNotifications.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <Bell className="h-12 w-12 mx-auto mb-2 opacity-20" />
            <p className="text-sm">No notifications</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="p-2 space-y-2">
              {filteredNotifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  read={readNotifications.has(notification.id)}
                  onMarkRead={handleMarkRead}
                  onMarkUnread={handleMarkUnread}
                  onDismiss={handleDismiss}
                />
              ))}
            </div>
          </ScrollArea>
        )}

        {/* Footer */}
        {filteredNotifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="p-2 text-xs text-center text-muted-foreground">
              {filteredNotifications.length} of {notifications.length} notifications
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
