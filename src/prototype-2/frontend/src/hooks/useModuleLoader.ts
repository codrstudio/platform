// Hook to load modules for a portal
// Based on SPEC-module-loading.md

import { useState, useEffect } from 'react';
import { ModuleLoader } from '../core/modules/ModuleLoader';
import type { ModuleExports } from '../types/module';

interface UseModuleLoaderResult {
  modules: ModuleExports[];
  loading: boolean;
  error: Error | null;
}

export function useModuleLoader(moduleIds: string[]): UseModuleLoaderResult {
  const [modules, setModules] = useState<ModuleExports[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (moduleIds.length === 0) {
      setModules([]);
      setLoading(false);
      return;
    }

    const loadModules = async () => {
      setLoading(true);
      setError(null);

      try {
        const loaded = await ModuleLoader.loadModules(moduleIds);
        setModules(loaded);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load modules'));
        setModules([]);
      } finally {
        setLoading(false);
      }
    };

    loadModules();
  }, [moduleIds.join(',')]); // Dependency on array content, not reference

  return { modules, loading, error };
}
