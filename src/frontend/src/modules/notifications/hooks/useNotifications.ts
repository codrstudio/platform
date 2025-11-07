/**
 * useNotifications Hook
 *
 * Hook para gerenciamento de notificações com integração SSE e JQEL.
 *
 * SPEC Compliance:
 * - SPEC-NOTIF-F-001: Escuta Canal de Eventos (SSE)
 * - SPEC-NOTIF-F-002: Processa eventos de notificação
 * - SPEC-NOTIF-F-003: Armazena via JQEL
 * - SPEC-NOTIF-F-009 to F-012: Busca de notificações
 */

import { useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEvents } from '@/contexts/EventContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { Notification, NotificationFilters, NotificationModuleConfig } from '../types';
import type { NotificationEvent } from '@/types/event';

const DEFAULT_CONFIG: NotificationModuleConfig = {
  dataSource: {
    schema: 'platform',
    entity: 'notifications'
  },
  ui: {
    dropdownLimit: 5,
    pageSize: 20,
    showToast: true,
    toastDuration: 5000,
    playSound: false,
    soundFile: '/sounds/notification.mp3',
    enableBrowserNotifications: false
  },
  features: {
    enableSearch: true,
    enableFilters: true,
    enableGrouping: false,
    enableArchive: false,
    enableInlineActions: false
  }
};

/**
 * Fetch notifications from JQEL
 * SPEC-NOTIF-F-009 to F-012
 */
async function fetchNotifications(
  _userId: string,
  _config: NotificationModuleConfig,
  _filters?: NotificationFilters
): Promise<Notification[]> {
  // TODO: Implement JQEL query
  // For now, return mock data
  return [];
}

/**
 * Mark notification as read
 * SPEC-NOTIF-F-005 to F-008
 */
async function markAsRead(
  notificationId: string,
  _config: NotificationModuleConfig
): Promise<void> {
  // TODO: Implement JQEL mutation
  console.log('Mark as read:', notificationId);
}

/**
 * Mark all notifications as read
 * SPEC-NOTIF-F-007 to F-008
 */
async function markAllAsRead(
  userId: string,
  _config: NotificationModuleConfig
): Promise<void> {
  // TODO: Implement JQEL mutation
  console.log('Mark all as read for user:', userId);
}

/**
 * Delete notification
 * SPEC-NOTIF-F-013 to F-015
 */
async function deleteNotification(
  notificationId: string,
  _config: NotificationModuleConfig
): Promise<void> {
  // TODO: Implement JQEL mutation
  console.log('Delete notification:', notificationId);
}

/**
 * Archive notification
 * SPEC-NOTIF-O-014 to O-016
 */
async function archiveNotification(
  notificationId: string,
  _config: NotificationModuleConfig
): Promise<void> {
  // TODO: Implement JQEL mutation
  console.log('Archive notification:', notificationId);
}

/**
 * useNotifications Hook
 */
export function useNotifications(
  config: Partial<NotificationModuleConfig> = {},
  filters?: NotificationFilters
) {
  const { user } = useAuth();
  const { lastEvent } = useEvents();
  const queryClient = useQueryClient();

  const fullConfig: NotificationModuleConfig = {
    ...DEFAULT_CONFIG,
    ...config,
    dataSource: { ...DEFAULT_CONFIG.dataSource, ...config.dataSource },
    ui: { ...DEFAULT_CONFIG.ui, ...config.ui },
    features: { ...DEFAULT_CONFIG.features, ...config.features }
  };

  const userId = user?.id ? String(user.id) : null;

  // Fetch notifications (SPEC-NOTIF-F-009 to F-012)
  const {
    data: notifications = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['notifications', userId, filters],
    queryFn: () => fetchNotifications(userId!, fullConfig, filters),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5 // 5 minutes
  });

  // Mark as read mutation (SPEC-NOTIF-F-005 to F-008)
  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: string) => markAsRead(notificationId, fullConfig),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  // Mark all as read mutation (SPEC-NOTIF-F-007 to F-008)
  const markAllAsReadMutation = useMutation({
    mutationFn: () => markAllAsRead(userId!, fullConfig),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  // Delete mutation (SPEC-NOTIF-F-013 to F-015)
  const deleteMutation = useMutation({
    mutationFn: (notificationId: string) => deleteNotification(notificationId, fullConfig),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  // Archive mutation (SPEC-NOTIF-O-014 to O-016)
  const archiveMutation = useMutation({
    mutationFn: (notificationId: string) => archiveNotification(notificationId, fullConfig),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  // Listen to SSE events (SPEC-NOTIF-F-001 to F-004)
  useEffect(() => {
    if (!lastEvent || lastEvent.type !== 'notification') return;

    const notifEvent = lastEvent as NotificationEvent;

    // Only process events for current user
    if (notifEvent.userId !== userId) return;

    // Show toast (SPEC-NOTIF-O-001 to O-004)
    if (fullConfig.ui.showToast) {
      const title = (notifEvent.data as any)?.title || 'Nova notificação';
      const message = (notifEvent.data as any)?.message || '';

      toast(title, {
        description: message,
        duration: fullConfig.ui.toastDuration,
        action: (notifEvent.data as any)?.url ? {
          label: 'Ver',
          onClick: () => {
            window.location.href = (notifEvent.data as any).url;
          }
        } : undefined
      });
    }

    // Play sound (SPEC-NOTIF-O-005 to O-007)
    if (fullConfig.ui.playSound) {
      const audio = new Audio(fullConfig.ui.soundFile);
      audio.play().catch(console.error);
    }

    // Browser notification (SPEC-NOTIF-O-008 to O-010)
    if (fullConfig.ui.enableBrowserNotifications && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        const title = (notifEvent.data as any)?.title || 'Nova notificação';
        const body = (notifEvent.data as any)?.message || '';
        new Notification(title, { body });
      }
    }

    // Invalidate queries to fetch new notification (SPEC-NOTIF-F-004)
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
  }, [lastEvent, userId, fullConfig, queryClient]);

  // Calculate unread count
  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  // Get recent notifications for dropdown (SPEC-NOTIF-UI-006)
  const recentNotifications = useMemo(() => {
    return notifications
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, fullConfig.ui.dropdownLimit);
  }, [notifications, fullConfig.ui.dropdownLimit]);

  return {
    notifications,
    recentNotifications,
    unreadCount,
    isLoading,
    error,
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    deleteNotification: deleteMutation.mutate,
    archiveNotification: archiveMutation.mutate,
    isMarkingAsRead: markAsReadMutation.isPending,
    isDeleting: deleteMutation.isPending
  };
}

/**
 * Request browser notification permission
 * SPEC-NOTIF-O-009
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}
