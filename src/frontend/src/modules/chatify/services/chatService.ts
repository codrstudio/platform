/**
 * Chat Service - Gerenciamento de conversas e persistência
 * Versão adaptada para usar JQEL ao invés de localStorage
 *
 * Migrado de examples/chat/ conforme PLAN_CHATIFY.md Fase 1.3
 */

import type { Message, ProactiveInsight } from '../types'
import { jqelClient } from '@/services/jqelClient'

/**
 * Carregar conversa via JQEL
 *
 * @param conversationId - ID da conversa (opcional, padrão: "default")
 */
export async function loadConversation(conversationId?: string): Promise<Message[]> {
  try {
    const convId = conversationId || 'default'

    const result = await jqelClient.select<Message[]>(
      'chatify',
      'message',
      {
        where: { conversationId: { $eq: convId } },
        orderBy: [{ field: 'timestamp', direction: 'asc' }]
      }
    )

    if (result.data && Array.isArray(result.data)) {
      // Converter timestamps de string para Date
      return result.data.map((m: any) => ({
        ...m,
        timestamp: new Date(m.timestamp)
      }))
    }

    return []
  } catch (error) {
    console.error('[ChatService] Erro ao carregar conversa:', error)
    return []
  }
}

/**
 * Salvar conversa via JQEL
 *
 * @param messages - Array de mensagens a salvar
 * @param conversationId - ID da conversa (opcional, será gerado se não fornecido)
 * @returns ID da conversa
 */
export async function saveConversation(messages: Message[], conversationId?: string): Promise<string> {
  try {
    const convId = conversationId || `conv-${Date.now()}`

    // Salvar cada mensagem individualmente
    for (const message of messages) {
      await jqelClient.mutate(
        'chatify',
        'message',
        'insert',
        {
          values: {
            ...message,
            conversationId: convId,
            timestamp: message.timestamp.toISOString()
          }
        }
      )
    }

    return convId
  } catch (error) {
    console.error('[ChatService] Erro ao salvar conversa:', error)
    throw error
  }
}

/**
 * Atualizar conversa existente via JQEL
 *
 * @param conversationId - ID da conversa
 * @param messages - Novo array de mensagens
 */
export async function updateConversation(conversationId: string, messages: Message[]): Promise<void> {
  try {
    // Estratégia: deletar todas as mensagens antigas e inserir novas
    // Alternativa futura: implementar diff e apenas atualizar o necessário

    // 1. Deletar mensagens existentes
    await jqelClient.mutate(
      'chatify',
      'message',
      'delete',
      {
        where: { conversationId: { $eq: conversationId } }
      }
    )

    // 2. Inserir novas mensagens
    for (const message of messages) {
      await jqelClient.mutate(
        'chatify',
        'message',
        'insert',
        {
          values: {
            ...message,
            conversationId,
            timestamp: message.timestamp.toISOString()
          }
        }
      )
    }
  } catch (error) {
    console.error('[ChatService] Erro ao atualizar conversa:', error)
    throw error
  }
}

/**
 * Limpar histórico de mensagens via JQEL
 *
 * @param conversationId - ID da conversa (opcional, padrão: "default")
 */
export async function clearHistory(conversationId?: string): Promise<void> {
  try {
    const convId = conversationId || 'default'

    await jqelClient.mutate(
      'chatify',
      'message',
      'delete',
      {
        where: { conversationId: { $eq: convId } }
      }
    )
  } catch (error) {
    console.error('[ChatService] Erro ao limpar histórico:', error)
    throw error
  }
}

/**
 * Gerar insights proativos
 */
export async function generateProactiveInsights(): Promise<ProactiveInsight[]> {
  return [{
    message: "👋 Olá! Pergunte-me sobre o NIC Chat e suas funcionalidades.",
    suggestedQuestion: "Como funciona a jornada de descoberta?"
  }]
}

/**
 * Sugestões de perguntas para o NIC Chat
 */
export const SUGGESTED_QUESTIONS = [
  "O que é o NIC Chat?",
  "Como funciona a gamificação?",
  "Quais são as etapas da jornada?",
  "Como posso configurar o chat?",
  "Quais recursos estão disponíveis?",
  "Como funciona o sistema de progresso?",
  "O que é o widget de próxima etapa?",
  "Como personalizar o tema?"
]

/**
 * Buscar insights não lidos
 */
export async function getUnreadInsights(): Promise<number> {
  return 0
}
