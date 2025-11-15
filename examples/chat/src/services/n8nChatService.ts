/**
 * n8n Chat Service - Streaming SSE para chat com IA
 * Conecta direto no webhook n8n com suporte a streaming
 */

import { StreamEvent } from '@/types/streaming'

// Endpoint n8n padrão (fallback se nenhum agente for configurado)
// @ts-expect-error - Vite provides import.meta.env
const DEFAULT_N8N_CHAT_URL = import.meta.env.VITE_N8N_CHAT_URL || '/api/v1/chat/completions'

/**
 * Stream de mensagens do chat usando fetch + ReadableStream
 * Implementa AsyncGenerator para consumo via for await
 *
 * @param sessionId - ID da sessão do chat
 * @param chatInput - Mensagem do usuário
 * @param endpoint - URL do webhook do agente (opcional, usa DEFAULT_N8N_CHAT_URL se não fornecido)
 * @param signal - AbortSignal para cancelar streaming
 */
export async function* streamChatCompletion(
  sessionId: string,
  chatInput: string,
  endpoint?: string,
  signal?: AbortSignal
): AsyncGenerator<StreamEvent, void, unknown> {
  const url = endpoint || DEFAULT_N8N_CHAT_URL

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        action: 'sendMessage',  // OBRIGATÓRIO para n8n
        chatInput
      }),
      signal
    })

    if (!response.ok) {
      throw new Error(`Stream error: ${response.status} ${response.statusText}`)
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
        if (line.trim()) {
          try {
            const event = JSON.parse(line) as StreamEvent
            yield event
          } catch (e) {
            console.warn('Failed to parse SSE event:', line, e)
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
