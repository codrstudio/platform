/**
 * Tipos TypeScript para Streaming de Chat (N8N e OpenAI)
 */

export type StreamEventType = 'begin' | 'item' | 'end' | 'token' | 'done'

export interface StreamMetadata {
  nodeId?: string
  nodeName?: string
  itemIndex?: number
  runIndex?: number
  timestamp?: number
}

/**
 * Evento de streaming unificado (suporta N8N e OpenAI)
 */
export interface StreamEvent {
  /** Tipo do evento (token, done, begin, item, end) */
  event: StreamEventType

  /** Dados do evento */
  data?: {
    content?: string
    [key: string]: any
  }

  /** Tipo legado N8N */
  type?: StreamEventType

  /** Conteúdo legado N8N */
  content?: string

  /** Metadados opcionais */
  metadata?: StreamMetadata
}

export interface StreamingMessage {
  id: string
  content: string
  isComplete: boolean
  currentNode?: string
}
