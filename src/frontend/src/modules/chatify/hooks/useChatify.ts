/**
 * useChatify - Hook para gerenciamento de chat (substitui ChatContext)
 *
 * Migrado de examples/chat/src/contexts/ChatContext.tsx
 * Convertido para hook puro usando JQEL + TanStack Query
 *
 * Features:
 * - Usa useJQELQuery para carregar mensagens (schema: 'chatify')
 * - Usa useJQELMutation para persist airst
 * - Optimistic updates para UX responsiva
 * - Streaming SSE para respostas de IA
 * - Suporte a múltiplos provedores (OpenAI-compatible)
 * - Sistema de agentes com system prompts
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { useJQELQuery, useJQELInsert, useJQELDelete } from '@/hooks/useJQEL'
import type { Message } from '../types'
import type { AIProvider, AIModel, Agent } from '../types'
import * as aiChatService from '../services/aiChatService'

const LAST_READ_KEY = 'chatLastRead'

/**
 * Gera um sessionId único (UUID v4)
 */
function generateSessionId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

interface UseChatifyOptions {
  conversationId?: string
}

export function useChatify(options: UseChatifyOptions = {}) {
  const { conversationId = 'default' } = options

  // Estado local
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string>(() => generateSessionId())
  const [selectedProvider, setSelectedProvider] = useState<AIProvider | null>(null)
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null)
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const [lastReadTimestamp, setLastReadTimestamp] = useState<Date>(() => {
    try {
      const saved = localStorage.getItem(LAST_READ_KEY)
      return saved ? new Date(saved) : new Date()
    } catch {
      return new Date()
    }
  })

  // Query JQEL para carregar mensagens
  const { data: messagesResult, refetch } = useJQELQuery<Message[]>({
    schema: 'chatify',
    select: 'message',
    where: { conversationId: { $eq: conversationId } },
    options: { orderBy: [{ field: 'timestamp', direction: 'asc' }] }
  }, {
    enabled: true
  })

  // Mutations JQEL
  const insertMutation = useJQELInsert<Message>('chatify', 'message')
  const deleteMutation = useJQELDelete<null>('chatify', 'message')

  // Sincronizar messages com query result
  useEffect(() => {
    if (messagesResult?.data) {
      // Converter timestamps de string para Date
      const messagesWithDates = messagesResult.data.map((m: any) => ({
        ...m,
        timestamp: new Date(m.timestamp)
      }))
      setMessages(messagesWithDates)
    }
  }, [messagesResult])

  // Salvar lastReadTimestamp quando mudar
  useEffect(() => {
    try {
      localStorage.setItem(LAST_READ_KEY, lastReadTimestamp.toISOString())
    } catch (error) {
      console.error('Error saving last read timestamp:', error)
    }
  }, [lastReadTimestamp])

  // Calcular insights não lidos
  const unreadInsightsCount = messages.filter(
    msg => msg.role === 'assistant' && msg.timestamp > lastReadTimestamp
  ).length

  const markInsightsAsRead = useCallback(() => {
    setLastReadTimestamp(new Date())
  }, [])

  const loadHistory = useCallback(async () => {
    await refetch()
  }, [refetch])

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return

    // Verificar se há modelo e provedor selecionados
    if (!selectedProvider || !selectedModel) {
      console.warn('Nenhum modelo disponível. Configure um modelo antes de enviar mensagens.')
      return
    }

    // Verificar se já está processando
    if (isLoading) {
      console.warn('Chat ocupado. Aguarde a resposta ou cancele')
      return
    }

    // Abortar streaming anterior se houver
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    abortControllerRef.current = new AbortController()

    // Adicionar mensagem do usuário (com optimistic update)
    const userMsg: Message = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      role: 'user',
      content,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMsg])

    // Persist user message
    insertMutation.mutate({
      values: {
        ...userMsg,
        conversationId,
        timestamp: userMsg.timestamp.toISOString()
      }
    })

    setIsLoading(true)

    // Criar mensagem assistant vazia para streaming incremental
    const assistantMsgId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const tempMessage: Message = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      // Capturar snapshot do agente atual
      agentSnapshot: selectedAgent ? {
        name: selectedAgent.name,
        title: selectedAgent.title,
        icon: selectedAgent.icon,
        description: selectedAgent.description
      } : undefined
    }
    setMessages(prev => [...prev, tempMessage])

    try {
      // Converte histórico para formato OpenAI messages
      const chatHistory = aiChatService.convertToOpenAIMessages(
        messages.map(m => ({ role: m.role, content: m.content }))
      )

      // Adiciona mensagem atual
      chatHistory.push({ role: 'user', content })

      // Stream via provedor selecionado
      for await (const event of aiChatService.streamChatCompletion(
        selectedProvider,
        selectedModel,
        chatHistory,
        selectedAgent || undefined,
        sessionId,
        abortControllerRef.current.signal
      )) {
        // Processar eventos de streaming
        if (event.event === 'token' && event.data && aiChatService.isValidContent(event.data?.content)) {
          setMessages(prev =>
            prev.map(msg =>
              msg.id === assistantMsgId
                ? { ...msg, content: msg.content + (event.data?.content || '') }
                : msg
            )
          )
        }
      }

      // Persist assistant message final
      const finalAssistantMsg = messages.find(m => m.id === assistantMsgId)
      if (finalAssistantMsg) {
        insertMutation.mutate({
          values: {
            ...finalAssistantMsg,
            conversationId,
            timestamp: finalAssistantMsg.timestamp.toISOString()
          }
        })
      }
    } catch (error: any) {
      console.error('Error generating AI response:', error)

      // Se não foi abortado pelo usuário, mostrar erro
      if (error.name !== 'AbortError') {
        setMessages(prev =>
          prev.map(msg =>
            msg.id === assistantMsgId
              ? { ...msg, content: msg.content + '\n\n⚠️ Erro ao receber resposta. Por favor, tente novamente.' }
              : msg
          )
        )
      }
    }

    setIsLoading(false)
  }, [
    selectedProvider,
    selectedModel,
    selectedAgent,
    isLoading,
    conversationId,
    sessionId,
    messages,
    insertMutation
  ])

  const cancelMessage = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      setIsLoading(false)
    }
  }, [])

  const startNewChat = useCallback(() => {
    // Abortar streaming atual se houver
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Gerar novo sessionId
    const newSessionId = generateSessionId()
    setSessionId(newSessionId)

    // Limpar histórico
    setMessages([])
    setIsLoading(false)

    // Delete all messages via JQEL
    deleteMutation.mutate({
      where: { conversationId: { $eq: conversationId } }
    })
  }, [conversationId, deleteMutation])

  const clearHistory = useCallback(async () => {
    setMessages([])

    // Delete via JQEL
    deleteMutation.mutate({
      where: { conversationId: { $eq: conversationId } }
    })
  }, [conversationId, deleteMutation])

  // Cleanup: abortar streaming ao desmontar
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  return {
    messages,
    isLoading,
    sessionId,
    selectedProvider,
    selectedModel,
    selectedAgent,
    setSelectedProvider,
    setSelectedModel,
    setSelectedAgent,
    sendMessage,
    cancelMessage,
    startNewChat,
    clearHistory,
    loadHistory,
    unreadInsightsCount,
    markInsightsAsRead
  }
}
