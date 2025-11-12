// Configuration Types
// Based on SPEC-configuration.md and SPEC-concepts.md

import { z } from 'zod'

/**
 * Realm Configuration Schema
 * SPEC-RM-ST-001 to SPEC-RM-ST-015
 * Sistema de Ambientes para agrupamento de portais
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
 * Atualizado para sistema de Ambientes
 */
export const PortalSchema = z.object({
  portalId: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  realmId: z.string().default('default'), // SPEC-C-P-015: Portal pertence a um Ambiente
  availableModules: z.array(z.string()).default([]), // Módulos adicionados ao portal (podem estar inativos)
  activeModules: z.array(z.string()).default([]), // Módulos ativos no portal (subset de availableModules)
  removable: z.boolean().default(true),
  metadata: z.record(z.string(), z.unknown()).optional(),
}).refine(
  (data) => data.activeModules.every(m => data.availableModules.includes(m)),
  { message: 'activeModules must be a subset of availableModules' }
)

export type Portal = z.infer<typeof PortalSchema>

/**
 * Module Configuration Schema
 * SPEC-C-M-001 to SPEC-C-M-013
 * SPEC-MO-MA-012: Campo instanceMode (single ou multiple)
 */
export const ModuleSchema = z.object({
  moduleId: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  type: z.enum(['component', 'functionality']),
  dependencies: z.array(z.string()).default([]),
  version: z.string().default('1.0.0'),
  enabled: z.boolean().default(true),
  singleInstance: z.boolean().optional(), // SPEC-MO-IN-014: Módulo single-instance permite apenas UMA instância por portal
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
 * Login Branding Configuration Schema
 * Customização da página de login por realm
 */
export const LoginBrandingSchema = z.object({
  realmId: z.string().min(1),
  useBrandColorFromTheme: z.boolean().default(true),
  brandColorOverride: z.object({
    hue: z.number().min(0).max(360),
    saturation: z.number().min(0).max(100),
    lightness: z.number().min(0).max(100),
  }).nullable(),
  logoUrl: z.string().nullable(),
  logoHeight: z.number().min(40).max(120).default(64),
  texts: z.object({
    title: z.string().max(100),
    subtitle: z.string().max(100),
    footer: z.string().max(100),
  }),
})

export type LoginBranding = z.infer<typeof LoginBrandingSchema>

/**
 * Config Type Union
 */
export type ConfigType = 'realms' | 'portals' | 'modules' | 'instances' | 'login-branding'

/**
 * Config Data Structure
 */
export interface ConfigData {
  realms: Realm[]
  portals: Portal[]
  modules: Module[]
  instances: Instance[]
  loginBranding: LoginBranding[]
}
