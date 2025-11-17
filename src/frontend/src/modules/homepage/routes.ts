import { lazy } from 'react';
import type { ModuleRoute } from '@/types/module';

// Lazy load HomePage for code splitting
const HomePage = lazy(() => import('./pages/HomePage'));

// Lazy load EditorPage for code splitting
const EditorPage = lazy(() => import('./pages/EditorPage').then(m => ({ default: m.EditorPage })));

export const routes: ModuleRoute[] = [
  {
    path: '/', // Default path - can be overridden by instance config
    component: HomePage,
    isPublic: true,
    meta: {
      title: 'Home',
      description: 'Platform homepage with customizable sections',
    },
  },
  {
    path: '/editor',
    component: EditorPage,
    isPublic: false, // Requires authentication (setup portal access)
    meta: {
      title: 'Editor Visual - Homepage',
      description: 'Visual editor for homepage configuration',
    },
  },
];
