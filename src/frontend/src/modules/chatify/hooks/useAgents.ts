/**
 * useAgents Hook
 * Gerencia estado de agentes (built-in, n8n e custom) e agente selecionado
 */

import { useState, useEffect, useCallback } from 'react'
import type { Agent, AgentConfig } from '../types'
import * as agentService from '../services/agentService'

const SELECTED_AGENT_KEY = 'nic-chat:selected-agent-name'

/**
 * Hook para gerenciar agentes e seleção
 */
export function useAgents() {
  const [config, setConfig] = useState<AgentConfig>(() => agentService.loadAgentConfig())
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [isLoadingN8N, setIsLoadingN8N] = useState(false)

  // Carregar agentes N8N ao montar (assíncrono)
  useEffect(() => {
    let isMounted = true

    const loadN8NAgents = async () => {
      setIsLoadingN8N(true)
      try {
        const newConfig = await agentService.loadAgentConfigAsync()
        if (isMounted) {
          setConfig(newConfig)
        }
      } catch (error) {
        console.error('[useAgents] Erro ao carregar agentes N8N:', error)
      } finally {
        if (isMounted) {
          setIsLoadingN8N(false)
        }
      }
    }

    loadN8NAgents()

    return () => {
      isMounted = false
    }
  }, [])

  // Carregar agente selecionado do localStorage ao montar ou quando config mudar
  useEffect(() => {
    const savedAgentName = localStorage.getItem(SELECTED_AGENT_KEY)
    const availableAgents = agentService.getAvailableAgents(config)

    if (savedAgentName) {
      const agent = agentService.getAgentByName(config, savedAgentName)
      if (agent && agentService.isAgentAvailable(agent, config.userPreferences)) {
        setSelectedAgent(agent)
        return
      }
    }

    // Se não tem agente salvo ou o salvo não está disponível, usar o primeiro disponível
    if (availableAgents.length > 0) {
      setSelectedAgent(availableAgents[0])
      localStorage.setItem(SELECTED_AGENT_KEY, availableAgents[0].name)
    }
  }, [config])

  /**
   * Recarrega a configuração de agentes (útil após mudanças)
   */
  const reloadConfig = useCallback(() => {
    const newConfig = agentService.loadAgentConfig()
    setConfig(newConfig)

    // Verificar se o agente selecionado ainda está disponível
    if (selectedAgent) {
      const stillAvailable = agentService.getAvailableAgents(newConfig).find(
        a => a.name === selectedAgent.name
      )
      if (!stillAvailable) {
        const availableAgents = agentService.getAvailableAgents(newConfig)
        if (availableAgents.length > 0) {
          selectAgent(availableAgents[0])
        } else {
          setSelectedAgent(null)
        }
      }
    }
  }, [selectedAgent])

  /**
   * Seleciona um agente
   */
  const selectAgent = useCallback((agent: Agent) => {
    setSelectedAgent(agent)
    localStorage.setItem(SELECTED_AGENT_KEY, agent.name)
  }, [])

  /**
   * Obtém todos os agentes disponíveis
   */
  const getAvailableAgents = useCallback(() => {
    return agentService.getAvailableAgents(config)
  }, [config])

  /**
   * Alterna preferência de um agente built-in
   */
  const toggleAgentPreference = useCallback((agentName: string) => {
    const agent = agentService.getAgentByName(config, agentName)
    if (!agent?.isBuiltIn) return

    const currentPreference = config.userPreferences[agentName] ?? true
    const newPreferences = agentService.setAgentPreference(agentName, !currentPreference)

    setConfig(prev => ({
      ...prev,
      userPreferences: newPreferences
    }))

    reloadConfig()
  }, [config, reloadConfig])

  /**
   * Adiciona ou atualiza um agente custom
   */
  const saveCustomAgent = useCallback((agent: Omit<Agent, 'source' | 'isBuiltIn' | 'createdAt' | 'updatedAt'>) => {
    const customAgent = agentService.saveCustomAgent(agent)
    reloadConfig()
    return customAgent
  }, [reloadConfig])

  /**
   * Remove um agente custom
   */
  const deleteCustomAgent = useCallback((agentName: string) => {
    agentService.deleteCustomAgent(agentName)
    reloadConfig()
  }, [reloadConfig])

  /**
   * Verifica se um nome de agente é único
   */
  const isAgentNameUnique = useCallback((agentName: string) => {
    return agentService.isAgentNameUnique(config, agentName)
  }, [config])

  return {
    // Estado
    config,
    selectedAgent,
    availableAgents: getAvailableAgents(),
    isLoadingN8N,

    // Ações
    selectAgent,
    reloadConfig,
    toggleAgentPreference,
    saveCustomAgent,
    deleteCustomAgent,
    isAgentNameUnique
  }
}
