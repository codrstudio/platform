/**
 * Agent Types - Estruturas para agentes de chat (built-in, n8n-provided e custom)
 */

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
