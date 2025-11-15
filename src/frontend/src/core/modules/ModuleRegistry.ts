/**
 * Module Registry - Central module management
 *
 * SPEC Compliance:
 * - SPEC-MO-RE-*: Module registration and discovery
 */

import type { ModuleExports } from '@/types/module';
import { slotComponentRegistry } from '@/core/composition/SlotComponentRegistry';
import { compositionRegistry } from '@/core/composition/CompositionRegistry';
import type { SlotComponent, Composition } from '@/core/composition/types';

class ModuleRegistry {
  private modules = new Map<string, ModuleExports>();

  register(module: ModuleExports) {
    const id = module.manifest.id;

    if (this.modules.has(id)) {
      console.warn(`Module "${id}" is already registered. Skipping.`);
      return;
    }

    this.modules.set(id, module);

    // Register slot components if provided
    if (module.slotComponents) {
      module.slotComponents.forEach((sc: SlotComponent) => {
        slotComponentRegistry.register({
          ...sc,
          providedBy: id,
        });
      });

      if (import.meta.env.DEV) {
        console.log(`[ModuleRegistry] Registered ${module.slotComponents.length} slot component(s) from module: ${id}`);
      }
    }

    // Register compositions if provided
    if (module.compositions) {
      module.compositions.forEach((comp: Composition) => {
        compositionRegistry.register({
          ...comp,
          providedBy: id,
        });
      });

      if (import.meta.env.DEV) {
        console.log(`[ModuleRegistry] Registered ${module.compositions.length} composition(s) from module: ${id}`);
      }
    }

    if (import.meta.env.DEV) {
      console.log(`[ModuleRegistry] Registered module: ${id}`);
    }
  }

  getModule(id: string): ModuleExports | undefined {
    return this.modules.get(id);
  }

  getAllModules(): ModuleExports[] {
    return Array.from(this.modules.values());
  }

  hasModule(id: string): boolean {
    return this.modules.has(id);
  }

  unregister(id: string): boolean {
    // Clean up compositions and slot components before unregistering
    this.unregisterModuleCompositions(id);
    return this.modules.delete(id);
  }

  /**
   * Unregisters all compositions and slot components provided by a module
   * @param moduleId - Module ID to clean up
   */
  unregisterModuleCompositions(moduleId: string) {
    // Remove slot components
    const components = slotComponentRegistry.getAll();
    components
      .filter(c => c.providedBy === moduleId)
      .forEach(c => slotComponentRegistry.unregister(c.componentId));

    // Remove compositions
    const compositions = compositionRegistry.getByProvider(moduleId);
    compositions.forEach(c => compositionRegistry.unregister(c.id));

    if (import.meta.env.DEV) {
      console.log(`[ModuleRegistry] Unregistered compositions and slot components from module: ${moduleId}`);
    }
  }

  clear() {
    this.modules.clear();
  }

  getStats() {
    return {
      total: this.modules.size,
      modules: Array.from(this.modules.keys())
    };
  }
}

export const moduleRegistry = new ModuleRegistry();
