/**
 * N8N Agent Service - Descobre agentes disponíveis via N8N
 *
 * Busca agentes de um endpoint N8N que retorna lista de agentes disponíveis
 * Implementa cache em memória com TTL para reduzir chamadas ao N8N
 *
 * Formato OpenAI-like esperado:
 * {
 *   "object": "list",
 *   "data": [
 *     {
 *       "id": "nic-avalia",
 *       "object": "agent",
 *       "created": 1728518400,
 *       "owned_by": "processa-sistemas",
 *       "title": "NIC Avalia",
 *       "description": "...",
 *       "systemPrompt": "...",
 *       "endpoint": "...",
 *       "enabled": true
 *     }
 *   ]
 * }
 */

import { resolveAgentEndpoint } from './endpointResolver.js'

interface N8NAgentRaw {
  id: string
  object: string
  created?: number
  owned_by?: string
  title: string
  description: string
  systemPrompt: string
  endpoint?: string
  icon?: string
  color?: string
  tags?: string[]
  enabled: boolean
}

interface N8NAgent {
  name: string // Mapeado de 'id'
  title: string
  description: string
  systemPrompt: string
  endpoint?: string
  icon?: string
  color?: string
  tags?: string[]
  enabled: boolean
  source: 'n8n'
  isBuiltIn: false
  workflowId?: string
  // Campos OpenAI extras (opcionais)
  created?: number
  owned_by?: string
}

interface N8NAgentResponse {
  object: string
  data: N8NAgentRaw[]
}

// Cache em memória
let cachedAgents: N8NAgent[] = []
let cacheTimestamp: number = 0
const CACHE_TTL = 5 * 60 * 1000 // 5 minutos

/**
 * Busca agentes do N8N via webhook
 * Endpoint: GET /webhook/nic/v1/agents
 *
 * Retorna estrutura OpenAI-like com campo 'data' contendo array de agentes
 */
export async function fetchN8NAgents(): Promise<N8NAgent[]> {
  const now = Date.now()

  // Verificar cache
  if (cachedAgents.length > 0 && (now - cacheTimestamp) < CACHE_TTL) {
    console.log('[N8N Agents] Usando cache (válido por mais', Math.round((CACHE_TTL - (now - cacheTimestamp)) / 1000), 'segundos)')
    return cachedAgents
  }

  // Buscar do N8N
  const n8nBaseUrl = process.env.N8N_BASE_URL || '/api/v1'
  const agentsEndpoint = `${n8nBaseUrl}/agents`

  try {
    console.log('[N8N Agents] Buscando agentes de:', agentsEndpoint)

    const response = await fetch(agentsEndpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      // Timeout de 5 segundos
      signal: AbortSignal.timeout(5000)
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data: N8NAgentResponse = await response.json()

    // Validar estrutura OpenAI-like
    if (data.object !== 'list') {
      console.warn('[N8N Agents] Resposta inválida (object !== "list")')
      return []
    }

    if (!data.data || !Array.isArray(data.data)) {
      console.warn('[N8N Agents] Resposta inválida (data não é array)')
      return []
    }

    // Mapear agentes: id → name, adicionar source e isBuiltIn, resolver endpoints
    const normalizedAgents: N8NAgent[] = data.data.map(agent => {
      const resolvedEndpoint = resolveAgentEndpoint(agent.endpoint, n8nBaseUrl)

      // Log de resolução para debug
      if (agent.endpoint && agent.endpoint !== resolvedEndpoint) {
        console.log(`[N8N Agents] Endpoint resolvido para "${agent.id}":`, {
          original: agent.endpoint,
          resolved: resolvedEndpoint
        })
      }

      return {
        name: agent.id,              // Mapear 'id' para 'name'
        title: agent.title,
        description: agent.description,
        systemPrompt: agent.systemPrompt,
        endpoint: resolvedEndpoint,  // Usar endpoint resolvido
        icon: agent.icon,
        color: agent.color,          // Mapear cor personalizada
        tags: agent.tags,
        enabled: agent.enabled,
        source: 'n8n' as const,
        isBuiltIn: false as const,
        // Campos OpenAI extras (opcionais)
        created: agent.created,
        owned_by: agent.owned_by
      }
    })

    // Atualizar cache
    cachedAgents = normalizedAgents
    cacheTimestamp = now

    console.log(`[N8N Agents] ${normalizedAgents.length} agentes carregados do N8N`)
    return normalizedAgents

  } catch (error: any) {
    console.error('[N8N Agents] Erro ao buscar agentes:', error.message)

    // Retornar cache antigo se disponível (fallback)
    if (cachedAgents.length > 0) {
      console.log('[N8N Agents] Usando cache expirado como fallback')
      return cachedAgents
    }

    return []
  }
}

/**
 * Limpa o cache de agentes N8N (útil para testes)
 */
export function clearN8NAgentsCache(): void {
  cachedAgents = []
  cacheTimestamp = 0
  console.log('[N8N Agents] Cache limpo')
}

/**
 * Retorna informações sobre o cache
 */
export function getN8NAgentsCacheInfo(): { count: number; age: number; ttl: number } {
  const age = Date.now() - cacheTimestamp
  return {
    count: cachedAgents.length,
    age: Math.round(age / 1000), // segundos
    ttl: Math.round(CACHE_TTL / 1000) // segundos
  }
}
