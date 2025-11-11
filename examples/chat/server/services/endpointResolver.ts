/**
 * Endpoint Resolver - Resolve endpoints relativos de agentes N8N para URLs completas
 *
 * Regras de resolução:
 * - URL completa (http/https) → retorna sem modificar
 * - /webhook/... → n8nHost + /webhook/...
 * - /... → n8nHost + /webhook + /...
 * - sem / → n8nBaseUrl + /...
 */

/**
 * Resolve endpoint relativo para URL completa usando N8N_BASE_URL
 *
 * @param endpoint - Endpoint do agente (pode ser relativo ou absoluto)
 * @param n8nBaseUrl - Base URL do N8N (ex: https://n8n.codrstudio.dev/webhook/nic/v1)
 * @returns URL completa resolvida, ou undefined se endpoint não fornecido
 *
 * @example
 * // Endpoint relativo simples → base + /endpoint
 * resolveAgentEndpoint("agents/nic-avalia/completions", "https://n8n.codrstudio.dev/webhook/nic/v1")
 * // → "https://n8n.codrstudio.dev/webhook/nic/v1/agents/nic-avalia/completions"
 *
 * @example
 * // Endpoint com /webhook → host + /webhook/...
 * resolveAgentEndpoint("/webhook/custom/agent", "https://n8n.codrstudio.dev/webhook/nic/v1")
 * // → "https://n8n.codrstudio.dev/webhook/custom/agent"
 *
 * @example
 * // Endpoint com / → host + /webhook + /...
 * resolveAgentEndpoint("/custom-path", "https://n8n.codrstudio.dev/webhook/nic/v1")
 * // → "https://n8n.codrstudio.dev/webhook/custom-path"
 *
 * @example
 * // URL completa → sem modificação
 * resolveAgentEndpoint("https://external.com/api/completions", "https://n8n.codrstudio.dev/webhook/nic/v1")
 * // → "https://external.com/api/completions"
 */
export function resolveAgentEndpoint(
  endpoint: string | undefined,
  n8nBaseUrl: string
): string | undefined {
  // Se não há endpoint, retornar undefined
  if (!endpoint) {
    return undefined
  }

  // Se é URL completa, retornar sem modificar
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint
  }

  try {
    // Extrair host do N8N_BASE_URL (ex: https://n8n.codrstudio.dev)
    const n8nHost = new URL(n8nBaseUrl).origin

    // Se começa com /webhook → relativo ao host
    if (endpoint.startsWith('/webhook/')) {
      return `${n8nHost}${endpoint}`
    }

    // Se começa com / → relativo a /webhook
    if (endpoint.startsWith('/')) {
      return `${n8nHost}/webhook${endpoint}`
    }

    // Caso contrário → relativo à base de agentes (n8nBaseUrl)
    // Garantir que não duplica barra
    const base = n8nBaseUrl.endsWith('/') ? n8nBaseUrl.slice(0, -1) : n8nBaseUrl
    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
    return `${base}${path}`
  } catch (error) {
    console.error('[Endpoint Resolver] Erro ao resolver endpoint:', error)
    return undefined
  }
}
