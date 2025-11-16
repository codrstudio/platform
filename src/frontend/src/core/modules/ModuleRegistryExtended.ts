/**
 * Extended Module Registry functionality for SlotConfigForms
 *
 * This file extends the ModuleRegistry to support auto-registration
 * of SlotConfigForms provided by modules.
 */

import type { ModuleExports } from '@/types/module';
import { moduleRegistry } from './ModuleRegistry';
import { slotConfigFormRegistry } from '@/core/composition/SlotConfigFormRegistry';
import type { SlotConfigFormMetadata } from '@/core/composition/SlotConfigFormRegistry';

/**
 * Extended ModuleExports interface with slotConfigForms
 */
export interface ModuleExportsWithConfigForms extends ModuleExports {
  /** Array of slot configuration forms provided by this module */
  slotConfigForms?: SlotConfigFormMetadata[];
}

/**
 * Register a module with SlotConfigForm support
 *
 * This function extends the base module registration to also
 * register any SlotConfigForms provided by the module.
 */
export function registerModuleWithConfigForms(module: ModuleExportsWithConfigForms) {
  const id = module.manifest.id;

  // Register slot config forms if provided
  if (module.slotConfigForms) {
    module.slotConfigForms.forEach((form: SlotConfigFormMetadata) => {
      slotConfigFormRegistry.register(form);
    });

    if (import.meta.env.DEV) {
      console.log(
        `[ModuleRegistry] Registered ${module.slotConfigForms.length} slot config form(s) from module: ${id}`
      );
    }
  }

  // Call the original register function
  moduleRegistry.register(module);
}

/**
 * Unregister a module and its config forms
 */
export function unregisterModuleWithConfigForms(moduleId: string) {
  // Get all config forms to unregister
  const allForms = slotConfigFormRegistry.getAll();

  // Find forms that belong to this module
  // Note: We need to track providedBy in forms or use a separate registry
  // For now, we'll unregister by matching component IDs that start with module ID
  allForms.forEach(form => {
    // Assuming componentIds follow pattern: "{moduleId}-{component}"
    if (form.componentId.startsWith(`${moduleId}-`)) {
      slotConfigFormRegistry.unregister(form.componentId);
    }
  });

  // Call original unregister
  moduleRegistry.unregister(moduleId);
}

/**
 * Helper to check if a module has config forms
 */
export function moduleHasConfigForms(moduleId: string): boolean {
  const module = moduleRegistry.getModule(moduleId) as ModuleExportsWithConfigForms;
  return !!(module?.slotConfigForms && module.slotConfigForms.length > 0);
}

/**
 * Get all config forms from a specific module
 */
export function getModuleConfigForms(moduleId: string): SlotConfigFormMetadata[] {
  const module = moduleRegistry.getModule(moduleId) as ModuleExportsWithConfigForms;
  return module?.slotConfigForms || [];
}