import { lazy } from 'react';
import type { ModuleRoute } from '@/types/module';

// Lazy load HomePage for code splitting
const HomePage = lazy(() => import('./components/HomePage').then(m => ({ default: m.HomePage })));

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
];
