import { useEffect } from 'react'
import { PenSquare } from 'lucide-react'
import { ChatHistory } from '@/components/chat/ChatHistory'
import { ChatInput } from '@/components/chat/ChatInput'
import { SuggestedQuestions } from '@/components/chat/SuggestedQuestions'
import { AgentModelSelector } from '@/components/unified/AgentModelSelector'
import { useChat } from '@/hooks/useChat'
import { useModels } from '@/hooks/useModels'
import { useAgents } from '@/hooks/useAgents'
import { SUGGESTED_QUESTIONS } from '@/services/chatService'

/**
 * Página Chat - Interface Moderna (estilo ChatGPT)
 * Layout: Container centralizado (max-width) + Painel lateral de sugestões
 */

export function Chat() {
  const { messages, isLoading, selectedAgent, setSelectedProvider, setSelectedModel, setSelectedAgent, sendMessage, cancelMessage, startNewChat } = useChat()
  const { models, modelsByProvider, selectedModel, selectedProvider, selectModel, getProviderName } = useModels()
  const { availableAgents, selectAgent } = useAgents()

  // Sincronizar modelo e provedor selecionados com o ChatContext
  useEffect(() => {
    if (selectedModel && selectedProvider) {
      setSelectedModel(selectedModel)
      setSelectedProvider(selectedProvider)
    } else {
      setSelectedModel(null)
      setSelectedProvider(null)
    }
  }, [selectedModel, selectedProvider, setSelectedModel, setSelectedProvider])

  // Sincronizar agente selecionado do useAgents com ChatContext
  useEffect(() => {
    if (availableAgents.length > 0 && !selectedAgent) {
      // Se nenhum agente está selecionado, selecionar o primeiro disponível
      setSelectedAgent(availableAgents[0])
    }
  }, [availableAgents, selectedAgent, setSelectedAgent])

  // Handler para mudança de agente
  const handleAgentChange = (agent: any) => {
    selectAgent(agent)
    setSelectedAgent(agent)
  }

  return (
    <div className="flex h-full bg-gray-100 dark:bg-nic-primary-dark">
      {/* Container Principal - Centralizado com max-width */}
      <div className="flex-1 flex flex-col items-center">
        <div className="w-full max-w-4xl flex flex-col h-full">
          {/* Barra Superior - AgentModelSelector + Botão Novo Chat */}
          <div className="flex-shrink-0 px-4 pt-4 pb-2">
            <div className="grid grid-cols-[1fr_auto] items-center gap-3">
              {/* AgentModelSelector Unificado */}
              <div className="min-w-0">
                <AgentModelSelector
                  agents={availableAgents}
                  selectedAgent={selectedAgent}
                  onSelectAgent={handleAgentChange}
                  models={models}
                  modelsByProvider={modelsByProvider}
                  selectedModel={selectedModel}
                  onSelectModel={selectModel}
                  getProviderName={getProviderName}
                  disabled={isLoading}
                />
              </div>

              {/* Botão Novo Chat */}
              <button
                onClick={startNewChat}
                disabled={isLoading}
                className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                title="Novo chat"
              >
                <PenSquare className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Área de Chat Integrada - COM SCROLL */}
          <div className="flex-1 overflow-y-auto px-4">
            <ChatHistory
              messages={messages}
              isLoading={isLoading}
            />
          </div>

          {/* Input de Chat - Integrado sem separação visual */}
          <div className="flex-shrink-0 px-4 py-4 bg-gray-100 dark:bg-nic-primary-dark">
            <ChatInput
              onSend={sendMessage}
              onCancel={cancelMessage}
              isDisabled={isLoading || !selectedModel}
            />

            {!selectedModel && (
              <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-2 text-center">
                ⚠️ Nenhum modelo disponível. Configure as API keys no arquivo .env
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Painel Lateral: Sugestões de Perguntas */}
      <div className="hidden lg:block w-80 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-nic-secondary-dark overflow-auto">
        <SuggestedQuestions
          questions={SUGGESTED_QUESTIONS}
          onSelect={sendMessage}
          isDisabled={isLoading || !selectedModel}
        />
      </div>
    </div>
  )
}
