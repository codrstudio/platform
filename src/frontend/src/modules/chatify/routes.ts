import { lazy } from 'react'
import type { ModuleRoute } from '../../types/module'

/**
 * Rotas do módulo Chatify
 *
 * Todas as páginas são lazy-loaded para otimizar performance.
 * Os componentes são carregados apenas quando a rota é acessada.
 */

const Home = lazy(() => import('./pages/Home').then(m => ({ default: m.Home })))
const ChatInterface = lazy(() => import('./pages/ChatInterface').then(m => ({ default: m.ChatInterface })))
const Admin = lazy(() => import('./pages/Admin').then(m => ({ default: m.Admin })))
const Guide = lazy(() => import('./pages/Guide').then(m => ({ default: m.Guide })))

export const chatifyRoutes: ModuleRoute[] = [
  {
    path: '/',
    component: Home,
    index: true,
    meta: {
      title: 'Chatify - Home',
      description: 'Landing page do módulo Chatify',
    }
  },
  {
    path: '/chat',
    component: ChatInterface,
    meta: {
      title: 'Chatify - Chat',
      description: 'Interface de conversação com IA',
    }
  },
  {
    path: '/admin',
    component: Admin,
    meta: {
      title: 'Chatify - Configurações',
      description: 'Gerenciamento de agentes, provedores e configurações',
    }
  },
  {
    path: '/guide/:stepId',
    component: Guide,
    meta: {
      title: 'Chatify - Guia',
      description: 'Jornada de aprendizado do Chatify',
    }
  },
]
