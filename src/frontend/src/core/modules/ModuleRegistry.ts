/**
 * Module Registry - Central module management
 *
 * SPEC Compliance:
 * - SPEC-MO-RE-*: Module registration and discovery
 */

import type { ModuleExports } from '@/types/module';

class ModuleRegistry {
  private modules = new Map<string, ModuleExports>();

  register(module: ModuleExports) {
    const id = module.manifest.id;

    if (this.modules.has(id)) {
      console.warn(`Module "${id}" is already registered. Skipping.`);
      return;
    }

    this.modules.set(id, module);

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
    return this.modules.delete(id);
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
