/**
 * Dependency Manager
 *
 * Manages module dependencies with topological sorting and circular dependency detection.
 * Ensures dependencies are loaded in correct order and validates dependency graph integrity.
 *
 * References:
 * - SPEC-modules.md (SPEC-MO-DE-*)
 *
 * Story 1.5.4: Manage module dependencies
 */

import type { ModuleManifest, ModuleExports } from '../../types/module';
import moduleRegistry from './ModuleRegistry';

/**
 * Dependency resolution result
 */
export interface DependencyResolution {
  /** Modules in load order (topologically sorted) */
  loadOrder: string[];

  /** Whether resolution was successful */
  success: boolean;

  /** Circular dependencies detected */
  cycles: string[][];

  /** Missing dependencies */
  missing: string[];
}

/**
 * DependencyManager - Manages module dependency graph
 *
 * Design principles:
 * - SPEC-MO-DE-014: Dependencies resolved in topological order
 * - SPEC-MO-DE-015: Modules without dependencies load first
 * - SPEC-MO-DE-016: Dependent modules load after dependencies
 * - SPEC-MO-DE-017: Load order is deterministic
 * - SPEC-MO-DE-008: Circular dependencies detected and rejected
 *
 * Algorithm: Kahn's algorithm for topological sorting with cycle detection
 */
class DependencyManager {
  /**
   * Resolve dependencies for a module
   *
   * Returns a topologically sorted list of modules to load.
   * Modules without dependencies appear first, then dependent modules.
   *
   * @param moduleId - Module to resolve dependencies for
   * @returns DependencyResolution with load order and validation results
   *
   * SPEC-MO-DE-014: Dependencies resolved in topological order
   * SPEC-MO-DE-017: Deterministic load order
   */
  resolveDependencies(moduleId: string): DependencyResolution {
    // Get all registered modules
    const allModules = moduleRegistry.getAllModules();
    const manifestMap = new Map<string, ModuleManifest>(
      allModules.map((mod) => [mod.manifest.id, mod.manifest])
    );

    // Check if target module exists
    if (!manifestMap.has(moduleId)) {
      return {
        loadOrder: [],
        success: false,
        cycles: [],
        missing: [moduleId],
      };
    }

    // Build dependency graph starting from target module
    const graph = this.buildDependencyGraph(moduleId, manifestMap);

    // Check for missing dependencies
    const missing = this.findMissingDependencies(graph, manifestMap);
    if (missing.length > 0) {
      return {
        loadOrder: [],
        success: false,
        cycles: [],
        missing,
      };
    }

    // Detect circular dependencies
    const cycles = this.detectCycles(graph);
    if (cycles.length > 0) {
      // SPEC-MO-DE-008: Circular dependencies detected and rejected
      return {
        loadOrder: [],
        success: false,
        cycles,
        missing: [],
      };
    }

    // Perform topological sort
    const loadOrder = this.topologicalSort(graph);

    return {
      loadOrder,
      success: true,
      cycles: [],
      missing: [],
    };
  }

  /**
   * Build dependency graph for a module and its transitive dependencies
   *
   * @param moduleId - Root module
   * @param manifestMap - Map of all available modules
   * @returns Adjacency list representation of dependency graph
   */
  private buildDependencyGraph(
    moduleId: string,
    manifestMap: Map<string, ModuleManifest>
  ): Map<string, string[]> {
    const graph = new Map<string, string[]>();
    const visited = new Set<string>();

    const visit = (id: string) => {
      if (visited.has(id)) return;
      visited.add(id);

      const manifest = manifestMap.get(id);
      if (!manifest) return;

      const deps = manifest.dependencies || [];
      graph.set(id, deps);

      // Recursively visit dependencies
      for (const depId of deps) {
        visit(depId);
      }
    };

    visit(moduleId);
    return graph;
  }

  /**
   * Find missing dependencies in the graph
   *
   * @param graph - Dependency graph
   * @param manifestMap - Map of available modules
   * @returns Array of missing module IDs
   *
   * SPEC-MO-DE-009: Missing dependencies prevent activation
   */
  private findMissingDependencies(
    graph: Map<string, string[]>,
    manifestMap: Map<string, ModuleManifest>
  ): string[] {
    const missing: string[] = [];

    for (const [_moduleId, deps] of graph) {
      for (const depId of deps) {
        if (!manifestMap.has(depId)) {
          if (!missing.includes(depId)) {
            missing.push(depId);
          }
        }
      }
    }

    return missing;
  }

  /**
   * Detect circular dependencies using DFS
   *
   * @param graph - Dependency graph
   * @returns Array of cycles (each cycle is array of module IDs)
   *
   * SPEC-MO-DE-008: Circular dependencies must be detected and rejected
   */
  private detectCycles(graph: Map<string, string[]>): string[][] {
    const cycles: string[][] = [];
    const visiting = new Set<string>();
    const visited = new Set<string>();

    const visit = (node: string, path: string[]) => {
      if (visiting.has(node)) {
        // Found cycle - extract it from path
        const cycleStart = path.indexOf(node);
        const cycle = [...path.slice(cycleStart), node];
        cycles.push(cycle);
        return;
      }

      if (visited.has(node)) {
        return;
      }

      visiting.add(node);
      path.push(node);

      const deps = graph.get(node) || [];
      for (const dep of deps) {
        visit(dep, path);
      }

      path.pop();
      visiting.delete(node);
      visited.add(node);
    };

    for (const node of graph.keys()) {
      if (!visited.has(node)) {
        visit(node, []);
      }
    }

    return cycles;
  }

  /**
   * Topological sort using Kahn's algorithm
   *
   * Produces a deterministic load order where:
   * - Modules without dependencies appear first
   * - Dependent modules appear after their dependencies
   * - Order is stable (same input produces same output)
   *
   * @param graph - Dependency graph (must be acyclic)
   * @returns Array of module IDs in load order
   *
   * SPEC-MO-DE-014: Topological ordering
   * SPEC-MO-DE-015: Modules without dependencies load first
   * SPEC-MO-DE-016: Dependent modules load after dependencies
   * SPEC-MO-DE-017: Deterministic ordering
   */
  private topologicalSort(graph: Map<string, string[]>): string[] {
    // Calculate in-degrees (number of incoming edges)
    const inDegree = new Map<string, number>();
    const allNodes = new Set<string>();

    // Initialize in-degrees
    for (const [node, deps] of graph) {
      allNodes.add(node);
      if (!inDegree.has(node)) {
        inDegree.set(node, 0);
      }
      for (const dep of deps) {
        allNodes.add(dep);
        inDegree.set(dep, (inDegree.get(dep) || 0) + 1);
      }
    }

    // Find all nodes with in-degree 0 (no dependencies)
    // SPEC-MO-DE-015: Modules without dependencies load first
    const queue: string[] = [];
    for (const node of allNodes) {
      if ((inDegree.get(node) || 0) === 0) {
        queue.push(node);
      }
    }

    // Sort queue for deterministic ordering
    // SPEC-MO-DE-017: Deterministic load order
    queue.sort();

    const result: string[] = [];

    while (queue.length > 0) {
      // Process node with no dependencies
      const node = queue.shift()!;
      result.push(node);

      // Find modules that depend on this node
      const dependents: string[] = [];
      for (const [depNode, deps] of graph) {
        if (deps.includes(node)) {
          dependents.push(depNode);
        }
      }

      // Decrease in-degree for dependents
      for (const dependent of dependents) {
        const degree = (inDegree.get(dependent) || 0) - 1;
        inDegree.set(dependent, degree);

        if (degree === 0) {
          queue.push(dependent);
          queue.sort(); // Maintain deterministic order
        }
      }
    }

    return result;
  }

  /**
   * Load module dependencies in correct order
   *
   * Loads all dependencies before loading the target module.
   * Note: This method is called by ModuleLoader, which handles the actual loading.
   * We return the load order so ModuleLoader can load dependencies sequentially.
   *
   * @param moduleId - Module to load (with dependencies)
   * @param loader - Function to load a module (provided by ModuleLoader)
   * @returns Promise resolving when module and all dependencies are loaded
   * @throws Error if dependencies cannot be resolved or loading fails
   *
   * SPEC-MO-DE-005: Platform validates dependencies when activating module
   * SPEC-MO-DE-006: Dependencies must be active in same portal
   * SPEC-MO-DE-007: Auto-activate dependencies if not active
   */
  async loadDependencies(
    moduleId: string,
    loader: (moduleId: string, skipDeps: boolean) => Promise<ModuleExports>
  ): Promise<void> {
    if (import.meta.env.DEV) {
      console.log(`[DependencyManager] Loading dependencies for: ${moduleId}`);
    }

    // Resolve dependency graph
    const resolution = this.resolveDependencies(moduleId);

    if (!resolution.success) {
      // Handle errors
      if (resolution.missing.length > 0) {
        // SPEC-MO-DE-009: Missing dependencies prevent activation
        throw new Error(
          `Cannot load "${moduleId}": missing dependencies [${resolution.missing.join(', ')}]`
        );
      }

      if (resolution.cycles.length > 0) {
        // SPEC-MO-DE-008: Circular dependencies rejected
        const cycleDesc = resolution.cycles
          .map((cycle) => cycle.join(' -> '))
          .join('; ');
        throw new Error(
          `Cannot load "${moduleId}": circular dependencies detected: ${cycleDesc}`
        );
      }

      throw new Error(`Cannot load "${moduleId}": dependency resolution failed`);
    }

    // Load modules in topological order
    // Group by depth for parallel loading of independent modules
    const loadOrder = resolution.loadOrder;

    if (import.meta.env.DEV) {
      console.log(`[DependencyManager] Load order: ${loadOrder.join(' -> ')}`);
    }

    // Load modules sequentially (dependencies before dependents)
    // Skip the target module itself (it will be loaded by caller)
    // Future optimization: Parallel loading of modules at same depth
    for (const depModuleId of loadOrder) {
      if (depModuleId === moduleId) {
        // Skip target module - will be loaded by ModuleLoader
        continue;
      }

      // Check if already loaded via registry
      if (!moduleRegistry.hasModule(depModuleId)) {
        if (import.meta.env.DEV) {
          console.log(`[DependencyManager] Loading dependency: ${depModuleId}`);
        }

        try {
          // Load with skipDeps=true to avoid infinite recursion
          // Dependencies were already resolved in topological order
          await loader(depModuleId, true);
        } catch (error) {
          throw new Error(
            `Failed to load dependency "${depModuleId}" for module "${moduleId}": ${
              error instanceof Error ? error.message : 'Unknown error'
            }`
          );
        }
      } else {
        if (import.meta.env.DEV) {
          console.log(`[DependencyManager] Dependency already loaded: ${depModuleId}`);
        }
      }
    }

    if (import.meta.env.DEV) {
      console.log(`[DependencyManager] All dependencies loaded for: ${moduleId}`);
    }
  }

  /**
   * Get dependency tree for visualization
   *
   * @param moduleId - Root module
   * @returns Tree structure showing module and its dependencies
   */
  getDependencyTree(moduleId: string): {
    module: string;
    dependencies: Array<{ module: string; dependencies: any }>;
  } | null {
    const allModules = moduleRegistry.getAllModules();
    const manifestMap = new Map<string, ModuleManifest>(
      allModules.map((mod) => [mod.manifest.id, mod.manifest])
    );

    const manifest = manifestMap.get(moduleId);
    if (!manifest) return null;

    const buildTree = (id: string): any => {
      const mod = manifestMap.get(id);
      if (!mod) return null;

      const deps = mod.dependencies || [];
      return {
        module: id,
        dependencies: deps.map((depId) => buildTree(depId)).filter(Boolean),
      };
    };

    return buildTree(moduleId);
  }

  /**
   * Get modules that depend on a given module
   *
   * Useful for determining impact of deactivating a module.
   *
   * @param moduleId - Module to find dependents for
   * @returns Array of module IDs that depend on this module
   *
   * SPEC-MO-DE-010: To deactivate module A, all dependents must be deactivated first
   * SPEC-MO-DE-011: Platform lists dependent modules when attempting deactivation
   */
  getDependents(moduleId: string): string[] {
    const allModules = moduleRegistry.getAllModules();
    const dependents: string[] = [];

    for (const mod of allModules) {
      const deps = mod.manifest.dependencies || [];
      if (deps.includes(moduleId)) {
        dependents.push(mod.manifest.id);
      }
    }

    return dependents;
  }

  /**
   * Validate that dependencies are satisfied for a module
   *
   * @param moduleId - Module to validate
   * @returns True if all dependencies are registered
   *
   * SPEC-MO-DE-005: Platform validates dependencies when activating
   */
  validateDependencies(moduleId: string): boolean {
    const resolution = this.resolveDependencies(moduleId);
    return resolution.success;
  }
}

/**
 * Singleton instance of DependencyManager
 * Exported as default for global access throughout the application
 *
 * Usage:
 * ```typescript
 * import dependencyManager from '@/core/modules/DependencyManager';
 *
 * // Resolve dependencies
 * const resolution = dependencyManager.resolveDependencies('chat');
 * if (!resolution.success) {
 *   console.error('Cannot load module:', resolution.missing, resolution.cycles);
 * }
 *
 * // Load module with dependencies
 * await dependencyManager.loadDependencies('chat');
 *
 * // Get dependents
 * const dependents = dependencyManager.getDependents('media-components');
 * ```
 */
const dependencyManager = new DependencyManager();

export default dependencyManager;
