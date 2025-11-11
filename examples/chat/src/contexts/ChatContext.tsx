/**
 * ChatContext - Gerenciamento de estado global do chat
 * Implementa Context API para mensagens, loading state, streaming e ações
 * Suporta streaming via múltiplos provedores de IA (OpenAI-compatible)
 * Suporta agentes com system prompts personalizados
 */

import { createContext, useState, useEffect, ReactNode, useRef } from 'react'
import { Message, ChatContextType, MessageRole } from '@/types/chat'
import type { AIProvider, AIModel } from '@/types/provider'
import type { Agent } from '@/types/agent'
import * as chatService from '@/services/chatService'
import * as aiChatService from '@/services/aiChatService'

export const ChatContext = createContext<ChatContextType | undefined>(undefined)

const LAST_READ_KEY = 'chatLastRead'

interface ChatProviderProps {
  children: ReactNode
}

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

export function ChatProvider({ children }: ChatProviderProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | undefined>()
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

  // Carregar histórico ao montar
  useEffect(() => {
    loadHistory()
  }, [])

  // Salvar histórico quando messages mudar
  useEffect(() => {
    if (messages.length > 0) {
      saveConversation()
    }
  }, [messages])

  // Salvar lastReadTimestamp quando mudar
  useEffect(() => {
    try {
      localStorage.setItem(LAST_READ_KEY, lastReadTimestamp.toISOString())
    } catch (error) {
      console.error('Error saving last read timestamp:', error)
    }
  }, [lastReadTimestamp])

  // Calcular insights não lidos (mensagens assistant após lastReadTimestamp)
  const unreadInsightsCount = messages.filter(
    msg => msg.role === 'assistant' && msg.timestamp > lastReadTimestamp
  ).length

  const markInsightsAsRead = () => {
    setLastReadTimestamp(new Date())
  }

  const loadHistory = async () => {
    try {
      const history = await chatService.loadConversation(conversationId)

      if (history && history.length > 0) {
        setMessages(history)
      }
      // Chat inicia vazio - usuário pode perguntar ou clicar em sugestões
    } catch (error) {
      console.error('Error loading chat history:', error)
    }
  }

  const saveConversation = async () => {
    try {
      if (conversationId) {
        await chatService.updateConversation(conversationId, messages)
      } else {
        const newId = await chatService.saveConversation(messages)
        setConversationId(newId)
      }
    } catch (error) {
      console.error('Error saving conversation:', error)

      // Fallback: limitar histórico se muito grande
      if (messages.length > 100) {
        const limited = messages.slice(-100)
        setMessages(limited)
      }
    }
  }

  /**
   * Inicia um novo chat: gera novo sessionId e limpa histórico
   */
  const startNewChat = () => {
    // Abortar streaming atual se houver
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Gerar novo sessionId
    const newSessionId = generateSessionId()
    setSessionId(newSessionId)

    // Limpar histórico
    setMessages([])
    setConversationId(undefined)
    setIsLoading(false)
    chatService.clearHistory()
    // Chat inicia vazio - usuário pode perguntar ou clicar em sugestões
  }

  /**
   * Cancela a mensagem em streaming atual
   */
  const cancelMessage = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      setIsLoading(false)
    }
  }

  const clearHistory = async () => {
    setMessages([])
    setConversationId(undefined)
    chatService.clearHistory()
    // Chat inicia vazio - usuário pode perguntar ou clicar em sugestões
  }

  const addMessage = (role: MessageRole, content: string) => {
    const newMessage: Message = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      role,
      content,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, newMessage])
  }

  const sendMessage = async (content: string) => {
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

    // Adicionar mensagem do usuário
    addMessage('user', content)
    setIsLoading(true)

    // Criar mensagem assistant vazia para streaming incremental
    const assistantMsgId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const tempMessage: Message = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      // Capturar snapshot do agente atual (persiste no histórico)
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

      // Stream via provedor selecionado (injeta systemPrompt do agente)
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
  }

  // Cleanup: abortar streaming ao desmontar
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  return (
    <ChatContext.Provider value={{
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
    }}>
      {children}
    </ChatContext.Provider>
  )
}
