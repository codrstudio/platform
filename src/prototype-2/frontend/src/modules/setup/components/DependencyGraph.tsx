/**
 * Dependency Graph Component
 *
 * Visualizes module dependency tree with hierarchical structure.
 * Shows active vs inactive dependencies with visual indicators.
 *
 * Features:
 * - Recursive tree rendering
 * - Color-coded status (active/inactive)
 * - Accessible tree structure (ARIA attributes)
 * - Compact mode for inline display
 *
 * SPEC References:
 * - SPEC-MS-FU-009: Dependency visualization
 * - SPEC-MO-DE-011:016: Dependency display requirements
 */

import { GitBranch, Check } from 'lucide-react';
import type { Module } from '../../../types/module';

interface DependencyGraphProps {
  rootModuleId: string;
  modules: Module[];
  activeModules: string[];
  compact?: boolean;
}

/**
 * Renders a visual tree of module dependencies
 *
 * @param rootModuleId - Root module to display dependencies for
 * @param modules - All available modules
 * @param activeModules - Array of module IDs currently active in portal
 * @param compact - If true, shows simplified view without nested dependencies
 */
export function DependencyGraph({
  rootModuleId,
  modules,
  activeModules,
  compact = false
}: DependencyGraphProps) {
  const rootModule = modules.find(m => m.moduleId === rootModuleId);
  if (!rootModule) return null;

  /**
   * Recursively render a module node and its dependencies
   */
  const renderNode = (moduleId: string, level: number = 0): React.ReactElement | null => {
    const module = modules.find(m => m.moduleId === moduleId);
    if (!module) return null;

    const isActive = activeModules.includes(moduleId);
    const dependencies = module.dependencies || [];

    return (
      <div key={moduleId} className="space-y-1">
        <div
          className="flex items-center gap-2"
          style={{ paddingLeft: `${level * 20}px` }}
          role="treeitem"
          aria-level={level + 1}
          aria-expanded={!compact && dependencies.length > 0 ? 'true' : undefined}
        >
          <GitBranch className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <span className={`text-sm ${
            isActive ? 'text-green-600 dark:text-green-400 font-medium' : 'text-foreground'
          }`}>
            {module.name}
          </span>
          {isActive && <Check className="w-4 h-4 text-green-600 dark:text-green-400" aria-label="Active" />}
        </div>

        {!compact && dependencies.length > 0 && (
          <div className="space-y-1">
            {dependencies.map(dep => renderNode(dep, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className="space-y-2 p-3 bg-muted/30 rounded-md border"
      role="tree"
      aria-label={`Dependency tree for ${rootModule.name}`}
    >
      {renderNode(rootModuleId)}
    </div>
  );
}
