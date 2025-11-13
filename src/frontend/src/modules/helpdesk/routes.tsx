/**
 * Helpdesk Module Routes
 *
 * Routes for helpdesk/SAC module.
 * Pattern: /helpdesk/*
 *
 * Fornece rotas para:
 * - Dashboard de tickets
 * - Gerenciamento de categorias
 * - Gerenciamento de clientes
 * - Gerenciamento de contatos
 */

import { lazy } from 'react';
import type { RouteDefinition } from '@/types/portal';

// Lazy-loaded pages
const HelpdeskDashboard = lazy(() => import('./pages/HelpdeskDashboard'));
const CategoriaList = lazy(() => import('./pages/CategoriaList'));
const CategoriaForm = lazy(() => import('./pages/CategoriaForm'));

export const helpdeskRoutes: RouteDefinition[] = [
  {
    path: '/helpdesk',
    component: HelpdeskDashboard
  },
  {
    path: '/helpdesk/categorias',
    component: CategoriaList
  },
  {
    path: '/helpdesk/categorias/nova',
    component: CategoriaForm
  },
  {
    path: '/helpdesk/categorias/:id',
    component: CategoriaForm
  }
];
