// Module Type Definitions
// Based on SPEC-modules.md

import type React from 'react';

/**
 * Module route definition
 */
export interface ModuleRoute {
  path: string;
  component: React.ComponentType<any>;
  index?: boolean;
  isPublic?: boolean;
  meta?: {
    title?: string;
    description?: string;
  };
}

/**
 * Module manifest
 * Defines the metadata and capabilities of a module
 * SPEC-MO-MA-012: Campo singleInstance para módulos que permitem apenas uma instância por portal
 */
export interface ModuleManifest {
  id: string; // Module ID (alias for moduleId)
  moduleId?: string; // Optional for backwards compatibility
  version: string;
  name: string;
  description: string;
  type: 'functionality' | 'component';
  category: 'system' | 'business' | 'productivity' | 'communication' | 'core';
  author?: string;
  dependencies: string[];
  singleInstance?: boolean; // SPEC-MO-IN-014: Se true, módulo permite apenas UMA instância por portal
  capabilities?: {
    providesAuth?: boolean;
    providesRoutes?: boolean;
    providesComponents?: boolean;
    providesWidgets?: boolean;
  };
  routes?: Array<{
    path: string;
    index?: boolean;
  }>;
  widgets?: Array<{
    widgetId: string;
    name: string;
    description: string;
  }>;
  components?: Array<{
    componentId: string;
    name: string;
    description: string;
  }>;
  permissions: string[];
  config?: {
    schema?: any;
    defaults?: Record<string, any>;
  };
}

/**
 * Module exports
 */
export interface ModuleExports {
  manifest: ModuleManifest;
  routes?: ModuleRoute[];
  components?: Record<string, React.ComponentType<any>>;
  widgets?: Record<string, React.ComponentType<any>>;
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
