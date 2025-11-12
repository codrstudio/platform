/**
 * ChatHistory - Lista de mensagens com auto-scroll inteligente
 * Exibe histórico de conversas, loading indicator e botão scroll to bottom
 */

import type { Message } from '../../types'
import { ChatMessage } from './ChatMessage'
import { useAutoScroll } from '../../hooks/useAutoScroll'
import { ArrowDown } from 'lucide-react'
import { useMemo } from 'react'

interface ChatHistoryProps {
  messages: Message[]
  isLoading: boolean
  compact?: boolean // Modo compacto para chat flutuante
}

export function ChatHistory({ messages, isLoading, compact = false }: ChatHistoryProps) {
  // Dependência que muda durante o streaming (conteúdo da última mensagem)
  const scrollDependency = useMemo(() => {
    const lastMessage = messages[messages.length - 1]
    return `${messages.length}-${lastMessage?.content.length || 0}-${isLoading ? 1 : 0}`
  }, [messages, isLoading])

  const { ref: scrollRef, isAtBottom, scrollToBottom } = useAutoScroll(scrollDependency)

  return (
    <div className="relative py-6 space-y-2">
      {messages.length === 0 && !isLoading && (
        <div className="flex items-center justify-center min-h-[500px]">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-nic-accent-light/20 to-nic-accent-light/10 dark:from-nic-accent-dark/20 dark:to-nic-accent-dark/10 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-nic-accent-light dark:text-nic-accent-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Bem-vindo ao NIC Chat!
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Faça perguntas sobre o sistema, recursos e funcionalidades. Experimente as sugestões ao lado!
            </p>
          </div>
        </div>
      )}

      {messages.map(message => (
        <ChatMessage key={message.id} message={message} compact={compact} />
      ))}

      {isLoading && (
        <div className="flex gap-3 mb-4">
          <div className="flex-shrink-0 w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
            </svg>
          </div>
          <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-3 rounded-tl-sm">
            <div className="flex gap-1.5">
              <span className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>
          </div>
        </div>
      )}

      {/* Scroll anchor */}
      <div ref={scrollRef} />

      {/* Scroll to Bottom Button */}
      {!isAtBottom && messages.length > 0 && (
        <button
          onClick={scrollToBottom}
          aria-label="Rolar para o final"
          className="
            absolute bottom-4 right-4
            p-2.5 rounded-full
            bg-nic-accent-light dark:bg-nic-accent-dark text-white
            shadow-lg hover:shadow-xl
            transition-all duration-200
            hover:scale-110
            z-10
            animate-in fade-in slide-in-from-bottom-2
          "
        >
          <ArrowDown className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
