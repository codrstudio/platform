/**
 * Dependency Resolver Utilities
 *
 * Provides graph algorithms for module dependency analysis:
 * - Circular dependency detection (DFS-based)
 * - Topological sorting (Kahn's algorithm)
 * - Dependency resolution for module activation
 *
 * SPEC References:
 * - SPEC-MO-DE-008: Circular dependency detection required
 * - SPEC-MO-DE-014:017: Topological ordering for activation
 * - SPEC-MS-VA-009: Validation before activation
 */

import type { Module } from '../../../types/module';

export interface DependencyResolution {
  toActivate: Module[];        // Ordered list of modules to activate
  alreadyActive: Module[];     // Dependencies already active in portal
  order: string[];             // Activation order (moduleIds)
  hasCircular: boolean;        // Circular dependency detected
  circularPath?: string[];     // Path of circular dependency (if detected)
}

/**
 * Detect circular dependency in module graph using DFS
 *
 * @param moduleId - Starting module ID
 * @param modules - All available modules
 * @param visited - Set of already visited nodes
 * @param path - Current path being explored
 * @returns Array of module IDs forming circular path, or null if no cycle
 */
export function detectCircularDependency(
  moduleId: string,
  modules: Module[],
  visited = new Set<string>(),
  path = new Set<string>()
): string[] | null {
  // If module is in current path, we have a cycle
  if (path.has(moduleId)) {
    return Array.from(path);
  }

  // If already visited in a previous branch, no need to check again
  if (visited.has(moduleId)) {
    return null;
  }

  visited.add(moduleId);
  path.add(moduleId);

  const module = modules.find(m => m.moduleId === moduleId);
  const dependencies = module?.dependencies || [];

  // Recursively check each dependency
  for (const dep of dependencies) {
    const circular = detectCircularDependency(dep, modules, visited, new Set(path));
    if (circular) return circular;
  }

  path.delete(moduleId);
  return null;
}

/**
 * Topologically sort modules by dependencies using Kahn's algorithm
 *
 * @param modules - Modules to sort
 * @returns Array of module IDs in dependency order (dependencies first)
 * @throws Error if circular dependency detected
 */
export function topologicalSort(modules: Module[]): string[] {
  // Build adjacency list (moduleId -> dependencies)
  const graph = new Map<string, string[]>();
  const inDegree = new Map<string, number>();

  // Initialize graph and in-degree map
  modules.forEach(module => {
    graph.set(module.moduleId, module.dependencies || []);
    inDegree.set(module.moduleId, 0);
  });

  // Calculate in-degree for each module
  modules.forEach(module => {
    (module.dependencies || []).forEach(dep => {
      inDegree.set(dep, (inDegree.get(dep) || 0) + 1);
    });
  });

  // Find modules with no dependencies (in-degree 0)
  const queue: string[] = [];
  inDegree.forEach((degree, moduleId) => {
    if (degree === 0) queue.push(moduleId);
  });

  const sorted: string[] = [];

  // Process modules in topological order
  while (queue.length > 0) {
    const current = queue.shift()!;
    sorted.push(current);

    const dependencies = graph.get(current) || [];
    dependencies.forEach(dep => {
      const newDegree = (inDegree.get(dep) || 0) - 1;
      inDegree.set(dep, newDegree);
      if (newDegree === 0) queue.push(dep);
    });
  }

  // If not all modules processed, there's a cycle
  if (sorted.length !== modules.length) {
    throw new Error('Circular dependency detected');
  }

  return sorted;
}

/**
 * Resolve dependencies for a module activation
 *
 * Analyzes module dependencies and determines:
 * - Which dependencies need to be activated
 * - Which dependencies are already active
 * - The correct activation order (topological)
 * - Whether circular dependencies exist
 *
 * @param moduleId - Module to activate
 * @param _portalId - Target portal ID (reserved for future use)
 * @param allModules - All available modules
 * @param portal - Portal configuration with activeModules
 * @returns Dependency resolution result
 */
export function resolveDependencies(
  moduleId: string,
  _portalId: string,
  allModules: Module[],
  portal: { activeModules: string[] }
): DependencyResolution {
  const module = allModules.find(m => m.moduleId === moduleId);
  if (!module) {
    throw new Error('Module not found');
  }

  // Check for circular dependencies first
  const circular = detectCircularDependency(moduleId, allModules);
  if (circular) {
    return {
      toActivate: [],
      alreadyActive: [],
      order: [],
      hasCircular: true,
      circularPath: circular,
    };
  }

  // Collect all dependencies recursively
  const allDeps = new Set<string>();
  const collectDeps = (mid: string) => {
    const m = allModules.find(mod => mod.moduleId === mid);
    (m?.dependencies || []).forEach(dep => {
      allDeps.add(dep);
      collectDeps(dep);
    });
  };
  collectDeps(moduleId);

  // Split into already active and to-activate
  const alreadyActive: Module[] = [];
  const toActivate: Module[] = [];

  allDeps.forEach(depId => {
    const depModule = allModules.find(m => m.moduleId === depId);
    if (!depModule) return;

    if (portal.activeModules.includes(depId)) {
      alreadyActive.push(depModule);
    } else {
      toActivate.push(depModule);
    }
  });

  // Topologically sort modules to activate
  const order = toActivate.length > 0 ? topologicalSort(toActivate) : [];

  return {
    toActivate,
    alreadyActive,
    order,
    hasCircular: false,
  };
}
