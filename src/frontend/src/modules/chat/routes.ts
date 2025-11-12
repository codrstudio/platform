/**
 * Chat Module Routes
 *
 * Routes for chat instances.
 * Pattern: /chats/:instanceId
 *
 * The instanceId is used as the conversationId for the chat.
 * Each instance represents a separate chat conversation.
 */

import { lazy } from 'react';
import type { RouteDefinition } from '@/types/portal';

const ChatInterface = lazy(() => import('./pages/ChatInterface').then(m => ({ default: m.ChatInterface })));

export const chatRoutes: RouteDefinition[] = [
  {
    path: '/chats/:instanceId',
    component: ChatInterface
  }
];
