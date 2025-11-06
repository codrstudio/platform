// JQEL service barrel export

// Core client
export { jqelQuery } from './client';

// Portal-specific queries (backward compatibility)
export * from './portalQueries';

// Errors
export * from './errors';

// Query keys and invalidation (Task 1.4.9)
export * from './queryKeys';
export {
  invalidateAfterMutation,
  invalidateBackend,
  invalidateEntity
} from './invalidation';
export type { InvalidationStrategy, InvalidationScope } from './invalidation';

// Hooks (Tasks 1.4.7-1.4.8)
export * from './hooks';

// Mutation functions
export {
  insertRecord,
  updateRecord,
  deleteRecord,
  upsertRecord
} from './mutations';
