/**
 * Module Types
 * Defines Module structure and exports
 * SPEC-C-M-*, SPEC-MO-* compliance
 */

import type { RouteObject } from 'react-router-dom';

/**
 * Module Type
 */
export type ModuleType = 'component' | 'functionality';

/**
 * Route Export
 * Route definition exported by a module
 */
export interface RouteExport {
  path: string; // Relative path within module
  element: React.ComponentType<any>; // Component to render
  requiresAuth?: boolean; // Requires authentication?
  permission?: string; // Required permission
  metadata?: Record<string, any>; // Additional route metadata
}

/**
 * Module Manifest
 * Describes a module and its exports
 */
export interface ModuleManifest {
  moduleId: string; // Unique ID (e.g., "setup", "chat")
  name: string; // Display name
  type: ModuleType; // Module type
  version: string; // Semantic version
  dependencies: string[]; // Required module IDs
  exports: {
    routes?: RouteExport[]; // Exported routes
    components?: Record<string, React.ComponentType<any>>; // Exported components
    widgets?: Record<string, React.ComponentType<any>>; // Exported widgets
    hooks?: Record<string, (...args: any[]) => any>; // Exported hooks
  };
  metadata?: Record<string, any>; // Additional module metadata
}

/**
 * Module Context
 * Context available to module components
 */
export interface ModuleContext {
  moduleId: string;
  portalId: string;
  instanceId?: string; // If module is instantiated
  config?: Record<string, any>; // Module configuration
}

/**
 * Module Instance
 * Specific configuration of an activated module
 */
export interface ModuleInstance {
  instanceId: string; // Unique within portal
  moduleId: string; // Reference to module
  portalId: string; // Parent portal
  config: Record<string, any>; // Module-specific configuration
  active: boolean; // Is instance active?
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}

/**
 * Module Loader Function
 * Dynamic import function for a module
 */
export type ModuleLoader = () => Promise<{ default: ModuleManifest }>;

/**
 * Loaded Module
 * Module with resolved routes
 */
export interface LoadedModule {
  manifest: ModuleManifest;
  routes: RouteObject[]; // React Router format
}
