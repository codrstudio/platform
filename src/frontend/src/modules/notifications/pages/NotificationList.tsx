/**
 * NotificationList Page
 *
 * Página completa de listagem de notificações com filtros e busca.
 *
 * SPEC Compliance:
 * - SPEC-NOTIF-UI-010: Página de listagem completa
 * - SPEC-NOTIF-UI-011: Lista todas as notificações
 * - SPEC-NOTIF-UI-012: Filtros (categoria, prioridade, status, período)
 * - SPEC-NOTIF-UI-013: Paginação ou scroll infinito
 * - SPEC-NOTIF-UI-014: Busca por texto
 */

import { useState } from 'react';
import { Search, Filter, Loader2, Inbox, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageBreadcrumb } from '@/components/navigation';
import { useBreadcrumb } from '@/hooks/useBreadcrumb';
import { NotificationItem } from '../components/NotificationItem';
import { useNotifications } from '../hooks/useNotifications';
import type { NotificationFilters, NotificationModuleConfig } from '../types';

export interface NotificationListProps {
  config?: Partial<NotificationModuleConfig>;
  portalId?: string;
  moduleId?: string;
}

/**
 * NotificationList page
 */
export function NotificationList({
  config,
  portalId
}: NotificationListProps) {
  const [filters, setFilters] = useState<NotificationFilters>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Breadcrumb
  const breadcrumbItems = useBreadcrumb({
    portalId,
    moduleName: 'Notificações'
  });

  // Fetch notifications with filters
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    archiveNotification,
    isMarkingAsRead
  } = useNotifications(config, {
    ...filters,
    search: searchQuery || undefined
  });

  const hasNotifications = notifications.length > 0;
  const hasUnread = unreadCount > 0;

  // Filter by search query (client-side filtering for now)
  const filteredNotifications = searchQuery
    ? notifications.filter(n =>
        n.data.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.data.message?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : notifications;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Breadcrumb */}
      <PageBreadcrumb items={breadcrumbItems} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notificações</h1>
          <p className="text-muted-foreground mt-1">
            {hasUnread ? `${unreadCount} não lidas` : 'Todas as notificações lidas'}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {hasUnread && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => markAllAsRead()}
              disabled={isMarkingAsRead}
            >
              {isMarkingAsRead ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Check className="h-4 w-4 mr-2" />
              )}
              Marcar todas como lidas
            </Button>
          )}
        </div>
      </div>

      {/* Search and Filters (SPEC-NOTIF-UI-012, SPEC-NOTIF-UI-014) */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar notificações..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {config?.features?.enableFilters && (
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Filter Panel */}
      {showFilters && config?.features?.enableFilters && (
        <div className="border rounded-lg p-4 space-y-4">
          <h3 className="font-medium text-sm">Filtros</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Category Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">Categoria</label>
              <select
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
                value={filters.category as string || ''}
                onChange={(e) => setFilters({ ...filters, category: e.target.value || undefined })}
              >
                <option value="">Todas</option>
                <option value="system_info">Informações</option>
                <option value="batch_processing">Processamento</option>
                <option value="user_action">Ações de Usuário</option>
                <option value="milestone">Marcos</option>
                <option value="alert">Alertas</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">Prioridade</label>
              <select
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
                value={filters.priority as string || ''}
                onChange={(e) => setFilters({ ...filters, priority: e.target.value as any || undefined })}
              >
                <option value="">Todas</option>
                <option value="low">Baixa</option>
                <option value="normal">Normal</option>
                <option value="high">Alta</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <select
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
                value={filters.status || ''}
                onChange={(e) => setFilters({ ...filters, status: e.target.value as any || undefined })}
              >
                <option value="">Todas</option>
                <option value="unread">Não lidas</option>
                <option value="read">Lidas</option>
                {config?.features?.enableArchive && (
                  <option value="archived">Arquivadas</option>
                )}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilters({})}
            >
              Limpar filtros
            </Button>
          </div>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !hasNotifications && (
        <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg">
          <Inbox className="h-16 w-16 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold mb-1">Nenhuma notificação</h3>
          <p className="text-sm text-muted-foreground">
            {searchQuery || Object.keys(filters).length > 0
              ? 'Nenhuma notificação encontrada com os filtros aplicados'
              : 'Você não tem notificações no momento'}
          </p>
        </div>
      )}

      {/* Notification List (SPEC-NOTIF-UI-011) */}
      {!isLoading && hasNotifications && (
        <div className="space-y-2">
          {filteredNotifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onRead={markAsRead}
              onDelete={deleteNotification}
              onArchive={config?.features?.enableArchive ? archiveNotification : undefined}
              showActions
            />
          ))}
        </div>
      )}

      {/* TODO: Pagination (SPEC-NOTIF-UI-013) */}
      {filteredNotifications.length > 0 && (
        <div className="flex justify-center pt-4">
          <p className="text-sm text-muted-foreground">
            Mostrando {filteredNotifications.length} notificações
          </p>
        </div>
      )}
    </div>
  );
}
