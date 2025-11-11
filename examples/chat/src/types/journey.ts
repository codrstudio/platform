// types/journey.ts
/**
 * Sistema de Jornada de Descoberta - Definições de Tipos
 *
 * Define todas as interfaces e tipos TypeScript para o sistema de gamificação
 * profissional que guia usuários através da jornada de descoberta do NIC Chat.
 */

/**
 * Fases da jornada de descoberta NIC
 * - descoberta: 0-25% (primeiros passos)
 * - exploracao: 25-50% (explorando recursos)
 * - dominio: 50-75% (aprofundando conhecimento)
 * - maestria: 75-99% (dominando o sistema)
 * - completo: 100% atingido
 */
export type JourneyPhase = 'descoberta' | 'exploracao' | 'dominio' | 'maestria' | 'completo'

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
 * Armazenado em localStorage com chave 'nic-chat-journey-progress'
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

/**
 * Interface do Context Provider
 * Define todas as funções disponíveis para consumo via hook
 */
export interface JourneyProgressContextType {
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

  /** Reinicia a jornada completamente (limpa localStorage) */
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
