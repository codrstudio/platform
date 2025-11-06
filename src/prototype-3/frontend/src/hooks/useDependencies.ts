/**
 * useDependencies Hook
 *
 * React hook for managing and visualizing module dependencies.
 * Provides dependency tree, resolution status, and cycle detection.
 *
 * References:
 * - SPEC-modules.md (SPEC-MO-DE-*)
 *
 * Story 1.5.4: Manage dependencies
 */

import { useMemo } from 'react';
import dependencyManager, { type DependencyResolution } from '../core/modules/DependencyManager';

/**
 * Dependency tree node
 */
export interface DependencyTreeNode {
  module: string;
  dependencies: DependencyTreeNode[];
}

/**
 * Hook return value
 */
export interface UseDependenciesResult {
  /** Dependency resolution result */
  resolution: DependencyResolution;

  /** Whether dependencies are resolved successfully */
  isResolved: boolean;

  /** Whether circular dependencies exist */
  hasCycles: boolean;

  /** Circular dependency paths */
  cycles: string[][];

  /** Missing dependencies */
  missing: string[];

  /** Dependency load order */
  loadOrder: string[];

  /** Dependency tree for visualization */
  tree: DependencyTreeNode | null;

  /** Modules that depend on this module */
  dependents: string[];
}

/**
 * Hook for managing module dependencies
 *
 * @param moduleId - Module to analyze dependencies for
 * @returns Dependency information and validation results
 *
 * Usage:
 * ```typescript
 * const { isResolved, hasCycles, cycles, loadOrder, tree } = useDependencies('chat');
 *
 * if (!isResolved) {
 *   console.error('Cannot load module:', cycles, missing);
 * }
 *
 * console.log('Load order:', loadOrder);
 * ```
 */
export function useDependencies(moduleId: string): UseDependenciesResult {
  // Resolve dependencies (memoized)
  const resolution = useMemo(
    () => dependencyManager.resolveDependencies(moduleId),
    [moduleId]
  );

  // Get dependency tree (memoized)
  const tree = useMemo(
    () => dependencyManager.getDependencyTree(moduleId),
    [moduleId]
  );

  // Get dependents (memoized)
  const dependents = useMemo(
    () => dependencyManager.getDependents(moduleId),
    [moduleId]
  );

  return {
    resolution,
    isResolved: resolution.success,
    hasCycles: resolution.cycles.length > 0,
    cycles: resolution.cycles,
    missing: resolution.missing,
    loadOrder: resolution.loadOrder,
    tree,
    dependents,
  };
}

/**
 * Hook to get dependency tree for a module
 *
 * @param moduleId - Module to get tree for
 * @returns Dependency tree or null if module not found
 */
export function useDependencyTree(moduleId: string): DependencyTreeNode | null {
  return useMemo(
    () => dependencyManager.getDependencyTree(moduleId),
    [moduleId]
  );
}

/**
 * Hook to get modules that depend on a module
 *
 * Useful for determining impact of deactivating a module.
 *
 * @param moduleId - Module to find dependents for
 * @returns Array of dependent module IDs
 *
 * SPEC-MO-DE-010: To deactivate module A, all dependents must be deactivated first
 * SPEC-MO-DE-011: Platform lists dependent modules when attempting deactivation
 */
export function useDependents(moduleId: string): string[] {
  return useMemo(
    () => dependencyManager.getDependents(moduleId),
    [moduleId]
  );
}

/**
 * Hook to validate module dependencies
 *
 * @param moduleId - Module to validate
 * @returns True if all dependencies are satisfied
 */
export function useValidateDependencies(moduleId: string): boolean {
  return useMemo(
    () => dependencyManager.validateDependencies(moduleId),
    [moduleId]
  );
}
