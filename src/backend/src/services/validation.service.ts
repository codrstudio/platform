// Validation Service
// Contextual configuration validators using Zod
// Addresses: eliminacao de instancias orfas, modulos desativados, circular dependencies

import { z } from 'zod'
import type { Portal, Module, Instance } from '../types/config.types.js'
import { PortalSchema, ModuleSchema, InstanceSchema } from '../types/config.types.js'

/**
 * Validation Context
 * Contains all configuration data needed for cross-entity validation
 */
export interface ValidationContext {
  portals: Portal[]
  modules: Module[]
  instances: Instance[]
}

/**
 * Validation Result
 */
export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
}

export interface ValidationError {
  type: 'portal' | 'module' | 'instance'
  id: string
  field: string
  message: string
  severity: 'critical' | 'error'
}

export interface ValidationWarning {
  type: 'portal' | 'module' | 'instance'
  id: string
  field: string
  message: string
}

/**
 * Helper: Detect circular dependencies using graph algorithm
 * Uses depth-first search with cycle detection
 *
 * @param moduleId - Module to check
 * @param modules - All modules in the system
 * @param visited - Modules already processed (avoid reprocessing)
 * @param chain - Current dependency chain (cycle detection)
 * @returns Array of module IDs forming the cycle, or null if no cycle
 */
function detectCircularDependencies(
  moduleId: string,
  modules: Module[],
  visited = new Set<string>(),
  chain = new Set<string>()
): string[] | null {
  if (chain.has(moduleId)) {
    // Circular dependency detected
    return Array.from(chain).concat(moduleId)
  }

  if (visited.has(moduleId)) {
    // Already processed, no cycle
    return null
  }

  visited.add(moduleId)
  chain.add(moduleId)

  const module = modules.find(m => m.moduleId === moduleId)
  if (!module || !module.dependencies) {
    chain.delete(moduleId)
    return null
  }

  // Check each dependency recursively
  for (const depId of module.dependencies) {
    const cycle = detectCircularDependencies(depId, modules, visited, chain)
    if (cycle) {
      return cycle
    }
  }

  chain.delete(moduleId)
  return null
}

/**
 * Contextual Validator: Portal
 * Validates portal configuration with module context
 */
export const createPortalValidator = (context: { modules: Module[] }) => {
  return PortalSchema.superRefine((portal, ctx) => {
    // VALIDATION 1: Modules in activeModules must exist and be enabled
    // Addresses: "tratar modulo em portal como desativado se ele estiver desativado em modules"
    portal.activeModules.forEach((moduleId, index) => {
      const module = context.modules.find(m => m.moduleId === moduleId)

      if (!module) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['activeModules', index],
          message: `Module "${moduleId}" does not exist`,
          params: { severity: 'critical' }
        })
      } else if (module.enabled === false) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['activeModules', index],
          message: `Module "${moduleId}" is disabled globally`,
          params: { severity: 'error' }
        })
      }
    })

    // VALIDATION 2: Modules in availableModules must exist
    portal.availableModules.forEach((moduleId, index) => {
      const module = context.modules.find(m => m.moduleId === moduleId)

      if (!module) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['availableModules', index],
          message: `Module "${moduleId}" does not exist`,
          params: { severity: 'critical' }
        })
      }
    })

    // VALIDATION 3: Homepage subroute must have valid format
    if (portal.homepage?.type === 'subroute' && portal.homepage.value) {
      const subroute = portal.homepage.value

      if (!subroute.startsWith('/')) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['homepage', 'value'],
          message: `Homepage subroute must start with '/'`,
          params: { severity: 'error' }
        })
      }
    }
  })
}

/**
 * Contextual Validator: Module
 * Validates module configuration including dependencies and circular refs
 */
export const createModuleValidator = (context: { modules: Module[] }) => {
  return ModuleSchema.superRefine((module, ctx) => {
    // VALIDATION 1: Dependencies must exist and be enabled
    module.dependencies.forEach((depId, index) => {
      const dep = context.modules.find(m => m.moduleId === depId)

      if (!dep) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['dependencies', index],
          message: `Dependency "${depId}" does not exist`,
          params: { severity: 'critical' }
        })
      } else if (dep.enabled === false) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['dependencies', index],
          message: `Dependency "${depId}" is disabled`,
          params: { severity: 'error' }
        })
      }
    })

    // VALIDATION 2: Detect circular dependencies
    const cycle = detectCircularDependencies(module.moduleId, context.modules)
    if (cycle) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['dependencies'],
        message: `Circular dependency detected: ${cycle.join(' → ')}`,
        params: { severity: 'critical' }
      })
    }
  })
}

/**
 * Contextual Validator: Instance
 * Validates instance configuration with portal and module context
 * CRITICAL: Detects orphan instances (SPEC-C-I-001)
 */
export const createInstanceValidator = (context: { portals: Portal[], modules: Module[], instances: Instance[] }) => {
  return InstanceSchema.superRefine((instance, ctx) => {
    // VALIDATION 1: Portal must exist
    const portal = context.portals.find(p => p.portalId === instance.portalId)
    if (!portal) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['portalId'],
        message: `Portal "${instance.portalId}" does not exist`,
        params: { severity: 'critical' }
      })
      return // Cannot continue validations without portal
    }

    // VALIDATION 2: Module must exist
    const module = context.modules.find(m => m.moduleId === instance.moduleId)
    if (!module) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['moduleId'],
        message: `Module "${instance.moduleId}" does not exist`,
        params: { severity: 'critical' }
      })
      return // Cannot continue validations without module
    }

    // VALIDATION 3: Module must be in portal's availableModules (SPEC-C-I-001)
    // "Instances ONLY can be created from active modules in portal"
    // Addresses: "eliminacao de instancias orfas"
    if (!portal.availableModules.includes(instance.moduleId)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['moduleId'],
        message: `Module "${instance.moduleId}" not in portal's availableModules (orphan instance - SPEC-C-I-001)`,
        params: { severity: 'critical' }
      })
    }

    // VALIDATION 4: If module is singleInstance, check for duplicates
    if (module.singleInstance) {
      const duplicates = context.instances.filter(
        i => i.portalId === instance.portalId &&
             i.moduleId === instance.moduleId &&
             i.instanceId !== instance.instanceId
      )

      if (duplicates.length > 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['instanceId'],
          message: `Module "${instance.moduleId}" is singleInstance but has multiple instances in portal "${instance.portalId}"`,
          params: { severity: 'critical' }
        })
      }
    }

    // VALIDATION 5: Module must be enabled
    if (module.enabled === false) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['moduleId'],
        message: `Module "${instance.moduleId}" is disabled globally`,
        params: { severity: 'error' }
      })
    }
  })
}

/**
 * Auto-Fix Result
 */
export interface AutoFixResult {
  fixed: ValidationContext
  changes: FixChange[]
}

export interface FixChange {
  type: 'portal' | 'module' | 'instance'
  id: string
  action: 'removed' | 'modified' | 'added'
  description: string
}

/**
 * Auto-Fix: Portals
 * Removes invalid modules from activeModules and availableModules
 */
export function autoFixPortals(portals: Portal[], modules: Module[]): { fixed: Portal[], changes: FixChange[] } {
  const changes: FixChange[] = []

  const fixed = portals.map(portal => {
    const fixedPortal = { ...portal }

    // Fix 1: Remove non-existent modules from availableModules
    const validAvailableModules = portal.availableModules.filter(moduleId => {
      const module = modules.find(m => m.moduleId === moduleId)
      if (!module) {
        changes.push({
          type: 'portal',
          id: portal.portalId,
          action: 'modified',
          description: `Removed non-existent module "${moduleId}" from availableModules`
        })
        return false
      }
      return true
    })
    fixedPortal.availableModules = validAvailableModules

    // Fix 2: Remove disabled modules from activeModules
    const validActiveModules = portal.activeModules.filter(moduleId => {
      const module = modules.find(m => m.moduleId === moduleId)

      if (!module) {
        changes.push({
          type: 'portal',
          id: portal.portalId,
          action: 'modified',
          description: `Removed non-existent module "${moduleId}" from activeModules`
        })
        return false
      }

      if (module.enabled === false) {
        changes.push({
          type: 'portal',
          id: portal.portalId,
          action: 'modified',
          description: `Removed disabled module "${moduleId}" from activeModules`
        })
        return false
      }

      return true
    })
    fixedPortal.activeModules = validActiveModules

    // Fix 3: Ensure activeModules ⊆ availableModules
    const finalActiveModules = validActiveModules.filter(moduleId => {
      if (!validAvailableModules.includes(moduleId)) {
        changes.push({
          type: 'portal',
          id: portal.portalId,
          action: 'modified',
          description: `Removed module "${moduleId}" from activeModules (not in availableModules)`
        })
        return false
      }
      return true
    })
    fixedPortal.activeModules = finalActiveModules

    // Fix 4: Fix homepage subroute format
    if (fixedPortal.homepage?.type === 'subroute' && fixedPortal.homepage.value) {
      if (!fixedPortal.homepage.value.startsWith('/')) {
        const oldValue = fixedPortal.homepage.value
        fixedPortal.homepage.value = `/${fixedPortal.homepage.value}`
        changes.push({
          type: 'portal',
          id: portal.portalId,
          action: 'modified',
          description: `Fixed homepage subroute format: "${oldValue}" → "${fixedPortal.homepage.value}"`
        })
      }
    }

    return fixedPortal
  })

  return { fixed, changes }
}

/**
 * Auto-Fix: Instances
 * Removes orphan instances and duplicates for singleInstance modules
 */
export function autoFixInstances(instances: Instance[], portals: Portal[], modules: Module[]): { fixed: Instance[], changes: FixChange[] } {
  const changes: FixChange[] = []

  // Fix 1: Remove orphan instances (SPEC-C-I-001)
  let fixed = instances.filter(instance => {
    // Check if portal exists
    const portal = portals.find(p => p.portalId === instance.portalId)
    if (!portal) {
      changes.push({
        type: 'instance',
        id: `${instance.portalId}/${instance.moduleId}/${instance.instanceId}`,
        action: 'removed',
        description: `Removed orphan instance (portal "${instance.portalId}" does not exist)`
      })
      return false
    }

    // Check if module exists
    const module = modules.find(m => m.moduleId === instance.moduleId)
    if (!module) {
      changes.push({
        type: 'instance',
        id: `${instance.portalId}/${instance.moduleId}/${instance.instanceId}`,
        action: 'removed',
        description: `Removed orphan instance (module "${instance.moduleId}" does not exist)`
      })
      return false
    }

    // Check if module is in portal's availableModules (SPEC-C-I-001)
    if (!portal.availableModules.includes(instance.moduleId)) {
      changes.push({
        type: 'instance',
        id: `${instance.portalId}/${instance.moduleId}/${instance.instanceId}`,
        action: 'removed',
        description: `Removed orphan instance (module "${instance.moduleId}" not in portal's availableModules)`
      })
      return false
    }

    // Check if module is disabled
    if (module.enabled === false) {
      changes.push({
        type: 'instance',
        id: `${instance.portalId}/${instance.moduleId}/${instance.instanceId}`,
        action: 'removed',
        description: `Removed instance of disabled module "${instance.moduleId}"`
      })
      return false
    }

    return true
  })

  // Fix 2: Remove duplicate instances for singleInstance modules
  const seen = new Map<string, Instance>()
  fixed = fixed.filter(instance => {
    const module = modules.find(m => m.moduleId === instance.moduleId)

    if (module?.singleInstance) {
      const key = `${instance.portalId}:${instance.moduleId}`

      if (seen.has(key)) {
        changes.push({
          type: 'instance',
          id: `${instance.portalId}/${instance.moduleId}/${instance.instanceId}`,
          action: 'removed',
          description: `Removed duplicate instance for singleInstance module "${instance.moduleId}"`
        })
        return false
      }

      seen.set(key, instance)
    }

    return true
  })

  return { fixed, changes }
}

/**
 * Validation Service
 * Provides validation methods for configuration entities
 */
export class ValidationService {
  /**
   * Validate a portal with context
   */
  validatePortal(portal: Portal, context: { modules: Module[] }): ValidationResult {
    const validator = createPortalValidator(context)
    const result = validator.safeParse(portal)

    if (result.success) {
      return { valid: true, errors: [], warnings: [] }
    }

    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []

    result.error.issues.forEach(issue => {
      const severity = (issue.params as any)?.severity || 'error'
      const error: ValidationError = {
        type: 'portal',
        id: portal.portalId,
        field: issue.path.join('.'),
        message: issue.message,
        severity: severity as 'critical' | 'error'
      }
      errors.push(error)
    })

    return { valid: false, errors, warnings }
  }

  /**
   * Validate a module with context
   */
  validateModule(module: Module, context: { modules: Module[] }): ValidationResult {
    const validator = createModuleValidator(context)
    const result = validator.safeParse(module)

    if (result.success) {
      return { valid: true, errors: [], warnings: [] }
    }

    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []

    result.error.issues.forEach(issue => {
      const severity = (issue.params as any)?.severity || 'error'
      const error: ValidationError = {
        type: 'module',
        id: module.moduleId,
        field: issue.path.join('.'),
        message: issue.message,
        severity: severity as 'critical' | 'error'
      }
      errors.push(error)
    })

    return { valid: false, errors, warnings }
  }

  /**
   * Validate an instance with context
   */
  validateInstance(instance: Instance, context: ValidationContext): ValidationResult {
    const validator = createInstanceValidator(context)
    const result = validator.safeParse(instance)

    if (result.success) {
      return { valid: true, errors: [], warnings: [] }
    }

    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []

    result.error.issues.forEach(issue => {
      const severity = (issue.params as any)?.severity || 'error'
      const error: ValidationError = {
        type: 'instance',
        id: `${instance.portalId}/${instance.moduleId}/${instance.instanceId}`,
        field: issue.path.join('.'),
        message: issue.message,
        severity: severity as 'critical' | 'error'
      }
      errors.push(error)
    })

    return { valid: false, errors, warnings }
  }

  /**
   * Validate all configuration
   * Returns aggregated results for all entities
   */
  validateAll(context: ValidationContext): ValidationResult {
    const allErrors: ValidationError[] = []
    const allWarnings: ValidationWarning[] = []

    // Validate all portals
    context.portals.forEach(portal => {
      const result = this.validatePortal(portal, { modules: context.modules })
      allErrors.push(...result.errors)
      allWarnings.push(...result.warnings)
    })

    // Validate all modules
    context.modules.forEach(module => {
      const result = this.validateModule(module, { modules: context.modules })
      allErrors.push(...result.errors)
      allWarnings.push(...result.warnings)
    })

    // Validate all instances
    context.instances.forEach(instance => {
      const result = this.validateInstance(instance, context)
      allErrors.push(...result.errors)
      allWarnings.push(...result.warnings)
    })

    return {
      valid: allErrors.length === 0,
      errors: allErrors,
      warnings: allWarnings
    }
  }

  /**
   * Auto-fix all configuration
   * Applies automatic fixes and returns fixed configuration + change report
   */
  autoFixAll(context: ValidationContext): AutoFixResult {
    const allChanges: FixChange[] = []

    // Step 1: Fix portals first (cleans up activeModules/availableModules)
    const { fixed: fixedPortals, changes: portalChanges } = autoFixPortals(
      context.portals,
      context.modules
    )
    allChanges.push(...portalChanges)

    // Step 2: Fix instances (removes orphans based on fixed portals)
    const { fixed: fixedInstances, changes: instanceChanges } = autoFixInstances(
      context.instances,
      fixedPortals, // Use fixed portals
      context.modules
    )
    allChanges.push(...instanceChanges)

    return {
      fixed: {
        portals: fixedPortals,
        modules: context.modules, // Modules don't need auto-fix (circular deps require manual intervention)
        instances: fixedInstances
      },
      changes: allChanges
    }
  }

  /**
   * Validate and auto-fix configuration
   * Returns fixed configuration and validation result
   * Only reports errors that cannot be auto-fixed
   */
  validateAndFix(context: ValidationContext): { fixed: ValidationContext, result: ValidationResult, changes: FixChange[] } {
    // Apply auto-fixes
    const autoFixResult = this.autoFixAll(context)

    // Validate the fixed configuration
    const validationResult = this.validateAll(autoFixResult.fixed)

    return {
      fixed: autoFixResult.fixed,
      result: validationResult,
      changes: autoFixResult.changes
    }
  }
}

// Singleton instance
export const validationService = new ValidationService()
