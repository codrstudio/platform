// routes.tsx
import { lazy } from 'react';
import type { ModuleRoute } from '@/types/module';

const BlueprintPage = lazy(() =>
  import('./pages/BlueprintPage').then(m => ({ default: m.BlueprintPage }))
);

export const blueprintRoutes: ModuleRoute[] = [
  {
    path: '/ola',
    component: BlueprintPage,
    meta: {
      title: 'Blueprint - Exemplo de Módulo',
      description: 'Página de demonstração do módulo Blueprint'
    }
  }
];
