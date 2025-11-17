import { lazy } from 'react'
import type { ModuleRoute } from '@/types/module'

/**
 * Rotas do módulo Chatify
 *
 * SPEC Compliance:
 * - SPEC-MP-ROU-001: Arquivo routes.tsx obrigatório quando providesRoutes: true
 * - SPEC-MP-ROU-002: Todas as páginas DEVEM usar lazy-loading
 * - SPEC-MP-ROU-003: Caminhos DEVEM ser relativos ao portal (sem prefixo de portal)
 */

/**
 * Lazy-loading de páginas - SPEC-MP-ROU-002
 */
const Home = lazy(() => import('./pages/Home').then(m => ({ default: m.Home })))
const ChatInterface = lazy(() => import('./pages/ChatInterface').then(m => ({ default: m.ChatInterface })))
const Admin = lazy(() => import('./pages/Admin').then(m => ({ default: m.Admin })))
const Guide = lazy(() => import('./pages/Guide').then(m => ({ default: m.Guide })))

/**
 * Definição de rotas - SPEC-MP-ROU-003
 * Caminhos relativos ao portal (sem prefixo)
 */
export const chatifyRoutes: ModuleRoute[] = [
  {
    path: '/',
    component: Home,
    meta: {
      title: 'Chatify - Home',
      description: 'Landing page do módulo Chatify',
    },
  },
  {
    path: '/chat',
    component: ChatInterface,
    meta: {
      title: 'Chatify - Chat',
      description: 'Interface de conversação com IA',
    },
  },
  {
    path: '/admin',
    component: Admin,
    meta: {
      title: 'Chatify - Configurações',
      description: 'Gerenciamento de agentes, provedores e configurações',
    },
  },
  {
    path: '/guide/:stepId',
    component: Guide,
    meta: {
      title: 'Chatify - Guia',
      description: 'Jornada de aprendizado do Chatify',
    },
  },
]
