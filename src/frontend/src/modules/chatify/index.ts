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
 * - SPEC-MP-IDX-001: Entry point com auto-registro
 * - SPEC-MP-IDX-002: Auto-registro no moduleRegistry
 * - SPEC-MP-IDX-003: Apenas exportação e registro, sem lógica de negócio
 */

import type { ModuleExports } from '@/types/module'
import { chatifyManifest } from './manifest'
import { chatifyRoutes } from './routes'
import { moduleRegistry } from '@/core/modules'

/**
 * Module exports - Segue SPEC-MP-IDX-001
 */
export const chatifyModule: ModuleExports = {
  manifest: chatifyManifest,
  routes: chatifyRoutes,
}

/**
 * Auto-registro - SPEC-MP-IDX-002 (OBRIGATÓRIO)
 */
moduleRegistry.register(chatifyModule)
