/**
 * Editor Notification Provider
 *
 * Sistema de notificações para o editor.
 * Permite reportar erros e avisos sem travar o editor.
 *
 * Features:
 * - Notificações em tempo real
 * - Múltiplos níveis (error, warning, info, success)
 * - Auto-dismiss configurável
 * - Limite de notificações simultâneas
 * - Histórico de notificações
 *
 * @module homepage/components/editor
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { X, AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export type NotificationType = 'error' | 'warning' | 'info' | 'success'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  timestamp: number
  autoDismiss?: boolean
  dismissAfter?: number
}

interface NotificationContextValue {
  notifications: Notification[]
  notify: (
    type: NotificationType,
    title: string,
    message: string,
    options?: {
      autoDismiss?: boolean
      dismissAfter?: number
    }
  ) => void
  dismiss: (id: string) => void
  clear: () => void
}

const NotificationContext = createContext<NotificationContextValue | null>(null)

export function useEditorNotifications() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useEditorNotifications must be used within EditorNotificationProvider')
  }
  return context
}

interface EditorNotificationProviderProps {
  children: ReactNode
  maxNotifications?: number
}

export function EditorNotificationProvider({
  children,
  maxNotifications = 3,
}: EditorNotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const notify = useCallback(
    (
      type: NotificationType,
      title: string,
      message: string,
      options?: {
        autoDismiss?: boolean
        dismissAfter?: number
      }
    ) => {
      const id = `notification-${Date.now()}-${Math.random()}`
      const notification: Notification = {
        id,
        type,
        title,
        message,
        timestamp: Date.now(),
        autoDismiss: options?.autoDismiss ?? type !== 'error',
        dismissAfter: options?.dismissAfter ?? (type === 'error' ? 10000 : 5000),
      }

      setNotifications((prev) => {
        // Adicionar nova notificação
        const updated = [notification, ...prev]

        // Limitar número de notificações
        if (updated.length > maxNotifications) {
          return updated.slice(0, maxNotifications)
        }

        return updated
      })

      // Auto-dismiss se configurado
      if (notification.autoDismiss && notification.dismissAfter) {
        setTimeout(() => {
          setNotifications((prev) => prev.filter((n) => n.id !== id))
        }, notification.dismissAfter)
      }
    },
    [maxNotifications]
  )

  const dismiss = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  const clear = useCallback(() => {
    setNotifications([])
  }, [])

  const value: NotificationContextValue = {
    notifications,
    notify,
    dismiss,
    clear,
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationContainer notifications={notifications} onDismiss={dismiss} />
    </NotificationContext.Provider>
  )
}

/**
 * Container que renderiza as notificações
 */
function NotificationContainer({
  notifications,
  onDismiss,
}: {
  notifications: Notification[]
  onDismiss: (id: string) => void
}) {
  if (notifications.length === 0) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-[100] space-y-2 max-w-md">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onDismiss={() => onDismiss(notification.id)}
        />
      ))}
    </div>
  )
}

/**
 * Item individual de notificação
 */
function NotificationItem({
  notification,
  onDismiss,
}: {
  notification: Notification
  onDismiss: () => void
}) {
  const getIcon = () => {
    switch (notification.type) {
      case 'error':
        return <XCircle className="h-4 w-4" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />
      case 'success':
        return <CheckCircle className="h-4 w-4" />
      case 'info':
      default:
        return <Info className="h-4 w-4" />
    }
  }

  const getVariant = (): 'default' | 'destructive' => {
    return notification.type === 'error' ? 'destructive' : 'default'
  }

  return (
    <Alert variant={getVariant()} className="shadow-lg animate-in slide-in-from-right">
      <div className="flex items-start gap-2">
        {getIcon()}
        <div className="flex-1 min-w-0">
          <AlertTitle className="text-sm font-semibold">{notification.title}</AlertTitle>
          <AlertDescription className="text-xs mt-1">{notification.message}</AlertDescription>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 hover:bg-transparent"
          onClick={onDismiss}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </Alert>
  )
}
