// index.ts
import { lazy } from 'react';
import type { ModuleExports } from '@/types/module';
import { blueprintManifest } from './manifest';
import { blueprintRoutes } from './routes';
import { slotComponents } from './components/slots';
import { compositions } from './compositions';
import { slotConfigForms } from './components/config-forms';
import { moduleRegistry } from '@/core/modules';

// Lazy-load configuration component
const BlueprintConfigForm = lazy(() =>
  import('./components/setup/BlueprintConfigForm').then(m => ({ default: m.BlueprintConfigForm }))
);

export const blueprintModule: ModuleExports = {
  manifest: blueprintManifest,
  routes: blueprintRoutes,
  configComponent: BlueprintConfigForm,
  slotComponents,
  compositions,
  slotConfigForms,
};

moduleRegistry.register(blueprintModule);
