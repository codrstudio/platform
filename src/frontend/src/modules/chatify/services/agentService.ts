/**
 * Agent Service - Gerenciamento centralizado de agentes (built-in e custom)
 *
 * Responsabilidades:
 * - Carregar agentes built-in do .env
 * - Gerenciar agentes custom do localStorage
 * - Aplicar preferências do usuário
 * - Determinar disponibilidade de agentes
 */

import type {
  Agent,
  CustomAgent,
  N8NAgent,
  AgentConfig,
  AgentUserPreferences
} from '../types'
import { parseBuiltInAgents } from './agentParser'

// Chaves do localStorage
const STORAGE_KEYS = {
  CUSTOM_AGENTS: 'nic-chat:agents:custom',
  N8N_AGENTS_CACHE: 'nic-chat:agents:n8n-cache',
  USER_PREFERENCES: 'nic-chat:agents:preferences'
} as const

// Cache de 5 minutos para agentes N8N
const N8N_CACHE_TTL = 5 * 60 * 1000

/**
 * Carrega agentes custom do localStorage
 */
function loadCustomAgents(): CustomAgent[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.CUSTOM_AGENTS)
    if (!stored) return []

    const agents = JSON.parse(stored)
    return Array.isArray(agents) ? agents : []
  } catch (error) {
    console.error('[AgentService] Erro ao carregar agentes custom:', error)
    return []
  }
}

/**
 * Salva agentes custom no localStorage
 */
function saveCustomAgents(agents: CustomAgent[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CUSTOM_AGENTS, JSON.stringify(agents))
  } catch (error) {
    console.error('[AgentService] Erro ao salvar agentes custom:', error)
  }
}

/**
 * Carrega preferências do usuário do localStorage
 */
function loadUserPreferences(): AgentUserPreferences {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES)
    if (!stored) return {}

    return JSON.parse(stored)
  } catch (error) {
    console.error('[AgentService] Erro ao carregar preferências:', error)
    return {}
  }
}

/**
 * Salva preferências do usuário no localStorage
 */
function saveUserPreferences(preferences: AgentUserPreferences): void {
  try {
    localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(preferences))
  } catch (error) {
    console.error('[AgentService] Erro ao salvar preferências:', error)
  }
}

/**
 * Interface para cache de agentes N8N
 */
interface N8NAgentsCache {
  agents: N8NAgent[]
  timestamp: number
}

/**
 * Carrega agentes N8N do cache localStorage
 */
function loadN8NAgentsCache(): N8NAgent[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.N8N_AGENTS_CACHE)
    if (!stored) return []

    const cache: N8NAgentsCache = JSON.parse(stored)
    const now = Date.now()

    // Verificar se cache expirou
    if (now - cache.timestamp > N8N_CACHE_TTL) {
      console.log('[AgentService] Cache N8N expirado, limpando...')
      localStorage.removeItem(STORAGE_KEYS.N8N_AGENTS_CACHE)
      return []
    }

    return cache.agents
  } catch (error) {
    console.error('[AgentService] Erro ao carregar cache N8N:', error)
    return []
  }
}

/**
 * Salva agentes N8N no cache localStorage
 */
function saveN8NAgentsCache(agents: N8NAgent[]): void {
  try {
    const cache: N8NAgentsCache = {
      agents,
      timestamp: Date.now()
    }
    localStorage.setItem(STORAGE_KEYS.N8N_AGENTS_CACHE, JSON.stringify(cache))
  } catch (error) {
    console.error('[AgentService] Erro ao salvar cache N8N:', error)
  }
}

/**
 * Busca agentes N8N via API do backend (com fallback para cache)
 */
export async function fetchN8NAgents(): Promise<N8NAgent[]> {
  try {
    const response = await fetch('/api/agents/n8n')
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const agents: N8NAgent[] = await response.json()
    saveN8NAgentsCache(agents)
    return agents
  } catch (error) {
    console.warn('[AgentService] Erro ao buscar agentes N8N, usando cache:', error)
    return loadN8NAgentsCache()
  }
}

/**
 * Verifica se um agente está disponível para uso
 *
 * Lógica de precedência:
 * - Built-in com enabled=false no .env → SEMPRE indisponível
 * - Built-in com enabled=true no .env → Controle via userPreferences (default: true)
 * - N8N → Controle via userPreferences (default: true)
 * - Custom → Controle via agent.enabled
 */
export function isAgentAvailable(
  agent: Agent,
  userPreferences: AgentUserPreferences
): boolean {
  if (agent.source === 'built-in') {
    // enabled=false no .env tem precedência ABSOLUTA
    if (!agent.enabled) return false

    // enabled=true delega para preferência do usuário (default: true)
    return userPreferences[agent.name] ?? true
  }

  if (agent.source === 'n8n') {
    // N8N agents: controle via userPreferences (default: true)
    return userPreferences[agent.name] ?? true
  }

  // Agentes custom usam apenas agent.enabled
  return agent.enabled
}

/**
 * Carrega configuração completa de agentes (síncrono, sem N8N)
 */
export function loadAgentConfig(): AgentConfig {
  const builtIn = parseBuiltInAgents(import.meta.env as Record<string, any>)
  const custom = loadCustomAgents()
  const n8n = loadN8NAgentsCache() // Apenas cache local
  const userPreferences = loadUserPreferences()

  return {
    builtIn,
    n8n,
    custom,
    userPreferences
  }
}

/**
 * Carrega configuração completa de agentes (assíncrono, com fetch de N8N)
 */
export async function loadAgentConfigAsync(): Promise<AgentConfig> {
  const builtIn = parseBuiltInAgents(import.meta.env as Record<string, any>)
  const custom = loadCustomAgents()
  const n8n = await fetchN8NAgents() // Fetch com cache
  const userPreferences = loadUserPreferences()

  return {
    builtIn,
    n8n,
    custom,
    userPreferences
  }
}

/**
 * Retorna todos os agentes disponíveis (built-in + n8n + custom)
 */
export function getAvailableAgents(config: AgentConfig): Agent[] {
  const builtInAvailable = config.builtIn.filter(agent =>
    isAgentAvailable(agent, config.userPreferences)
  )

  const n8nAvailable = config.n8n.filter(agent =>
    isAgentAvailable(agent, config.userPreferences)
  )

  const customAvailable = config.custom.filter(agent =>
    isAgentAvailable(agent, config.userPreferences)
  )

  return [...builtInAvailable, ...n8nAvailable, ...customAvailable]
}

/**
 * Busca um agente por nome (built-in, n8n ou custom)
 */
export function getAgentByName(config: AgentConfig, agentName: string): Agent | undefined {
  const builtIn = config.builtIn.find(a => a.name === agentName)
  if (builtIn) return builtIn

  const n8n = config.n8n.find(a => a.name === agentName)
  if (n8n) return n8n

  return config.custom.find(a => a.name === agentName)
}

/**
 * Atualiza preferência do usuário para um agente built-in
 */
export function setAgentPreference(
  agentName: string,
  enabled: boolean
): AgentUserPreferences {
  const preferences = loadUserPreferences()
  preferences[agentName] = enabled
  saveUserPreferences(preferences)
  return preferences
}

/**
 * Adiciona ou atualiza um agente custom
 */
export function saveCustomAgent(
  agent: Omit<CustomAgent, 'source' | 'isBuiltIn' | 'createdAt' | 'updatedAt'>
): CustomAgent {
  const agents = loadCustomAgents()
  const now = new Date().toISOString()

  const existingIndex = agents.findIndex(a => a.name === agent.name)

  const customAgent: CustomAgent = {
    ...agent,
    source: 'custom',
    isBuiltIn: false,
    createdAt: existingIndex >= 0 ? agents[existingIndex].createdAt : now,
    updatedAt: now
  }

  if (existingIndex >= 0) {
    agents[existingIndex] = customAgent
  } else {
    agents.push(customAgent)
  }

  saveCustomAgents(agents)
  return customAgent
}

/**
 * Remove um agente custom
 */
export function deleteCustomAgent(agentName: string): void {
  const agents = loadCustomAgents()
  const filtered = agents.filter(a => a.name !== agentName)
  saveCustomAgents(filtered)
}

/**
 * Valida se um nome de agente é único
 */
export function isAgentNameUnique(config: AgentConfig, agentName: string): boolean {
  return !getAgentByName(config, agentName)
}
