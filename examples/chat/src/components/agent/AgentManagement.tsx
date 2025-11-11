/**
 * AgentManagement - Gerenciamento completo de agentes (built-in, n8n e custom)
 * Lista agentes, permite criar/editar/excluir custom, e gerenciar preferências
 */

import { useState } from 'react'
import { Bot, Plus, Edit, Trash2, Eye, EyeOff, RefreshCw } from 'lucide-react'
import { useAgents } from '@/hooks/useAgents'
import type { Agent, CustomAgent } from '@/types/agent'
import { CustomAgentEditor } from './CustomAgentEditor'
import { AgentIcon } from '../chat/AgentIcon'

export function AgentManagement() {
  const {
    config,
    availableAgents,
    isLoadingN8N,
    reloadConfig,
    toggleAgentPreference,
    saveCustomAgent,
    deleteCustomAgent,
    isAgentNameUnique
  } = useAgents()

  const [editingAgent, setEditingAgent] = useState<CustomAgent | undefined>()
  const [isCreating, setIsCreating] = useState(false)

  const handleCreate = () => {
    setEditingAgent(undefined)
    setIsCreating(true)
  }

  const handleEdit = (agent: CustomAgent) => {
    setEditingAgent(agent)
    setIsCreating(true)
  }

  const handleSave = (agentData: Omit<CustomAgent, 'source' | 'isBuiltIn' | 'createdAt' | 'updatedAt'>) => {
    saveCustomAgent(agentData)
    setIsCreating(false)
    setEditingAgent(undefined)
  }

  const handleDelete = (agentName: string) => {
    if (confirm(`Tem certeza que deseja excluir o agente "${agentName}"?`)) {
      deleteCustomAgent(agentName)
    }
  }

  const handleToggle = (agent: Agent) => {
    if (agent.source === 'built-in' || agent.source === 'n8n') {
      toggleAgentPreference(agent.name)
    } else if (agent.source === 'custom') {
      // Para custom, editar o agente com enabled invertido
      const customAgent = agent as CustomAgent
      saveCustomAgent({
        ...customAgent,
        enabled: !customAgent.enabled
      })
    }
  }

  const getAgentBadge = (agent: Agent) => {
    switch (agent.source) {
      case 'built-in':
        return <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">Built-in</span>
      case 'n8n':
        return <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">N8N</span>
      case 'custom':
        return <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">Custom</span>
    }
  }

  const isAgentAvailable = (agent: Agent): boolean => {
    return availableAgents.some(a => a.name === agent.name)
  }

  const allAgents = [...config.builtIn, ...config.n8n, ...config.custom]

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Gerenciar Agentes
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {allAgents.length} agentes ({availableAgents.length} disponíveis)
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={reloadConfig}
            disabled={isLoadingN8N}
            className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingN8N ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
          <button
            onClick={handleCreate}
            className="px-3 py-2 text-sm font-medium text-white bg-nic-accent-light dark:bg-nic-accent-dark hover:opacity-90 rounded-lg transition-opacity flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Criar Agente Custom
          </button>
        </div>
      </div>

      {/* Lista de Agentes */}
      <div className="space-y-2">
        {allAgents.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <Bot className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">Nenhum agente configurado</p>
          </div>
        ) : (
          allAgents.map((agent) => {
            const isAvailable = isAgentAvailable(agent)
            const isCustom = agent.source === 'custom'

            return (
              <div
                key={agent.name}
                className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                  isAvailable
                    ? 'bg-white dark:bg-nic-secondary-dark border-gray-200 dark:border-gray-700'
                    : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 opacity-60'
                }`}
              >
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  {/* Ícone */}
                  <AgentIcon
                    icon={agent.icon}
                    title={agent.title}
                    description={agent.description}
                    size={24}
                    variant="default"
                  />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        {agent.title}
                      </h4>
                      {getAgentBadge(agent)}
                      {!isAvailable && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                          Desabilitado
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                      {agent.description}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500">
                      <span className="font-mono">{agent.name}</span>
                      {agent.tags && agent.tags.length > 0 && (
                        <>
                          <span>•</span>
                          <span>{agent.tags.join(', ')}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 ml-4">
                  {/* Toggle */}
                  <button
                    onClick={() => handleToggle(agent)}
                    className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    title={isAvailable ? 'Desabilitar' : 'Habilitar'}
                  >
                    {isAvailable ? (
                      <Eye className="w-4 h-4" />
                    ) : (
                      <EyeOff className="w-4 h-4" />
                    )}
                  </button>

                  {/* Editar (apenas custom) */}
                  {isCustom && (
                    <button
                      onClick={() => handleEdit(agent as CustomAgent)}
                      className="p-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                      title="Editar"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  )}

                  {/* Excluir (apenas custom) */}
                  {isCustom && (
                    <button
                      onClick={() => handleDelete(agent.name)}
                      className="p-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Info sobre N8N */}
      {config.n8n.length > 0 && (
        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
          <p className="text-sm text-purple-800 dark:text-purple-300">
            ℹ️ <strong>{config.n8n.length} agente(s) N8N</strong> descobertos automaticamente.
            {isLoadingN8N && ' Atualizando...'}
          </p>
        </div>
      )}

      {/* Editor Modal */}
      {isCreating && (
        <CustomAgentEditor
          agent={editingAgent}
          onSave={handleSave}
          onCancel={() => {
            setIsCreating(false)
            setEditingAgent(undefined)
          }}
          isNameUnique={(name, currentName) => {
            // Se está editando e o nome é o mesmo, é válido
            if (currentName && name === currentName) return true
            return isAgentNameUnique(name)
          }}
        />
      )}
    </div>
  )
}
