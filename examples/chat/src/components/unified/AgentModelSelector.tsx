/**
 * AgentModelSelector - Seletor unificado de Agente e Modelo
 * Combina seleção de agente e modelo de IA em um único dropdown com grupos
 */

import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, Check, Info } from 'lucide-react'
import { AgentIcon } from '@/components/chat/AgentIcon'
import type { Agent } from '@/types/agent'
import type { AIModel } from '@/types/provider'

interface AgentModelSelectorProps {
  // Agentes
  agents: Agent[]
  selectedAgent: Agent | null
  onSelectAgent: (agent: Agent) => void

  // Modelos
  models: AIModel[]
  modelsByProvider: Record<string, AIModel[]>
  selectedModel: AIModel | null
  onSelectModel: (model: AIModel) => void
  getProviderName: (providerId: string) => string

  // Estado
  disabled?: boolean
}

export function AgentModelSelector({
  agents,
  selectedAgent,
  onSelectAgent,
  models,
  modelsByProvider,
  selectedModel,
  onSelectModel,
  getProviderName,
  disabled = false
}: AgentModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleSelectAgent = (agent: Agent) => {
    onSelectAgent(agent)
    setIsOpen(false)
  }

  const handleSelectModel = (model: AIModel) => {
    onSelectModel(model)
    setIsOpen(false)
  }

  // Verificar se agente selecionado usa endpoint próprio
  const agentUsesOwnEndpoint = selectedAgent?.endpoint !== undefined

  // Mensagens de erro
  if (agents.length === 0 && models.length === 0) {
    return (
      <div className="px-3 py-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <p className="text-xs text-yellow-800 dark:text-yellow-200">
          ⚠️ Nenhum agente ou modelo disponível
        </p>
      </div>
    )
  }

  if (!selectedAgent && !selectedModel) {
    return null
  }

  // Texto do botão para tooltip
  const buttonText = selectedAgent && selectedModel && !agentUsesOwnEndpoint
    ? `${selectedAgent.title} • ${selectedModel.name}`
    : selectedAgent
    ? `${selectedAgent.title}`
    : selectedModel
    ? selectedModel.name
    : 'Selecione'

  return (
    <div className="relative w-[400px]" ref={dropdownRef}>
      {/* Botão principal - 400px */}
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className="w-full px-3 py-2 flex items-center justify-between gap-2 bg-white dark:bg-nic-secondary-dark border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-nic-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title={buttonText}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {/* Ícone do agente (dinâmico) */}
          {selectedAgent && (
            <AgentIcon
              icon={selectedAgent.icon}
              color={selectedAgent.color}
              title={selectedAgent.title}
              description={selectedAgent.description}
              size={14}
              variant="small"
            />
          )}

          <span className="text-sm text-gray-900 dark:text-white truncate flex items-center gap-1.5">
            {selectedAgent && selectedModel && !agentUsesOwnEndpoint ? (
              <>
                <span className="font-medium">{selectedAgent.title}</span>
                <span className="font-light text-gray-400 dark:text-gray-500">•</span>
                <span className="font-light text-gray-600 dark:text-gray-400">{selectedModel.name}</span>
              </>
            ) : selectedAgent ? (
              <span className="font-medium">{selectedAgent.title}</span>
            ) : selectedModel ? (
              <span className="font-light">{selectedModel.name}</span>
            ) : (
              <span className="font-medium">Selecione</span>
            )}
          </span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown unificado - 400px */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-[400px] bg-white dark:bg-nic-secondary-dark border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">

          {/* GRUPO 1: AGENTES */}
          {agents.length > 0 && (
            <div>
              {/* Header do grupo */}
              <div className="px-2 py-1 bg-gray-50 dark:bg-nic-primary-dark border-b border-gray-200 dark:border-gray-700">
                <span className="text-[10px] font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                  Agentes
                </span>
              </div>

              {/* Lista de agentes */}
              {agents.map((agent) => (
                <button
                  key={agent.name}
                  onClick={() => handleSelectAgent(agent)}
                  className="w-full px-2 py-1.5 flex items-start gap-2 hover:bg-gray-50 dark:hover:bg-nic-primary-dark transition-colors text-left"
                >
                  {/* Ícone de seleção (check) */}
                  <div className="w-4 h-4 flex-shrink-0 mt-0.5">
                    {selectedAgent?.name === agent.name && (
                      <Check className="w-4 h-4 text-nic-accent-light dark:text-nic-accent-dark" />
                    )}
                  </div>

                  {/* Ícone do agente */}
                  <AgentIcon
                    icon={agent.icon}
                    color={agent.color}
                    title={agent.title}
                    description={agent.description}
                    size={12}
                    variant="small"
                  />

                  {/* Informações do agente */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-1">
                      <span className="text-xs font-medium text-gray-900 dark:text-white line-clamp-1">
                        {agent.title}
                      </span>
                      {agent.source === 'built-in' && (
                        <span className="text-[9px] px-1 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded flex-shrink-0 leading-none">
                          Built-in
                        </span>
                      )}
                      {agent.source === 'n8n' && (
                        <span className="text-[9px] px-1 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded flex-shrink-0 leading-none">
                          N8N
                        </span>
                      )}
                      {agent.source === 'custom' && (
                        <span className="text-[9px] px-1 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded flex-shrink-0 leading-none">
                          Custom
                        </span>
                      )}
                    </div>
                    {agent.description && (
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 line-clamp-2 mt-0.5 leading-tight">
                        {agent.description}
                      </p>
                    )}
                  </div>
                </button>
              ))}

              {/* Mensagem informativa quando agente usa endpoint próprio */}
              {agentUsesOwnEndpoint && (
                <div className="border-t border-gray-200 dark:border-gray-700 px-2 py-2 bg-blue-50/50 dark:bg-blue-900/10">
                  <div className="flex items-start gap-1.5">
                    <Info className="w-3 h-3 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <p className="text-[10px] text-blue-700 dark:text-blue-300 leading-relaxed font-light" style={{ fontWeight: 300 }}>
                      Este agente usa seu próprio provedor de IA. A seleção de modelos está desabilitada.
                    </p>
                  </div>
                </div>
              )}

              {/* Link de configuração de agentes */}
              <div className="border-t border-gray-200 dark:border-gray-700">
                <Link
                  to="/admin"
                  className="block px-2 py-1.5 text-[10px] text-nic-accent-light dark:text-nic-accent-dark hover:bg-gray-50 dark:hover:bg-nic-primary-dark transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  ⚙️ Gerenciar
                </Link>
              </div>
            </div>
          )}

          {/* Separador entre grupos */}
          {agents.length > 0 && models.length > 0 && (
            <div className="border-t-2 border-gray-300 dark:border-gray-600" />
          )}

          {/* GRUPO 2: MODELOS */}
          {models.length > 0 && (
            <div className={agentUsesOwnEndpoint ? 'opacity-40 pointer-events-none' : ''}>
              {/* Header do grupo */}
              <div className="px-2 py-1 bg-gray-50 dark:bg-nic-primary-dark border-b border-gray-200 dark:border-gray-700">
                <span className="text-[10px] font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                  Modelos
                </span>
              </div>

              {/* Subgrupos por provedor */}
              {Object.entries(modelsByProvider).map(([providerId, providerModels], groupIndex) => (
                <div key={providerId}>
                  {/* Nome do provedor */}
                  <div className="px-2 py-1 bg-gray-100 dark:bg-gray-800/50">
                    <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400">
                      {getProviderName(providerId)}
                    </span>
                  </div>

                  {/* Modelos do provedor */}
                  {providerModels.map((model) => (
                    <button
                      key={model.id}
                      onClick={() => handleSelectModel(model)}
                      className="w-full px-2 py-1.5 flex items-start gap-2 hover:bg-gray-50 dark:hover:bg-nic-primary-dark transition-colors text-left"
                      title={model.description}
                    >
                      {/* Ícone de seleção */}
                      <div className="w-4 h-4 flex-shrink-0 ml-2">
                        {!agentUsesOwnEndpoint && selectedModel?.id === model.id ? (
                          <Check className="w-4 h-4 text-nic-accent-light dark:text-nic-accent-dark" />
                        ) : (
                          <div className="w-4 h-4" />
                        )}
                      </div>

                      {/* Informações do modelo */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-1">
                          <span className="text-xs font-medium text-gray-900 dark:text-white line-clamp-1">
                            {model.name}
                          </span>
                          {model.reasoningEffort && (
                            <span className="text-[9px] px-1 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded flex-shrink-0 leading-none">
                              {model.reasoningEffort === 'minimal' ? 'Inst' :
                               model.reasoningEffort === 'high' ? 'Refl' : 'Auto'}
                            </span>
                          )}
                        </div>
                        {model.description && (
                          <p className="text-[10px] text-gray-500 dark:text-gray-400 line-clamp-2 mt-0.5 leading-tight">
                            {model.description}
                          </p>
                        )}
                      </div>
                    </button>
                  ))}

                  {/* Separator entre provedores (exceto último) */}
                  {groupIndex < Object.keys(modelsByProvider).length - 1 && (
                    <div className="border-t border-gray-200 dark:border-gray-700" />
                  )}
                </div>
              ))}

              {/* Link de configuração de modelos */}
              <div className="border-t border-gray-200 dark:border-gray-700">
                <Link
                  to="/admin#provedores"
                  className="block px-2 py-1.5 text-[10px] text-nic-accent-light dark:text-nic-accent-dark hover:bg-gray-50 dark:hover:bg-nic-primary-dark transition-colors rounded-b-lg"
                  onClick={() => setIsOpen(false)}
                >
                  ⚙️ Configurar
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
