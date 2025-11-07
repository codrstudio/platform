/**
 * Command Palette Module Routes
 *
 * SPEC Compliance:
 * - SPEC-CP-M-006 to M-008: Interface expandida
 */

import { lazy } from 'react';
import type { ModuleRoute } from '@/types/module';

// Lazy-loaded pages for code splitting
const CommandPalettePage = lazy(() =>
  import('./pages/CommandPalettePage').then(m => ({ default: m.CommandPalettePage }))
);

/**
 * Command Palette module routes
 *
 * Configuration via instance config:
 * - expandedRoute: Path for expanded page (default: '/search')
 */
export const routes: ModuleRoute[] = [
  {
    path: '/search',
    component: CommandPalettePage,
    isPublic: false,
    meta: {
      title: 'Busca',
      description: 'Busca avançada, comandos e agentes'
    }
  }
];

export default routes;
