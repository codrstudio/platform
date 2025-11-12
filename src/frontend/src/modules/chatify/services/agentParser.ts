/**
 * Agent Parser - Parseia agentes built-in das variáveis de ambiente
 *
 * Formato esperado no .env:
 * VITE_AGENT_{NAME}_ENABLED=true
 * VITE_AGENT_{NAME}_TITLE=Título Exibido
 * VITE_AGENT_{NAME}_DESCRIPTION=Descrição do agente
 * VITE_AGENT_{NAME}_ENDPOINT=https://...
 *
 * NAME: Nome identificador do agente em UPPER_SNAKE_CASE (ex: NIC, RECRUITMENT)
 */

import type { BuiltInAgent } from '../types'

/**
 * Extrai todos os nomes únicos de agentes das variáveis de ambiente
 *
 * @example
 * VITE_AGENT_NIC_ENABLED → "NIC"
 * VITE_AGENT_RECRUITMENT_TITLE → "RECRUITMENT"
 */
function extractAgentNames(env: Record<string, any>): Set<string> {
  const agentNames = new Set<string>()
  const pattern = /^VITE_AGENT_([A-Z_]+)_/

  Object.keys(env).forEach(key => {
    const match = key.match(pattern)
    if (match) {
      agentNames.add(match[1])
    }
  })

  return agentNames
}

/**
 * Lê uma propriedade específica de um agente do .env
 */
function getAgentProperty(
  env: Record<string, any>,
  agentName: string,
  property: string
): string | undefined {
  return env[`VITE_AGENT_${agentName}_${property.toUpperCase()}`]
}

/**
 * Valida se um agente tem todas as propriedades obrigatórias
 */
function isValidAgent(agent: Partial<BuiltInAgent>): agent is BuiltInAgent {
  return !!(
    agent.name &&
    agent.title &&
    agent.description &&
    agent.systemPrompt &&
    typeof agent.enabled === 'boolean' &&
    agent.isBuiltIn === true &&
    agent.source === 'built-in'
  )
}

/**
 * Parseia agentes built-in das variáveis de ambiente
 *
 * @param env - Objeto import.meta.env do Vite
 * @returns Array de agentes built-in válidos
 *
 * @example
 * const agents = parseBuiltInAgents(import.meta.env)
 * // [{ name: "nic", title: "NIC", systemPrompt: "...", ... }, ...]
 */
export function parseBuiltInAgents(env: Record<string, any> = {}): BuiltInAgent[] {
  const agentNames = extractAgentNames(env)
  const agents: BuiltInAgent[] = []

  for (const agentName of agentNames) {
    const agent: Partial<BuiltInAgent> = {
      name: agentName.toLowerCase(),
      title: getAgentProperty(env, agentName, 'TITLE'),
      description: getAgentProperty(env, agentName, 'DESCRIPTION'),
      systemPrompt: getAgentProperty(env, agentName, 'SYSTEM_PROMPT') || '',
      endpoint: getAgentProperty(env, agentName, 'ENDPOINT'),
      icon: getAgentProperty(env, agentName, 'ICON'),
      color: getAgentProperty(env, agentName, 'COLOR'),
      tags: getAgentProperty(env, agentName, 'TAGS')?.split(',').map((t: string) => t.trim()),
      enabled: getAgentProperty(env, agentName, 'ENABLED') === 'true',
      source: 'built-in',
      isBuiltIn: true
    }

    if (isValidAgent(agent)) {
      agents.push(agent)
    } else {
      console.warn(`[AgentParser] Agente built-in incompleto ignorado: ${agentName}`, agent)
    }
  }

  return agents
}

/**
 * Busca um agente built-in por nome
 */
export function getBuiltInAgentByName(
  agents: BuiltInAgent[],
  agentName: string
): BuiltInAgent | undefined {
  return agents.find(agent => agent.name === agentName)
}

/**
 * Filtra agentes built-in que estão habilitados no .env
 * (enabled=true permite controle via UI, enabled=false força desabilitação)
 */
export function getEnabledBuiltInAgents(agents: BuiltInAgent[]): BuiltInAgent[] {
  return agents.filter(agent => agent.enabled)
}
