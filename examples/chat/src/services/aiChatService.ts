/**
 * AI Chat Service - Suporta múltiplos provedores OpenAI-compatible
 * Usa backend proxy para evitar cross-domain e proteger API keys
 */

import type { AIProvider, AIModel } from '@/types/provider'
import type { Agent } from '@/types/agent'
import { StreamEvent } from '@/types/streaming'

interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

/**
 * Injeta system prompt do agente no início das mensagens
 * Se já existe uma mensagem system, substitui. Caso contrário, adiciona no início.
 *
 * @param messages - Array de mensagens do chat
 * @param agent - Agente selecionado (com systemPrompt)
 * @returns Novo array com system prompt injetado
 */
export function injectAgentSystemPrompt(messages: ChatMessage[], agent?: Agent): ChatMessage[] {
  if (!agent?.systemPrompt) {
    return messages
  }

  // Remove mensagens system existentes (agente tem precedência)
  const filteredMessages = messages.filter(m => m.role !== 'system')

  // Injeta system prompt do agente no início
  return [
    { role: 'system', content: agent.systemPrompt },
    ...filteredMessages
  ]
}

/**
 * Stream de mensagens do chat usando OpenAI-compatible API
 * Suporta tanto o formato N8N (sessionId + chatInput) quanto OpenAI (messages array)
 *
 * @param provider - Provedor de IA configurado
 * @param model - Modelo selecionado
 * @param messages - Histórico de mensagens do chat
 * @param agent - Agente selecionado (opcional, injeta systemPrompt)
 * @param sessionId - ID da sessão (para provedores N8N)
 * @param signal - AbortSignal para cancelar streaming
 */
export async function* streamChatCompletion(
  provider: AIProvider,
  model: AIModel,
  messages: ChatMessage[],
  agent?: Agent,
  sessionId?: string,
  signal?: AbortSignal
): AsyncGenerator<StreamEvent, void, unknown> {
  // USA BACKEND PROXY (evita cross-domain, backend injeta API key)
  const url = `/api/ai/${provider.id}/chat/completions`

  try {
    // Headers simples - backend cuida da autenticação
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }

    // Injeta system prompt do agente (se fornecido)
    const messagesWithAgent = injectAgentSystemPrompt(messages, agent)

    // Monta payload (OpenAI-compatible)
    const payload: any = {
      model: model.apiModelId,
      messages: messagesWithAgent,
      stream: true
    }

    // Adiciona reasoning_effort se especificado (exceto "default" que é o comportamento padrão)
    if (model.reasoningEffort && model.reasoningEffort !== 'default') {
      payload.reasoning_effort = model.reasoningEffort
    }

    // Para compatibilidade com N8N (apenas para provedor NIC)
    if (sessionId && provider.id === 'nic') {
      payload.sessionId = sessionId
      payload.action = 'sendMessage'
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Stream error: ${response.status} ${response.statusText} - ${errorText}`)
    }

    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error('Response body is not readable')
    }

    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        const trimmed = line.trim()

        // Ignora linhas vazias
        if (!trimmed) continue

        // OpenAI SSE format: "data: {...}"
        if (trimmed.startsWith('data: ')) {
          const data = trimmed.substring(6) // Remove "data: "

          // Ignora marcador de fim do stream
          if (data === '[DONE]') continue

          try {
            const parsed = JSON.parse(data)

            // Converte formato OpenAI para nosso formato StreamEvent
            if (parsed.choices && parsed.choices[0]) {
              const delta = parsed.choices[0].delta
              const content = delta?.content

              if (content) {
                yield {
                  event: 'token',
                  data: { content }
                }
              }

              // Detecta fim do stream
              if (parsed.choices[0].finish_reason) {
                yield {
                  event: 'done',
                  data: { content: '' }
                }
              }
            }
          } catch (e) {
            console.warn('Failed to parse OpenAI SSE event:', data, e)
          }
        }
        // Formato N8N legado (JSON direto)
        else {
          try {
            const event = JSON.parse(trimmed) as StreamEvent
            yield event
          } catch (e) {
            console.warn('Failed to parse SSE event:', trimmed, e)
          }
        }
      }
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.log('Stream aborted by user')
    } else {
      console.error('Streaming error:', error)
      throw error
    }
  }
}

/**
 * Valida se o conteúdo do evento é válido (não é undefined/empty)
 */
export function isValidContent(content: string | undefined): boolean {
  return content !== undefined && content !== 'undefined' && content.trim() !== ''
}

/**
 * Converte histórico do chat para formato OpenAI messages
 */
export function convertToOpenAIMessages(chatHistory: Array<{ role: string; content: string }>): ChatMessage[] {
  return chatHistory.map(msg => ({
    role: msg.role as 'user' | 'assistant' | 'system',
    content: msg.content
  }))
}
