/**
 * Chat Service - Gerenciamento de conversas e persistência
 * Versão simplificada para NIC Chat
 */

import { Message, ProactiveInsight } from '@/types/chat'

/**
 * Carregar conversa do localStorage
 */
export async function loadConversation(_conversationId?: string): Promise<Message[]> {
  // Buscar do localStorage
  const stored = localStorage.getItem('nic_chat_messages')
  if (stored) {
    const parsed = JSON.parse(stored)
    return parsed.map((m: any) => ({
      ...m,
      timestamp: new Date(m.timestamp)
    }))
  }

  return []
}

/**
 * Salvar conversa no localStorage
 */
export async function saveConversation(messages: Message[]): Promise<string> {
  const conversationId = `conv-${Date.now()}`

  localStorage.setItem('nic_chat_messages', JSON.stringify(messages))

  return conversationId
}

/**
 * Atualizar conversa existente
 */
export async function updateConversation(_conversationId: string, messages: Message[]): Promise<void> {
  localStorage.setItem('nic_chat_messages', JSON.stringify(messages))
}

/**
 * Limpar histórico de mensagens
 */
export function clearHistory(): void {
  localStorage.removeItem('nic_chat_messages')
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
