/**
 * Chatify Module - Type Definitions
 *
 * Sistema avançado de chat com IA, incluindo:
 * - Múltiplos provedores de IA (NIC, OpenAI)
 * - Sistema de agentes (built-in, N8N, custom)
 * - Streaming SSE unificado
 * - Gamificação/Jornada de descoberta
 * - Renderização avançada (Markdown + Mermaid + Imagens)
 *
 * Adaptado de: examples/chat (NIC Chat standalone)
 */

// ==================== CHAT TYPES ====================

export type MessageRole = 'user' | 'assistant' | 'system'

export interface Message {
  id: string
  role: MessageRole
  content: string
  timestamp: Date
  /** Snapshot imutável do agente que gerou esta resposta (persiste no histórico) */
  agentSnapshot?: {
    name: string // Identificador único (ex: "nic-avalia")
    title: string // Nome exibido (ex: "NIC Avalia")
    icon?: string // Nome Lucide kebab-case (ex: "sparkles") ou emoji (ex: "🤖")
    description?: string // Descrição para tooltip
  }
}

export interface Conversation {
  id: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
}

export interface ProactiveInsight {
  message: string
  suggestedQuestion?: string
}

// ==================== AGENT TYPES ====================

/**
 * Tipo de origem do agente
 */
export type AgentSource = 'built-in' | 'n8n' | 'custom'

/**
 * Anexo de um agente (documentos, URLs, contexto adicional)
 */
export interface AgentAttachment {
  /** ID único do anexo */
  id: string

  /** Nome do anexo */
  name: string

  /** Tipo de anexo */
  type: 'url' | 'text' | 'file'

  /** Conteúdo do anexo (URL, texto plano, ou base64) */
  content: string

  /** Metadados opcionais */
  metadata?: {
    mimeType?: string
    size?: number
    description?: string
    [key: string]: any
  }
}

/**
 * Agente de chat - pode ser built-in (configurado no .env), n8n-provided ou custom (configurado pelo usuário)
 */
export interface Agent {
  /** Nome identificador único do agente (ex: "nic", "recruitment") */
  name: string

  /** Título exibido na UI */
  title: string

  /** Descrição do propósito/especialidade do agente */
  description: string

  /** System prompt que define o comportamento do agente */
  systemPrompt: string

  /**
   * URL do endpoint do webhook n8n (opcional)
   *
   * - Agentes N8N: Resolvido automaticamente no backend ao buscar agentes
   * - Agentes custom: Deve ser URL completa (http/https)
   * - Agentes built-in: Opcional, usa provider/model padrão se omitido
   *
   * O backend resolve endpoints relativos usando N8N_BASE_URL:
   * - URL completa → mantém sem modificar
   * - /webhook/... → resolve para host N8N
   * - /... → resolve para /webhook no host N8N
   * - sem / → resolve relativo à base de agentes
   *
   * @example "https://n8n.codrstudio.dev/webhook/nic/v1/agents/nic-avalia/completions" (resolvido)
   */
  endpoint?: string

  /** Ícone do agente (emoji ou nome de ícone) */
  icon?: string

  /**
   * Cor do ícone (aplica-se ao fundo do ícone)
   *
   * - Ícone Lucide + cor → fundo colorido, ícone branco
   * - Emoji + cor → fundo colorido, emoji renderizado normal
   * - Sem cor → padrão cinza neutro
   *
   * Aceita nomes CSS (ex: "purple", "blue") ou hex (ex: "#3D95DF")
   *
   * @example "purple" → Fundo roxo
   * @example "#3D95DF" → Fundo azul NIC
   */
  color?: string

  /** Tags para categorização e busca */
  tags?: string[]

  /** Se o agente está habilitado */
  enabled: boolean

  /** Tipo de origem do agente */
  source: AgentSource

  /** @deprecated Use source === 'built-in' */
  isBuiltIn: boolean
}

/**
 * Agente built-in configurado via .env
 * enabled=false tem precedência absoluta sobre preferências do usuário
 */
export interface BuiltInAgent extends Agent {
  source: 'built-in'
  isBuiltIn: true
}

/**
 * Agente fornecido pelo N8N (descoberto dinamicamente)
 * Workflows n8n que expõem endpoints de chat com metadados
 */
export interface N8NAgent extends Agent {
  source: 'n8n'
  isBuiltIn: false

  /** ID do workflow n8n */
  workflowId?: string
}

/**
 * Agente custom configurado pelo usuário via UI
 */
export interface CustomAgent extends Agent {
  source: 'custom'
  isBuiltIn: false

  /** Anexos do agente (documentos, URLs, contexto adicional) */
  attachments?: AgentAttachment[]

  /** Data de criação do agente custom */
  createdAt: string

  /** Data da última atualização */
  updatedAt: string
}

/**
 * Preferências de habilitação de agentes por usuário
 * Apenas aplicável a agentes built-in com enabled=true no .env
 */
export interface AgentUserPreferences {
  [agentName: string]: boolean
}

/**
 * Configuração completa de agentes
 */
export interface AgentConfig {
  /** Agentes built-in parseados do .env */
  builtIn: BuiltInAgent[]

  /** Agentes fornecidos pelo N8N (descobertos dinamicamente) */
  n8n: N8NAgent[]

  /** Agentes custom salvos pelo usuário */
  custom: CustomAgent[]

  /** Preferências do usuário para agentes built-in */
  userPreferences: AgentUserPreferences
}

/**
 * Payload de mensagem com contexto de agente
 */
export interface AgentMessagePayload {
  /** Mensagem do usuário */
  message: string

  /** Agente selecionado */
  agent: Agent

  /** Histórico de mensagens */
  history: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>

  /** Stream de resposta */
  stream?: boolean
}

// ==================== PROVIDER TYPES ====================

/**
 * Provedor de IA - empresa/serviço que fornece modelos de linguagem
 * Exemplos: NIC, OpenAI, Anthropic, Google
 */
export interface AIProvider {
  /** ID único do provedor (ex: "nic", "openai") */
  id: string

  /** Nome exibido na UI (ex: "NIC", "OpenAI") */
  name: string

  /** URL base da API (sempre termina com /) */
  baseUrl: string

  /** Se o provedor está habilitado */
  enabled: boolean

  /** Se o provedor requer autenticação (API key) */
  requiresAuth: boolean

  /** Modelos disponíveis neste provedor */
  models: AIModel[]
}

/**
 * Modelo de IA - modelo específico de um provedor
 * Exemplos: GPT-5, Claude Sonnet, NIC Auto
 */
export interface AIModel {
  /** ID único do modelo (ex: "gpt-5-auto", "nic-reflexivo") */
  id: string

  /** Nome exibido na UI (ex: "GPT-5 Auto", "NIC Reflexivo") */
  name: string

  /** ID do provedor ao qual pertence */
  providerId?: string

  /** ID do modelo usado na API (ex: "gpt-5", "nic") */
  apiModelId: string

  /** Descrição do modelo */
  description?: string

  /** Nível de raciocínio (reasoning effort) para modelos que suportam */
  reasoningEffort?: 'default' | 'minimal' | 'low' | 'medium' | 'high'
}

/**
 * Seleção de modelo - referência ao modelo escolhido pelo usuário
 */
export interface ModelSelection {
  /** ID do provedor */
  providerId: string

  /** ID do modelo */
  modelId: string
}

/**
 * Configuração de API keys
 */
export interface APIKeys {
  [providerId: string]: string | undefined
}

// ==================== JOURNEY TYPES ====================

/**
 * Fases da jornada de descoberta
 * - descoberta: 0-25% (primeiros passos)
 * - exploracao: 25-50% (explorando recursos)
 * - dominio: 50-75% (aprofundando conhecimento)
 * - maestria: 75-99% (dominando o sistema)
 * - completo: 100% atingido
 */
export type JourneyPhase =
  | 'descoberta'
  | 'exploracao'
  | 'dominio'
  | 'maestria'
  | 'completo'

/**
 * Representa um passo individual na jornada
 */
export interface JourneyStep {
  /** ID único do step (ex: "descoberta-home", "exploracao-chat") */
  id: string

  /** Caminho da rota (ex: "/", "/chat", "/admin") */
  path: string

  /** Section hash opcional para páginas com âncoras (ex: "features" para "/#features") */
  section?: string

  /** Label amigável exibido ao usuário */
  label: string

  /** Fase à qual este step pertence */
  phase: JourneyPhase

  /** Peso em porcentagem (soma total deve ser 100) */
  weight: number

  // ==================== CAMPOS DE ONBOARDING ====================

  /** Caminho para arquivo Markdown com conteúdo do guia (ex: "/content/journey/descoberta-home.md") */
  contentPath?: string

  /** Descrição curta da etapa (1-2 linhas para preview) */
  description?: string

  /** Ícone emoji representando a etapa */
  icon?: string

  /** Tempo estimado para completar (ex: "3 min", "10 min") */
  estimatedTime?: string

  /** Lista de objetivos de aprendizado */
  objectives?: string[]

  /** IDs de etapas que devem ser completadas antes desta (pré-requisitos) */
  prerequisites?: string[]

  /** URL para documentação completa externa */
  docsUrl?: string

  /** URL para vídeo tutorial */
  videoUrl?: string

  /** Tags para categorização e busca */
  tags?: string[]
}

/**
 * Metadata extraído do frontmatter YAML dos arquivos Markdown
 */
export interface StepContentMetadata {
  id: string
  title: string
  estimatedTime?: string
  objectives?: string[]
  prerequisites?: string[]
  docsUrl?: string
  videoUrl?: string
  icon?: string
  tags?: string[]
}

/**
 * Conteúdo completo de uma etapa (metadata + markdown)
 */
export interface StepContent {
  metadata: StepContentMetadata
  markdown: string
  isLoading: boolean
  error: Error | null
}

/**
 * Estado completo do progresso da jornada
 * Armazenado via storage service com debounce
 */
export interface JourneyProgress {
  /** IDs das páginas visitadas */
  visitedPages: string[]

  /** ID da última página visitada */
  lastVisited: string

  /** Porcentagem de conclusão (0-100) */
  completionPercentage: number

  /** Timestamp da última atualização (Date.now()) */
  timestamp: number

  /** Fase atual baseada no progresso */
  currentPhase: JourneyPhase

  /** Se já mostrou o modal de conquista 100% */
  achievementShown: boolean

  /** Se usuário dispensou globalmente o widget de próxima etapa */
  widgetDismissed: boolean

  /** Se já mostrou a mensagem de boas-vindas do widget */
  welcomeShown: boolean

  /** Configurações de exibição do usuário */
  settings: {
    /** Mostrar barra de progresso no header */
    showProgressBar: boolean

    /** Mostrar widget flutuante de próxima etapa */
    showNextStepWidget: boolean
  }
}

// ==================== STREAMING TYPES ====================

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

// ==================== HOOK STATE TYPES ====================

/**
 * Estado retornado pelo useChatify hook
 */
export interface ChatifyHookState {
  // Data
  messages: Message[]
  conversations: Conversation[]

  // Estados
  isLoading: boolean
  isSending: boolean
  chatState: 'idle' | 'typing' | 'processing' | 'error'

  // Seleção atual
  sessionId: string
  selectedProvider: AIProvider | null
  selectedModel: AIModel | null
  selectedAgent: Agent | null

  // Insights
  unreadInsightsCount: number

  // Actions
  sendMessage: (content: string) => Promise<void>
  cancelMessage: () => void
  startNewChat: () => void
  clearHistory: () => void
  loadHistory: () => void
  markInsightsAsRead: () => void
  setSelectedProvider: (provider: AIProvider | null) => void
  setSelectedModel: (model: AIModel | null) => void
  setSelectedAgent: (agent: Agent | null) => void
  createConversation: () => Promise<string>
  switchConversation: (id: string) => void
  retryMessage: (id: string) => Promise<void>
}

/**
 * Estado retornado pelo useJourneyProgress hook
 */
export interface JourneyProgressHookState {
  /** Estado completo do progresso */
  progress: JourneyProgress

  /** Marca uma página como visitada pelo ID */
  markPageVisited: (pageId: string) => void

  /** Verifica se uma página foi visitada */
  isPageVisited: (pageId: string) => boolean

  /** Retorna próxima etapa recomendada (null se jornada completa) */
  getNextRecommendedStep: () => JourneyStep | null

  /** Retorna a etapa atual baseada em pathname e hash (null se não encontrado) */
  getCurrentStep: (pathname: string, hash?: string) => JourneyStep | null

  /** Reinicia a jornada completamente */
  resetJourney: () => void

  /** Dispensa globalmente o widget de próxima etapa */
  dismissWidget: () => void

  /** Reabre o widget após ter sido dispensado */
  undismissWidget: () => void

  /** Marca que a mensagem de boas-vindas foi exibida */
  markWelcomeShown: () => void

  /** Marca que o modal de conquista já foi exibido */
  markAchievementShown: () => void

  /** Atualiza configurações de exibição */
  updateSettings: (settings: Partial<JourneyProgress['settings']>) => void

  /** Verifica se jornada está 100% completa */
  isJourneyComplete: () => boolean

  /** Porcentagem de conclusão (atalho para progress.completionPercentage) */
  completionPercentage: number

  /** Fase atual (atalho para progress.currentPhase) */
  currentPhase: JourneyPhase

  /** Settings (atalho para progress.settings) */
  settings: JourneyProgress['settings']
}

// ==================== INSTANCE CONFIG ====================

/**
 * Configuração de instância do módulo Chatify
 * Define todas as opções configuráveis do chat
 */
export interface ChatifyInstanceConfig {
  // ==================== REQUIRED ====================
  /** ID do agente padrão */
  agentId: string

  /** Rota base do módulo (relativa ao portal) */
  route: string

  // ==================== DISPLAY ====================
  /** Título exibido no header */
  title?: string

  /** Descrição/subtítulo do chat */
  description?: string

  /** Placeholder do input */
  placeholder?: string

  /** Mensagem de boas-vindas */
  welcomeMessage?: string

  /** Sugestões rápidas de perguntas */
  quickSuggestions?: string[]

  // ==================== FILE UPLOAD ====================
  /** Permitir upload de arquivos */
  allowFileUpload?: boolean

  /** Tipos de arquivo aceitos (MIME types) */
  acceptedFileTypes?: string[]

  /** Tamanho máximo de arquivo (bytes) */
  maxFileSize?: number

  // ==================== EXPORT ====================
  /** Habilitar exportação de conversas */
  enableExport?: boolean

  /** Formatos de exportação permitidos */
  exportFormats?: ('pdf' | 'markdown' | 'json')[]

  // ==================== FEATURES ====================
  /** Habilitar busca no histórico */
  enableSearch?: boolean

  /** Habilitar múltiplas conversas */
  enableMultipleConversations?: boolean

  /** Habilitar streaming SSE */
  enableStreaming?: boolean

  // ==================== INPUT ====================
  /** Comprimento máximo do input */
  maxInputLength?: number

  /** Auto-grow do textarea */
  autoGrowInput?: boolean

  /** Número máximo de linhas do input */
  maxInputRows?: number

  // ==================== DISPLAY PREFERENCES ====================
  /** Mostrar timestamps nas mensagens */
  showTimestamps?: boolean

  /** Mostrar indicador de digitação */
  showTypingIndicator?: boolean

  // ==================== PERSISTENCE ====================
  /** Persistir histórico no localStorage */
  persistHistory?: boolean

  /** Janela de contexto (número de mensagens) */
  contextWindow?: number

  // ==================== JOURNEY/GAMIFICATION ====================
  /** Habilitar sistema de jornada */
  enableJourney?: boolean

  /** Habilitar barra de progresso */
  showProgressBar?: boolean

  /** Habilitar widget de próxima etapa */
  showNextStepWidget?: boolean

  // ==================== ADVANCED ====================
  /** Habilitar modo debug */
  debugMode?: boolean

  /** Habilitar logs de performance */
  performanceLogs?: boolean

  /** Tema padrão (light/dark/system) */
  defaultTheme?: 'light' | 'dark' | 'system'
}
