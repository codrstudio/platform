// Module type definitions
// Based on SPEC-module-loading.md Module concept

import type { Portal } from './portal';
import type { RouteDefinition } from './routing';

export interface ModuleManifest {
  id: string;
  name: string;
  description?: string;
  version: string;
  type: 'functionality' | 'components';
  dependencies: string[];
}

export interface ModuleExports {
  routes?: RouteDefinition[];
  components?: Record<string, React.ComponentType>;
  hooks?: Record<string, Function>;
  onActivate?: (portal: Portal) => void;
  onDeactivate?: (portal: Portal) => void;
}
