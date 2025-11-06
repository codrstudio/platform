/**
 * JQEL Hooks for Configuration Management
 *
 * Provides type-safe hooks for accessing and mutating
 * portal, module, and instance configurations.
 */

// JQEL client and query functions
export { jqelQuery } from '../../services/jqel/client';
export * from '../../services/jqel/portalQueries';

// Optimistic update hooks and helpers
export { useOptimisticMutation } from './useOptimisticMutation';
export * from './optimisticHelpers';

// Portal hooks
export {
  usePortals,
  usePortal,
  useActivePortals,
} from './usePortalQueries';

export {
  useCreatePortal,
  useUpdatePortal,
  useDeletePortal,
} from './usePortalMutations';

// Module hooks
export {
  useModules,
  useModule,
  useActiveModules,
} from './useModuleQueries';

export {
  useCreateModule,
  useUpdateModule,
  useDeleteModule,
} from './useModuleMutations';

// Instance hooks
export {
  useInstances,
  useInstance,
  usePortalInstances,
} from './useInstanceQueries';

export {
  useCreateInstance,
  useUpdateInstance,
  useDeleteInstance,
} from './useInstanceMutations';
