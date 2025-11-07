// Connection Status Component
// Shows SSE connection state

import { Wifi, WifiOff, Loader2 } from 'lucide-react'
import { useEvents } from '@/contexts/EventContext'

/**
 * ConnectionStatus Component
 *
 * Visual indicator of SSE connection state
 */
export function ConnectionStatus() {
  const { connectionState, isConnected } = useEvents()

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
        return 'Reconectando...'
      case 'disconnected':
        return 'Desconectado'
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

  return (
    <div
      className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-3 py-2 rounded-lg border shadow-sm bg-white dark:bg-gray-800 ${getStatusColor()}`}
    >
      {getStatusIcon()}
      <span className="text-sm font-medium">{getStatusText()}</span>
    </div>
  )
}
