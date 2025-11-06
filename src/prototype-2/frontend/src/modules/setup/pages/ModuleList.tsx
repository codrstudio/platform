import { useState, useMemo, useEffect } from 'react';
import { useModules } from '../../../hooks/jqel/useModuleQueries';
import { ModuleCard } from '../components/ModuleCard';
import { toast } from '../../../hooks/use-toast';
import { Search } from 'lucide-react';

export default function ModuleList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'functionality' | 'components'>('all');

  const { data: modules, isLoading, isError, error, refetch } = useModules();

  // Filter modules based on search and type
  const filteredModules = useMemo(() => {
    if (!modules) return [];

    return modules.filter((module) => {
      const matchesSearch =
        module.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        module.moduleId.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || module.type === filterType;

      return matchesSearch && matchesType;
    });
  }, [modules, searchTerm, filterType]);

  // Show error toast when error occurs
  useEffect(() => {
    if (isError && error) {
      toast({
        title: 'Error loading modules',
        description: error?.message || 'Failed to fetch modules',
        variant: 'error',
        duration: 5000,
      });
    }
  }, [isError, error]);

  return (
    <main className="p-6 md:p-8" role="main">
      <h1 className="text-2xl font-semibold mb-6">Available Modules</h1>

      {/* Search and Filter */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative" role="search">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search modules..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:border-transparent"
            aria-label="Search modules"
            disabled={isLoading}
          />
        </div>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as 'all' | 'functionality' | 'components')}
          className="px-4 py-2 border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:ring-offset-2"
          aria-label="Filter by module type"
          disabled={isLoading}
        >
          <option value="all">All Types</option>
          <option value="functionality">Functionality</option>
          <option value="components">Components</option>
        </select>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
          aria-busy="true"
          aria-live="polite"
        >
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="border rounded-lg p-4 bg-card animate-pulse">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
              <div className="flex gap-2">
                <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {isError && !isLoading && (
        <div className="text-center py-12">
          <div className="text-destructive text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-medium mb-2">Failed to load modules</h2>
          <p className="text-muted-foreground mb-4">
            {error?.message || 'Could not fetch module list'}
          </p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && filteredModules.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">📦</div>
          <h2 className="text-xl font-medium mb-2">
            No modules {searchTerm ? 'found' : 'available'}
          </h2>
          <p className="text-muted-foreground">
            {searchTerm ? 'Try a different search term' : 'Contact admin to add modules'}
          </p>
        </div>
      )}

      {/* Success State - Module Grid */}
      {!isLoading && !isError && filteredModules.length > 0 && (
        <>
          <p className="text-sm text-muted-foreground mb-4" aria-live="polite">
            Showing {filteredModules.length} {filteredModules.length === 1 ? 'module' : 'modules'}
          </p>
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
            role="list"
          >
            {filteredModules.map((module) => (
              <div key={module.moduleId} role="listitem">
                <ModuleCard module={module} />
              </div>
            ))}
          </div>
        </>
      )}
    </main>
  );
}
