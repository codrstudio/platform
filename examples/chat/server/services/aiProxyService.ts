/**
 * AI Proxy Service - Proxy para provedores de IA (NIC, OpenAI, etc)
 * Injeta API keys do servidor e evita cross-domain no frontend
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

interface AIProvider {
  id: string
  name: string
  baseUrl: string
  enabled: boolean
  requiresAuth: boolean
  models: any[]
}

interface ProviderConfig {
  provider: AIProvider
  apiKey?: string
}

/**
 * Carrega configuração de provedores do JSON público
 */
function loadProvidersConfig(): AIProvider[] {
  const configPath = path.join(__dirname, '../../public/config/ai-providers.json')
  const data = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
  return data.providers
}

/**
 * Busca configuração de um provedor específico e injeta API key
 */
function getProviderConfig(providerId: string): ProviderConfig {
  const providers = loadProvidersConfig()
  const provider = providers.find(p => p.id === providerId)

  if (!provider) {
    throw new Error(`Provider ${providerId} not found in configuration`)
  }

  if (!provider.enabled) {
    throw new Error(`Provider ${providerId} is disabled`)
  }

  // Buscar API key do .env (se requiresAuth)
  let apiKey: string | undefined
  if (provider.requiresAuth) {
    const envKey = `${provider.id.toUpperCase()}_API_KEY`
    apiKey = process.env[envKey]

    if (!apiKey) {
      throw new Error(`API key ${envKey} not configured in .env`)
    }
  }

  return { provider, apiKey }
}

/**
 * Normaliza baseUrl (garante que termina com /)
 */
function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`
}

/**
 * Valida se o conteúdo do evento é válido (não é undefined/empty)
 * Mesma validação do frontend para consistência
 */
function isValidContent(content: string | undefined): boolean {
  return content !== undefined && content !== 'undefined' && content.trim() !== ''
}

/**
 * Proxy para listar modelos de um provedor
 */
export async function proxyModels(providerId: string): Promise<any> {
  const { provider, apiKey } = getProviderConfig(providerId)
  const baseUrl = normalizeBaseUrl(provider.baseUrl)

  const headers: Record<string, string> = {}
  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`
  }

  const response = await fetch(`${baseUrl}models`, {
    headers,
    method: 'GET'
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Provider error: ${response.status} ${response.statusText} - ${errorText}`)
  }

  return await response.json()
}

/**
 * Proxy para chat/completions (suporta streaming)
 */
export async function proxyChatCompletions(
  providerId: string,
  payload: any,
  res?: any
): Promise<any> {
  const { provider, apiKey } = getProviderConfig(providerId)
  const baseUrl = normalizeBaseUrl(provider.baseUrl)

  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  }

  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`
  }

  const response = await fetch(`${baseUrl}chat/completions`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload)
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Provider error: ${response.status} ${response.statusText} - ${errorText}`)
  }

  // Se streaming, processar response para o cliente
  if (payload.stream && res && response.body) {
    const reader = response.body.getReader()
    const decoder = new TextDecoder()

    // Detectar se é provedor NIC (precisa de conversão de formato)
    const isNicProvider = providerId === 'nic'

    try {
      if (isNicProvider) {
        // Converter formato N8N Legacy para OpenAI SSE
        let buffer = ''
        let completionId = `chatcmpl-nic-${Date.now()}`
        let created = Math.floor(Date.now() / 1000)

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            const trimmed = line.trim()
            if (!trimmed) continue

            try {
              // Parse evento N8N Legacy
              const event = JSON.parse(trimmed)

              // Converter para formato OpenAI SSE
              // Validar conteúdo para evitar "undefined", vazios, etc
              if (event.type === 'item' && isValidContent(event.content)) {
                const openaiChunk = {
                  id: completionId,
                  object: 'chat.completion.chunk',
                  created: created,
                  model: payload.model || 'nic',
                  choices: [
                    {
                      index: 0,
                      delta: {
                        content: event.content
                      },
                      finish_reason: null
                    }
                  ]
                }

                res.write(`data: ${JSON.stringify(openaiChunk)}\n\n`)
              } else if (event.type === 'done') {
                // Último chunk com finish_reason
                const openaiChunk = {
                  id: completionId,
                  object: 'chat.completion.chunk',
                  created: created,
                  model: payload.model || 'nic',
                  choices: [
                    {
                      index: 0,
                      delta: {},
                      finish_reason: 'stop'
                    }
                  ]
                }

                res.write(`data: ${JSON.stringify(openaiChunk)}\n\n`)
                res.write('data: [DONE]\n\n')
              }
              // Ignorar outros tipos (begin, metadata, etc)
            } catch (parseError) {
              console.warn('Failed to parse N8N event:', trimmed, parseError)
            }
          }
        }

        // Garantir que [DONE] seja sempre enviado no final
        res.write('data: [DONE]\n\n')
        res.end()
      } else {
        // Outros provedores: pipe direto (já estão em formato OpenAI)
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          res.write(value)
        }
        res.end()
      }
    } catch (error) {
      console.error('Streaming error:', error)
      if (!res.headersSent) {
        res.status(500).json({ error: 'Streaming failed' })
      }
    }
    return
  } else {
    return await response.json()
  }
}
