// Module Type Definitions
// Based on SPEC-modules.md

/**
 * Module route definition
 */
export interface ModuleRoute {
  path: string;
  component: React.ComponentType<any>;
  index?: boolean;
}

/**
 * Module manifest
 * Defines the metadata and capabilities of a module
 */
export interface ModuleManifest {
  moduleId: string;
  version: string;
  name: string;
  description: string;
  type: 'functionality' | 'component';
  category: 'system' | 'business' | 'productivity' | 'communication';
  dependencies: string[];
  routes: Array<{
    path: string;
    index?: boolean;
  }>;
  widgets: Array<{
    widgetId: string;
    name: string;
    description: string;
  }>;
  components: Array<{
    componentId: string;
    name: string;
    description: string;
  }>;
  permissions: string[];
}

/**
 * Module instance configuration
 */
export interface ModuleInstance {
  instanceId: string;
  moduleId: string;
  portalId: string;
  config: Record<string, any>;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Module activation status
 */
export interface ModuleActivation {
  moduleId: string;
  portalId: string;
  active: boolean;
  instances: ModuleInstance[];
}
