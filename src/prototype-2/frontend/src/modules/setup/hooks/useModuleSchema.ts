/**
 * useModuleSchema Hook
 *
 * Fetches module metadata with focus on configuration schema.
 * Returns module schema information for validation purposes.
 *
 * Based on SPEC-module-setup.md SPEC-MS-FU-017
 */

import { useModule } from '../../../hooks/jqel/useModuleQueries';
import type { ModuleConfigSchema } from '../types/schema';

/**
 * Module schema info extracted from module metadata
 */
export interface ModuleSchemaInfo {
  moduleId: string;
  name: string;
  configSchema?: ModuleConfigSchema;
}

/**
 * Fetch module schema for instance validation
 *
 * @param moduleId - Module ID to fetch schema for
 * @example
 * const { data: schema, isLoading } = useModuleSchema('setup');
 * if (schema?.configSchema) {
 *   // Use schema for validation
 * }
 */
export function useModuleSchema(moduleId: string) {
  const result = useModule(moduleId);
  
  // Transform the result to extract schema info
  const transformedData = result.data ? {
    moduleId: result.data.moduleId,
    name: result.data.name,
    configSchema: result.data.configSchema,
  } : undefined;
  
  return {
    ...result,
    data: transformedData,
  };
}
