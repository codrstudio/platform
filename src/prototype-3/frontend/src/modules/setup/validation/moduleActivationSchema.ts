/**
 * Module Activation Validation Schema
 *
 * Zod schemas for validating module activation/deactivation operations.
 *
 * References:
 * - SPEC-module-setup.md (SPEC-MS-VA-007:009)
 * - SPEC-modules.md (SPEC-MO-DE-005:011)
 */

import { z } from 'zod';
import moduleRegistry from '../../../core/modules/ModuleRegistry.js';
import dependencyManager from '../../../core/modules/DependencyManager.js';

/**
 * Module activation request schema
 *
 * SPEC-MS-VA-007: Dependencies must be active before activating module
 * SPEC-MS-VA-009: No circular dependencies
 */
export const moduleActivationSchema = z.object({
  /** Portal ID where module will be activated */
  portalId: z.string().min(1, 'Portal ID is required'),

  /** Module ID to activate */
  moduleId: z.string().min(1, 'Module ID is required'),

  /** Current active modules in portal (for dependency validation) */
  currentActiveModules: z.array(z.string()).default([]),
}).superRefine((data, ctx) => {
  const { moduleId, currentActiveModules } = data;

  // Validate module exists in registry
  if (!moduleRegistry.hasModule(moduleId)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Module "${moduleId}" not found in registry`,
      path: ['moduleId'],
    });
    return;
  }

  // Get module manifest
  const module = moduleRegistry.getModule(moduleId);
  if (!module) return;

  const dependencies = module.manifest.dependencies || [];

  // SPEC-MS-VA-007: Dependencies must be active before activating module
  // Check if all dependencies are in currentActiveModules
  const missingDependencies = dependencies.filter(
    (depId) => !currentActiveModules.includes(depId)
  );

  if (missingDependencies.length > 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Cannot activate module: missing dependencies [${missingDependencies.join(', ')}]`,
      path: ['moduleId'],
    });
  }

  // SPEC-MS-VA-009: Check for circular dependencies
  const resolution = dependencyManager.resolveDependencies(moduleId);
  if (resolution.cycles.length > 0) {
    const cycleDesc = resolution.cycles.map((cycle) => cycle.join(' -> ')).join('; ');
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Circular dependency detected: ${cycleDesc}`,
      path: ['moduleId'],
    });
  }
});

/**
 * Module deactivation request schema
 *
 * SPEC-MS-VA-008: Modules dependents must be deactivated before deactivating module
 */
export const moduleDeactivationSchema = z.object({
  /** Portal ID where module will be deactivated */
  portalId: z.string().min(1, 'Portal ID is required'),

  /** Module ID to deactivate */
  moduleId: z.string().min(1, 'Module ID is required'),

  /** Current active modules in portal (for dependent validation) */
  currentActiveModules: z.array(z.string()).default([]),

  /** Force deactivation even if dependents exist */
  force: z.boolean().default(false),
}).superRefine((data, ctx) => {
  const { moduleId, currentActiveModules, force } = data;

  // Validate module exists in registry
  if (!moduleRegistry.hasModule(moduleId)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Module "${moduleId}" not found in registry`,
      path: ['moduleId'],
    });
    return;
  }

  // SPEC-MS-VA-008: Modules dependents must be deactivated first (unless forced)
  if (!force) {
    const dependents = dependencyManager.getDependents(moduleId);
    const activeDependents = dependents.filter((depId) =>
      currentActiveModules.includes(depId)
    );

    if (activeDependents.length > 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Cannot deactivate module: ${activeDependents.length} active dependent(s) [${activeDependents.join(', ')}]`,
        path: ['moduleId'],
      });
    }
  }
});

/**
 * Module activation types inferred from schemas
 */
export type ModuleActivationData = z.infer<typeof moduleActivationSchema>;
export type ModuleDeactivationData = z.infer<typeof moduleDeactivationSchema>;
