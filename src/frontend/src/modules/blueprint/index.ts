// index.ts
import { lazy } from 'react';
import type { ModuleExports } from '@/types/module';
import { blueprintManifest } from './manifest';
import { blueprintRoutes } from './routes';
import { moduleRegistry } from '@/core/modules';

// Lazy-load configuration component
const BlueprintConfigForm = lazy(() =>
  import('./components/BlueprintConfigForm').then(m => ({ default: m.BlueprintConfigForm }))
);

export const blueprintModule: ModuleExports = {
  manifest: blueprintManifest,
  routes: blueprintRoutes,
  configComponent: BlueprintConfigForm
};

moduleRegistry.register(blueprintModule);
