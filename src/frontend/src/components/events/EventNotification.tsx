// Event Notification Component
// Simple visual feedback for events

import { useEffect, useState } from 'react'
import { Bell, CheckCircle, AlertCircle, Info } from 'lucide-react'
import { useEvents } from '@/contexts/EventContext'
import type { PlatformEvent } from '@/types/event'

interface NotificationToast {
  id: string
  event: PlatformEvent
  timestamp: Date
}

/**
 * EventNotification Component
 *
 * Displays toast notifications for incoming events
 * SPEC-EV-FR-003: Display visual notification
 */
export function EventNotification() {
  const { lastEvent } = useEvents()
  const [toasts, setToasts] = useState<NotificationToast[]>([])

  useEffect(() => {
    if (lastEvent) {
      // Add new toast
      const toast: NotificationToast = {
        id: lastEvent.id,
        event: lastEvent,
        timestamp: new Date(),
      }

      setToasts((prev) => [...prev, toast])

      // Auto-remove after 5 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id))
      }, 5000)
    }
  }, [lastEvent])

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  if (toasts.length === 0) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  )
}

/**
 * Individual Toast Component
 */
function Toast({ toast, onClose }: { toast: NotificationToast; onClose: () => void }) {
  const { event } = toast

  const getIcon = () => {
    switch (event.type) {
      case 'notification':
        return <Bell className="h-5 w-5" />
      case 'task':
        return <AlertCircle className="h-5 w-5" />
      case 'job-completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'job-failed':
        return <AlertCircle className="h-5 w-5 text-red-500" />
      case 'job-progress':
        return <Info className="h-5 w-5 text-blue-500" />
      default:
        return <Bell className="h-5 w-5" />
    }
  }

  const getPriorityColor = () => {
    switch (event.priority) {
      case 'urgent':
        return 'border-l-red-500'
      case 'high':
        return 'border-l-orange-500'
      case 'normal':
        return 'border-l-blue-500'
      case 'low':
        return 'border-l-gray-500'
      default:
        return 'border-l-blue-500'
    }
  }

  return (
    <div
      className={`bg-white dark:bg-gray-800 border border-l-4 ${getPriorityColor()} rounded-lg shadow-lg p-4 flex items-start gap-3 animate-in slide-in-from-right duration-300`}
    >
      <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
        </p>
        {event.category && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{event.category}</p>
        )}
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          {new Date(event.timestamp).toLocaleTimeString()}
        </p>
      </div>
      <button
        onClick={onClose}
        className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
      >
        ×
      </button>
    </div>
  )
}
