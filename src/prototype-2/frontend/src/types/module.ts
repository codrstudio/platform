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

/**
 * Module configuration (backend schema entity)
 * Stored in backend/config/modules.json
 */
export interface Module {
  moduleId: string;
  name: string;
  type: 'functionality' | 'components';
  version: string;
  active: boolean;
  dependencies: string[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Instance configuration (backend schema entity)
 * Represents a module instance activated in a portal
 * Stored in backend/config/instances.json
 */
export interface Instance {
  instanceId: string;
  portalId: string;
  moduleId: string;
  config: Record<string, unknown>;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}
