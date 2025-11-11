import { Bot, X, Maximize2, Eraser } from 'lucide-react'
import { ChatHistory } from './ChatHistory'
import { ChatInput } from './ChatInput'
import { Message } from '@/types/chat'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

/**
 * Painel expandido do Chat Widget
 * Exibe histórico de mensagens e input em formato compacto
 * Suporta botão "Novo Chat" para reiniciar sessão
 */

interface ChatWidgetPanelProps {
  messages: Message[]
  isLoading: boolean
  onSend: (content: string) => Promise<void>
  onCancel: () => void
  onMinimize: () => void
  onNewChat?: () => void
}

export function ChatWidgetPanel({
  messages,
  isLoading,
  onSend,
  onCancel,
  onMinimize,
  onNewChat
}: ChatWidgetPanelProps) {
  const [isConfirmingNewChat, setIsConfirmingNewChat] = useState(false)
  const navigate = useNavigate()

  const handleOpenFullScreen = () => {
    onMinimize() // Minimiza o widget antes de navegar
    navigate('/chat')
  }

  const handleNewChat = () => {
    // Se já tem mensagens, pedir confirmação
    if (messages.length > 1 && !isConfirmingNewChat) {
      setIsConfirmingNewChat(true)
      setTimeout(() => setIsConfirmingNewChat(false), 3000) // Reset após 3s
      return
    }

    // Executar novo chat
    if (onNewChat) {
      onNewChat()
      setIsConfirmingNewChat(false)
    }
  }

  return (
    <div
      className="
        w-96 h-[75vh]
        bg-white dark:bg-nic-primary-dark
        rounded-2xl shadow-2xl
        flex flex-col overflow-hidden
        border border-gray-200 dark:border-gray-700
        animate-in slide-in-from-bottom-4 duration-300
      "
    >
      {/* Header */}
      <div
        className="
          flex items-center justify-between
          px-4 py-3
          bg-nic-accent-light dark:bg-nic-accent-dark
          text-white
          border-b border-nic-accent-light/80 dark:border-nic-accent-dark/80
        "
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">NIC Chat</h3>
            <p className="text-xs opacity-90">Núcleo de Inteligência</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Botão Novo Chat */}
          {onNewChat && messages.length > 1 && (
            <button
              onClick={handleNewChat}
              className={`
                p-2 rounded transition-colors
                focus:outline-none focus:ring-2 focus:ring-white/50
                ${isConfirmingNewChat
                  ? 'bg-red-600 hover:bg-red-700 animate-pulse'
                  : 'hover:bg-white/10'
                }
              `}
              title={isConfirmingNewChat ? 'Clique novamente para confirmar' : 'Novo Chat'}
              aria-label="Iniciar novo chat"
            >
              <Eraser className="w-4 h-4" />
            </button>
          )}

          {/* Botão para abrir em tela cheia */}
          <button
            onClick={handleOpenFullScreen}
            className="
              p-2 hover:bg-white/10
              rounded transition-colors
              focus:outline-none focus:ring-2 focus:ring-white/50
            "
            title="Abrir em tela cheia"
            aria-label="Abrir chat em tela cheia"
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          {/* Botão fechar */}
          <button
            onClick={onMinimize}
            className="
              p-2 hover:bg-white/10
              rounded transition-colors
              focus:outline-none focus:ring-2 focus:ring-white/50
            "
            title="Fechar"
            aria-label="Fechar chat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Chat History (scrollável) */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-100 dark:bg-nic-secondary-dark">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-4">
            <div className="w-16 h-16 rounded-full bg-nic-accent-light/20 dark:bg-nic-accent-dark/20 flex items-center justify-center mb-4">
              <Bot className="w-8 h-8 text-nic-accent-light dark:text-nic-accent-dark" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              NIC Chat
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Converse sobre recursos, funcionalidades e tire suas dúvidas sobre o sistema.
            </p>
          </div>
        ) : (
          <ChatHistory messages={messages} isLoading={isLoading} compact={true} />
        )}
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 dark:border-gray-700">
        <ChatInput
          onSend={onSend}
          onCancel={onCancel}
          isDisabled={isLoading}
          compact={true}
        />
      </div>
    </div>
  )
}
