/**
 * Setup Module Manifest
 *
 * This manifest defines the metadata for the Setup module,
 * the visual configurator for portals, modules, and instances.
 *
 * References:
 * - SPEC-module-setup.md (SPEC-MS-MA-001)
 * - SPEC-modules.md (SPEC-MO-MA-*)
 */

import type { ModuleManifest } from '../../types/module';

/**
 * Setup module manifest
 * SPEC-MS-MA-001: Complete manifest definition
 */
export const manifest: ModuleManifest = {
  /** SPEC-MO-MA-001: Unique module identifier */
  id: 'setup',

  /** SPEC-MO-MA-002: Human-readable name */
  name: 'Setup',

  /** SPEC-MO-MA-003: Semantic version */
  version: '1.0.0',

  /** SPEC-MO-MA-004: Module type classification */
  type: 'functionality',

  /** SPEC-MO-MA-007: Module description */
  description: 'Configurador visual de portais, módulos e instâncias',

  /** SPEC-MO-MA-008: Module author */
  author: 'Platform Team',

  /** SPEC-MO-MA-009: Dependencies (none for setup module) */
  dependencies: [],

  /** SPEC-MO-MA-010: Lucide icon name */
  icon: 'Settings',

  /** SPEC-MO-MA-011: Category for organization */
  category: 'system',
};
