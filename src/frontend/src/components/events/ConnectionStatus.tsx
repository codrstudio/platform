// Connection Status Component
// Shows SSE connection state

import { Wifi, WifiOff, Loader2 } from 'lucide-react'
import { useEvents } from '@/contexts/EventContext'
import { sseClient } from '@/services/sseClient'

/**
 * ConnectionStatus Component
 *
 * Visual indicator of SSE connection state
 */
export function ConnectionStatus() {
  const { connectionState, isConnected } = useEvents()

  // Get reconnect attempt info
  const reconnectAttempts = sseClient.getReconnectAttempts()
  const maxReconnectAttempts = sseClient.getMaxReconnectAttempts()

  const getStatusIcon = () => {
    switch (connectionState) {
      case 'connected':
        return <Wifi className="h-4 w-4 text-green-500" />
      case 'connecting':
      case 'reconnecting':
        return <Loader2 className="h-4 w-4 text-yellow-500 animate-spin" />
      case 'disconnected':
        return <WifiOff className="h-4 w-4 text-red-500" />
      default:
        return <WifiOff className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusText = () => {
    switch (connectionState) {
      case 'connected':
        return 'Conectado'
      case 'connecting':
        return 'Conectando...'
      case 'reconnecting':
        return `Reconectando (${reconnectAttempts}/${maxReconnectAttempts})...`
      case 'disconnected':
        return reconnectAttempts >= maxReconnectAttempts
          ? `Desconectado (${maxReconnectAttempts} tentativas)`
          : 'Desconectado'
      default:
        return 'Desconhecido'
    }
  }

  const getStatusColor = () => {
    switch (connectionState) {
      case 'connected':
        return 'text-green-600 dark:text-green-400'
      case 'connecting':
      case 'reconnecting':
        return 'text-yellow-600 dark:text-yellow-400'
      case 'disconnected':
        return 'text-red-600 dark:text-red-400'
      default:
        return 'text-gray-600 dark:text-gray-400'
    }
  }

  // Only show when not connected (or show always in dev)
  if (isConnected && import.meta.env.MODE !== 'development') {
    return null
  }

  // Increase size and contrast when disconnected for better visibility
  const sizeClass =
    connectionState === 'disconnected' ? 'px-4 py-2.5' : 'px-3 py-2'
  const borderClass =
    connectionState === 'disconnected'
      ? 'border-2 border-red-500 dark:border-red-400'
      : 'border'

  return (
    <div
      className={`group fixed top-4 right-4 z-50 flex items-center gap-0 group-hover:gap-2 ${sizeClass} rounded-lg ${borderClass} shadow-sm bg-white dark:bg-gray-800 ${getStatusColor()} transition-all duration-300 hover:gap-2`}
    >
      {getStatusIcon()}
      <span className="text-sm font-medium overflow-hidden whitespace-nowrap opacity-0 max-w-0 group-hover:opacity-100 group-hover:max-w-xs transition-all duration-300 ease-in-out">
        {getStatusText()}
      </span>
    </div>
  )
}
