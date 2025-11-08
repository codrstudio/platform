/**
 * Chat Module Routes
 */

import { lazy } from 'react';
import type { RouteDefinition } from '@/types/portal';

const ChatInterface = lazy(() => import('./pages/ChatInterface').then(m => ({ default: m.ChatInterface })));

export const chatRoutes: RouteDefinition[] = [
  {
    path: '/chat',
    component: ChatInterface
  },
  {
    path: '/chat/:conversationId',
    component: ChatInterface
  }
];
