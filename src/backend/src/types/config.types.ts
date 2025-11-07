// Configuration Types
// Based on SPEC-configuration.md and SPEC-concepts.md

import { z } from 'zod'

/**
 * Portal Configuration Schema
 * SPEC-C-P-001 to SPEC-C-P-011
 */
export const PortalSchema = z.object({
  portalId: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  settingsKey: z.string().default('default'), // SPEC-TH-SK-001
  activeModules: z.array(z.string()).default([]),
  removable: z.boolean().default(true),
  metadata: z.record(z.string(), z.unknown()).optional(),
})

export type Portal = z.infer<typeof PortalSchema>

/**
 * Module Configuration Schema
 * SPEC-C-M-001 to SPEC-C-M-013
 */
export const ModuleSchema = z.object({
  moduleId: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  type: z.enum(['component', 'functionality']),
  dependencies: z.array(z.string()).default([]),
  version: z.string().default('1.0.0'),
  enabled: z.boolean().default(true),
  metadata: z.record(z.string(), z.unknown()).optional(),
})

export type Module = z.infer<typeof ModuleSchema>

/**
 * Instance Configuration Schema
 * SPEC-C-I-001 to SPEC-C-I-010
 */
export const InstanceSchema = z.object({
  instanceId: z.string().min(1),
  portalId: z.string().min(1),
  moduleId: z.string().min(1),
  config: z.record(z.string(), z.unknown()).default({}),
  active: z.boolean().default(true),
  metadata: z.record(z.string(), z.unknown()).optional(),
})

export type Instance = z.infer<typeof InstanceSchema>

/**
 * Config Type Union
 */
export type ConfigType = 'portals' | 'modules' | 'instances'

/**
 * Config Data Structure
 */
export interface ConfigData {
  portals: Portal[]
  modules: Module[]
  instances: Instance[]
}
