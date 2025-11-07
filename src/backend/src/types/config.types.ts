// Configuration Types
// Based on SPEC-configuration.md and SPEC-concepts.md

import { z } from 'zod'

/**
 * Realm Configuration Schema
 * SPEC-RM-ST-001 to SPEC-RM-ST-015
 * Sistema de Reinos para agrupamento de portais
 */
export const RealmSchema = z.object({
  realmId: z.string().min(1).regex(/^[a-z0-9-]+$/, 'realmId deve ser alfanumérico com hífens (kebab-case)'),
  name: z.string().min(1),
  description: z.string().optional(),
  removable: z.boolean().default(true), // SPEC-RM-ST-009: default realm tem false
  config: z.object({
    theme: z.object({
      mode: z.enum(['light', 'dark', 'system']).optional(),
      brandColor: z.string().optional(), // HSL format
      radius: z.string().optional(),
    }).optional(),
  }).default({}),
  metadata: z.record(z.string(), z.unknown()).optional(),
})

export type Realm = z.infer<typeof RealmSchema>

/**
 * Portal Configuration Schema
 * SPEC-C-P-001 to SPEC-C-P-018
 * Atualizado para sistema de Reinos
 */
export const PortalSchema = z.object({
  portalId: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  realmId: z.string().default('default'), // SPEC-C-P-015: Portal pertence a um Reino
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
export type ConfigType = 'realms' | 'portals' | 'modules' | 'instances'

/**
 * Config Data Structure
 */
export interface ConfigData {
  realms: Realm[]
  portals: Portal[]
  modules: Module[]
  instances: Instance[]
}
