/**
 * Chatify Module - Main Export
 *
 * Sistema avançado de chat com IA que inclui:
 * - Múltiplos provedores de IA (NIC, OpenAI) com seleção de modelos
 * - Sistema de agentes configurável (built-in, N8N-discovered, custom)
 * - Gamificação/Jornada de descoberta com 14 etapas
 * - Streaming SSE unificado (N8N + OpenAI compatible)
 * - Renderização avançada (Markdown + Mermaid diagrams + Imagens)
 *
 * SPEC Compliance:
 * - SPEC-M-CHATIFY-001: Sistema de múltiplos provedores de IA
 * - SPEC-M-CHATIFY-002: Sistema de agentes configurável
 * - SPEC-M-CHATIFY-003: Gamificação/Jornada de descoberta
 * - SPEC-M-CHATIFY-004: Streaming SSE unificado
 * - SPEC-M-CHATIFY-005: Renderização avançada de conteúdo
 */

import { chatifyManifest } from './manifest'
import { chatifyRoutes } from './routes'
import type { ModuleExports } from '../../types/module'

// Components
export * from './components'

// Pages
export { Home } from './pages/Home'
export { ChatInterface } from './pages/ChatInterface'
export { Admin } from './pages/Admin'
export { Guide } from './pages/Guide'

// Hooks
export { useChatify } from './hooks/useChatify'
export { useAgents } from './hooks/useAgents'
export { useModels } from './hooks/useModels'
export { useJourneyProgress } from './hooks/useJourneyProgress'
export { useTheme } from './hooks/useTheme'
export { useSidebar } from './hooks/useSidebar'
export { useNextStepWidget } from './hooks/useNextStepWidget'
export { useChatWidget } from './hooks/useChatWidget'
export { useMermaid } from './hooks/useMermaid'
export { useAutoScroll } from './hooks/useAutoScroll'

// Types
export type {
  Message,
  Agent,
  AIProvider,
  AIModel,
} from './types'

// Module Exports
export const chatifyModule: ModuleExports = {
  manifest: chatifyManifest,
  routes: chatifyRoutes
}

// Auto-register module on import
import { moduleRegistry } from '../../core/modules'

moduleRegistry.register(chatifyModule)
