// components/FloatingActionStack.tsx
/**
 * Stack de Botões Flutuantes NIC (Material Design)
 *
 * FAB Principal:
 * - Fora de /chat: Chat NIC (abre widget, cor primária)
 * - Em /chat: Ajuda (sem ação, cor neutra)
 *
 * Speed Dial (expande no hover):
 * - Chat em Tela Cheia (não mostra em /chat)
 * - Índice da Jornada (condicional)
 * - Guia da Jornada (condicional)
 *
 * Padrão Material Design FAB com Speed Dial menu.
 */

import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { MessageSquare, List, Map, Maximize2, HelpCircle } from 'lucide-react'
import { useJourneyProgress } from '@/hooks/useJourneyProgress'
import { useNextStepWidget } from '@/contexts/NextStepWidgetContext'
import { JourneyIndexModal } from './gamification/JourneyIndexModal'
import { ChatWidgetPanel } from './chat/ChatWidgetPanel'
import { useChat } from '@/hooks/useChat'
import { useChatWidget, useGlobalChatMessage } from '@/hooks/useChatWidget'

export function FloatingActionStack() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showIndexModal, setShowIndexModal] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  const { progress, settings, undismissWidget } = useJourneyProgress()
  const { toggle: toggleWidget } = useNextStepWidget()
  const { messages, isLoading, sendMessage, cancelMessage, startNewChat, unreadInsightsCount, markInsightsAsRead } = useChat()
  const { isMinimized, setIsMinimized, toggleMinimize } = useChatWidget()
  const { registerListener, unregisterListener } = useGlobalChatMessage()
  const location = useLocation()
  const navigate = useNavigate()

  const isChatOpen = !isMinimized
  const isInChatPage = location.pathname === '/chat'

  // Detectar mobile (< 768px)
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)

    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Marcar insights como lidos quando expandir
  useEffect(() => {
    if (!isMinimized && unreadInsightsCount > 0) {
      markInsightsAsRead()
    }
  }, [isMinimized, unreadInsightsCount, markInsightsAsRead])

  // Registrar listener para mensagens globais
  useEffect(() => {
    const handleGlobalMessage = (message: string) => {
      setIsMinimized(false) // Expandir widget
      sendMessage(message) // Enviar mensagem
    }

    registerListener(handleGlobalMessage)
    return () => unregisterListener()
  }, [registerListener, unregisterListener, sendMessage, setIsMinimized])

  // Não renderizar em mobile
  if (isMobile) {
    return null
  }

  // Verificar se deve mostrar botão de índice
  const showIndexButton = settings.showProgressBar

  // Verificar se deve mostrar botão de toggle do guia
  const showGuideToggle = settings.showNextStepWidget

  // Handler para toggle do guia
  const handleToggleGuide = () => {
    // Se o widget foi dispensado, reabilitar antes de mostrar
    if (progress.widgetDismissed) {
      undismissWidget()
    }
    toggleWidget()
    setIsExpanded(false)
  }

  // Handler para abrir índice
  const handleOpenIndex = () => {
    setShowIndexModal(true)
    setIsExpanded(false)
  }

  // Handler para abrir chat em tela cheia
  const handleOpenFullScreen = () => {
    navigate('/chat')
    setIsExpanded(false)
  }

  return (
    <>
      {/* Painel do Chat (quando aberto) - não renderizar em /chat */}
      {isChatOpen && !isInChatPage && (
        <div className="fixed bottom-6 right-6 z-50">
          <ChatWidgetPanel
            messages={messages}
            isLoading={isLoading}
            onSend={sendMessage}
            onCancel={cancelMessage}
            onMinimize={() => setIsMinimized(true)}
            onNewChat={startNewChat}
          />
        </div>
      )}

      {/* Stack de FABs (quando minimizado OU em página /chat) */}
      {(!isChatOpen || isInChatPage) && (
        <div
          className="fixed bottom-6 right-6 z-50 flex flex-col-reverse items-end gap-3"
          onMouseEnter={() => setIsExpanded(true)}
          onMouseLeave={() => setIsExpanded(false)}
        >
          {/* FAB Principal - Chat NIC ou Ajuda */}
          <button
            onClick={isInChatPage ? undefined : toggleMinimize}
            className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 group relative ${
              isInChatPage
                ? 'bg-white dark:bg-nic-primary-dark hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                : 'bg-nic-accent-light dark:bg-nic-accent-dark hover:opacity-90 text-white'
            }`}
            aria-label={isInChatPage ? 'Menu de ajuda' : 'Abrir NIC Chat'}
          >
            {isInChatPage ? (
              <HelpCircle className="w-6 h-6" />
            ) : (
              <MessageSquare className="w-6 h-6" />
            )}

          {/* Badge de notificação (se houver) - não mostrar em /chat */}
          {!isExpanded && unreadInsightsCount > 0 && !isInChatPage && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
              <span className="text-xs font-bold text-white">{unreadInsightsCount}</span>
            </div>
          )}

          {/* Tooltip */}
          {!isExpanded && (
            <div className="absolute right-16 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
              <div className="bg-gray-900 dark:bg-gray-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg shadow-lg">
                {isInChatPage ? 'Menu de Ajuda' : 'NIC Chat'}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 w-0 h-0 border-t-4 border-b-4 border-l-4 border-transparent border-l-gray-900 dark:border-l-gray-700" />
              </div>
            </div>
          )}
        </button>

        {/* FAB Secundário 1 - Chat em Tela Cheia (não mostrar em /chat) */}
        {isExpanded && !isInChatPage && (
          <button
            onClick={handleOpenFullScreen}
            className="w-12 h-12 rounded-full bg-white dark:bg-nic-primary-dark shadow-lg flex items-center justify-center hover:scale-110 transition-all duration-200 animate-in zoom-in-50 slide-in-from-bottom-2"
            style={{ animationDelay: '50ms' }}
            aria-label="Abrir chat em tela cheia"
          >
            <Maximize2 className="w-5 h-5 text-nic-accent-light dark:text-nic-accent-dark" />

            {/* Label */}
            <div className="absolute right-14 bg-gray-900 dark:bg-gray-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap">
              Chat em Tela Cheia
              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 w-0 h-0 border-t-4 border-b-4 border-l-4 border-transparent border-l-gray-900 dark:border-l-gray-700" />
            </div>
          </button>
        )}

        {/* FAB Secundário 2 - Índice da Jornada */}
        {showIndexButton && isExpanded && (
          <button
            onClick={handleOpenIndex}
            className="w-12 h-12 rounded-full bg-white dark:bg-nic-primary-dark shadow-lg flex items-center justify-center hover:scale-110 transition-all duration-200 animate-in zoom-in-50 slide-in-from-bottom-2"
            style={{ animationDelay: '100ms' }}
            aria-label="Índice da jornada NIC"
          >
            <List className="w-5 h-5 text-nic-accent-light dark:text-nic-accent-dark" />

            {/* Badge de progresso */}
            <div className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-nic-accent-light dark:bg-nic-accent-dark text-white text-[10px] font-bold flex items-center justify-center shadow-md z-10">
              {Math.round(progress.completionPercentage)}
            </div>

            {/* Label */}
            <div className="absolute right-14 bg-gray-900 dark:bg-gray-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap">
              Índice da Jornada
              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 w-0 h-0 border-t-4 border-b-4 border-l-4 border-transparent border-l-gray-900 dark:border-l-gray-700" />
            </div>
          </button>
        )}

        {/* FAB Secundário 3 - Toggle Guia */}
        {showGuideToggle && isExpanded && (
          <button
            onClick={handleToggleGuide}
            className="w-12 h-12 rounded-full bg-white dark:bg-nic-primary-dark shadow-lg flex items-center justify-center hover:scale-110 transition-all duration-200 animate-in zoom-in-50 slide-in-from-bottom-2"
            style={{ animationDelay: '150ms' }}
            aria-label="Toggle guia da jornada"
          >
            <Map className="w-5 h-5 text-nic-accent-light dark:text-nic-accent-dark" />

            {/* Label */}
            <div className="absolute right-14 bg-gray-900 dark:bg-gray-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap">
              Guia da Jornada
              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 w-0 h-0 border-t-4 border-b-4 border-l-4 border-transparent border-l-gray-900 dark:border-l-gray-700" />
            </div>
          </button>
        )}
        </div>
      )}

      {/* Modal de Índice */}
      <JourneyIndexModal isOpen={showIndexModal} onClose={() => setShowIndexModal(false)} />
    </>
  )
}
