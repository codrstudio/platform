// utils/journeyMap.ts
/**
 * Mapa da Jornada de Descoberta NIC - 14 Etapas
 *
 * Define a sequência completa de páginas que compõem a jornada do usuário,
 * com distribuição de pesos que soma exatamente 100%.
 *
 * Estrutura:
 * - Descoberta (0-25%): 4 steps × 6.25% = 25%
 * - Exploração (25-50%): 3 steps × 8.33% = ~25%
 * - Domínio (50-75%): 4 steps × 6.25% = 25%
 * - Maestria (75-100%): 3 steps × 8.33% = ~25%
 * Total: 100%
 */

import { JourneyStep, JourneyPhase } from '@/types/journey'

/**
 * Mapa completo da jornada com 14 etapas
 */
export const JOURNEY_MAP: JourneyStep[] = [
  // ==================== DESCOBERTA (25%) ====================
  {
    id: 'descoberta-home',
    path: '/',
    label: 'Página Inicial',
    phase: 'descoberta',
    weight: 6.25,
    contentPath: '/content/journey/descoberta-home.md',
    description: 'Conheça o NIC Chat e suas principais funcionalidades nesta página de boas-vindas.'
  },
  {
    id: 'descoberta-features',
    path: '/',
    section: 'features',
    label: 'Recursos do NIC',
    phase: 'descoberta',
    weight: 6.25,
    contentPath: '/content/journey/descoberta-features.md',
    description: 'Explore todos os recursos avançados: streaming, markdown, diagramas e gamificação.'
  },
  {
    id: 'descoberta-como-usar',
    path: '/',
    section: 'como-usar',
    label: 'Como Usar',
    phase: 'descoberta',
    weight: 6.25,
    contentPath: '/content/journey/descoberta-como-usar.md',
    description: 'Aprenda o passo a passo para começar a usar o NIC Chat de forma eficiente.'
  },
  {
    id: 'descoberta-cta',
    path: '/',
    section: 'cta',
    label: 'Comece Agora',
    phase: 'descoberta',
    weight: 6.25,
    contentPath: '/content/journey/descoberta-cta.md',
    description: 'Dê o primeiro passo e comece sua jornada no NIC Chat agora mesmo.'
  },

  // ==================== EXPLORAÇÃO (25%) ====================
  {
    id: 'exploracao-chat',
    path: '/chat',
    label: 'Interface de Chat',
    phase: 'exploracao',
    weight: 8.34,
    contentPath: '/content/journey/exploracao-chat.md',
    description: 'Interface principal para conversar com a IA em tempo real. Envie mensagens e receba respostas inteligentes.'
  },
  {
    id: 'exploracao-primeira-mensagem',
    path: '/chat',
    section: 'primeira-mensagem',
    label: 'Primeira Conversa',
    phase: 'exploracao',
    weight: 8.33,
    contentPath: '/content/journey/exploracao-primeira-mensagem.md',
    description: 'Experimente enviar sua primeira mensagem e veja a IA responder em tempo real.'
  },
  {
    id: 'exploracao-streaming',
    path: '/chat',
    section: 'streaming',
    label: 'Streaming de Respostas',
    phase: 'exploracao',
    weight: 8.33,
    contentPath: '/content/journey/exploracao-streaming.md',
    description: 'Observe as respostas sendo geradas palavra por palavra, como em uma conversa natural.'
  },

  // ==================== DOMÍNIO (25%) ====================
  {
    id: 'dominio-admin',
    path: '/admin',
    label: 'Painel Admin',
    phase: 'dominio',
    weight: 6.25,
    contentPath: '/content/journey/dominio-admin.md',
    description: 'Acesse configurações avançadas e gerencie todos os aspectos do NIC Chat.'
  },
  {
    id: 'dominio-jornada',
    path: '/admin',
    section: 'jornada',
    label: 'Configurar Jornada',
    phase: 'dominio',
    weight: 6.25,
    contentPath: '/content/journey/dominio-jornada.md',
    description: 'Personalize o sistema de gamificação e controle a exibição da jornada.'
  },
  {
    id: 'dominio-chat-config',
    path: '/admin',
    section: 'chat',
    label: 'Configurar Chat',
    phase: 'dominio',
    weight: 6.25,
    contentPath: '/content/journey/dominio-chat-config.md',
    description: 'Ajuste o comportamento do chat, provedores e opções de renderização.'
  },
  {
    id: 'dominio-historico',
    path: '/admin',
    section: 'historico',
    label: 'Gerenciar Histórico',
    phase: 'dominio',
    weight: 6.25,
    contentPath: '/content/journey/dominio-historico.md',
    description: 'Visualize, exporte ou limpe o histórico completo de conversas.'
  },

  // ==================== MAESTRIA (25%) ====================
  {
    id: 'maestria-widget',
    path: '/',
    section: 'widget',
    label: 'Widget de Chat',
    phase: 'maestria',
    weight: 8.34,
    contentPath: '/content/journey/maestria-widget.md',
    description: 'Descubra como incorporar o NIC Chat em outras páginas através do widget flutuante.'
  },
  {
    id: 'maestria-gamificacao',
    path: '/admin',
    section: 'gamificacao',
    label: 'Sistema de Gamificação',
    phase: 'maestria',
    weight: 8.33,
    contentPath: '/content/journey/maestria-gamificacao.md',
    description: 'Entenda como funciona o sistema de progresso, fases e conquistas da jornada.'
  },
  {
    id: 'maestria-exportacao',
    path: '/admin',
    section: 'exportacao',
    label: 'Exportar Dados',
    phase: 'maestria',
    weight: 8.33,
    contentPath: '/content/journey/maestria-exportacao.md',
    description: 'Exporte seu progresso e histórico de conversas em formato JSON para backup.'
  }
]

/**
 * Valida que o mapa está corretamente configurado
 * Deve ter exatamente 14 steps e peso total de 100%
 */
export function validateJourneyMap(): void {
  const totalWeight = JOURNEY_MAP.reduce((sum, step) => sum + step.weight, 0)

  console.assert(
    JOURNEY_MAP.length === 14,
    `JOURNEY_MAP deve ter 14 steps, mas tem ${JOURNEY_MAP.length}`
  )

  console.assert(
    Math.abs(totalWeight - 100) < 0.001, // Tolerância para ponto flutuante
    `Total weight deve ser 100%, mas é ${totalWeight}%`
  )
}

/**
 * Calcula a porcentagem de progresso baseado nas páginas visitadas
 */
export function calculateProgress(visitedPages: string[]): number {
  if (visitedPages.length === 0) return 0

  const totalWeight = JOURNEY_MAP
    .filter(step => visitedPages.includes(step.id))
    .reduce((sum, step) => sum + step.weight, 0)

  // Arredondar para 2 casas decimais
  return Math.round(totalWeight * 100) / 100
}

/**
 * Retorna a próxima etapa recomendada (primeira não visitada)
 * Retorna null se todas as páginas foram visitadas
 */
export function getNextStep(visitedPages: string[]): JourneyStep | null {
  return JOURNEY_MAP.find(step => !visitedPages.includes(step.id)) || null
}

/**
 * Determina a fase atual baseada na porcentagem de progresso
 */
export function getCurrentPhase(percentage: number): JourneyPhase {
  if (percentage >= 100) return 'completo'
  if (percentage >= 75) return 'maestria'
  if (percentage >= 50) return 'dominio'
  if (percentage >= 25) return 'exploracao'
  return 'descoberta'
}

/**
 * Verifica se a jornada está 100% completa
 */
export function isJourneyComplete(visitedPages: string[]): boolean {
  return visitedPages.length === JOURNEY_MAP.length
}

/**
 * Busca um step por ID
 */
export function findStepById(id: string): JourneyStep | undefined {
  return JOURNEY_MAP.find(step => step.id === id)
}

/**
 * Identifica qual step corresponde ao path/section atual
 * Usado para tracking automático ao navegar
 */
export function identifyJourneyStep(pathname: string, hash: string): string | null {
  // Remover # do hash se presente
  const section = hash.replace('#', '')

  // Tentar match exato com path + section
  if (section) {
    const stepWithSection = JOURNEY_MAP.find(
      step => step.path === pathname && step.section === section
    )
    if (stepWithSection) return stepWithSection.id
  }

  // Tentar match apenas por path (para rotas sem section)
  const stepByPath = JOURNEY_MAP.find(
    step => step.path === pathname && !step.section
  )
  if (stepByPath) return stepByPath.id

  return null
}

/**
 * Retorna todos os steps de uma fase específica
 */
export function getStepsByPhase(phase: JourneyPhase): JourneyStep[] {
  return JOURNEY_MAP.filter(step => step.phase === phase)
}

/**
 * Calcula estatísticas do progresso
 */
export function getProgressStats(visitedPages: string[]): {
  total: number
  visited: number
  remaining: number
  percentage: number
  currentPhase: JourneyPhase
} {
  const percentage = calculateProgress(visitedPages)

  return {
    total: JOURNEY_MAP.length,
    visited: visitedPages.length,
    remaining: JOURNEY_MAP.length - visitedPages.length,
    percentage,
    currentPhase: getCurrentPhase(percentage)
  }
}

// Validar mapa ao carregar módulo (apenas em desenvolvimento)
// @ts-expect-error - Vite provides import.meta.env
if (import.meta.env?.DEV) {
  validateJourneyMap()
}
