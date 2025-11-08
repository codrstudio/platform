/**
 * useSchemaDiscovery Hook
 *
 * Hook para descoberta de schemas, entidades e ações disponíveis no sistema.
 * Utilizado pelo Command Palette e outras features que precisam descobrir
 * dinamicamente quais operações estão disponíveis.
 *
 * @see SPEC-jqel-schema.md
 */

import { useQuery } from '@tanstack/react-query';
import type {
  SDLDocument,
  SDLSchema,
  SDLEntity,
  SDLAction,
  SDLSelectAction,
  SDLMutateAction,
} from '@/types/sdl';

/**
 * Opções para useSchemaDiscovery
 */
export interface UseSchemaDiscoveryOptions {
  /** Se deve fazer fetch imediatamente (default: true) */
  enabled?: boolean;
  /** Tempo de cache em ms (default: 5 minutos) */
  staleTime?: number;
}

/**
 * Resultado do useSchemaDiscovery
 */
export interface SchemaDiscoveryResult {
  /** Documento SDL completo */
  document: SDLDocument | undefined;
  /** Lista de schemas disponíveis */
  schemas: SDLSchema[];
  /** Lista de entidades disponíveis */
  entities: SDLEntity[];
  /** Lista de ações disponíveis */
  actions: SDLAction[];
  /** Se está carregando */
  isLoading: boolean;
  /** Se ocorreu erro */
  isError: boolean;
  /** Erro (se houver) */
  error: Error | null;
  /** Recarregar schemas */
  refetch: () => void;
}

/**
 * Funções de busca e filtro
 */
export interface SchemaDiscoveryHelpers {
  /** Buscar schema por nome */
  getSchema: (name: string) => SDLSchema | undefined;
  /** Buscar entidade por schema + nome */
  getEntity: (schema: string, name: string) => SDLEntity | undefined;
  /** Buscar ação por nome */
  getAction: (name: string) => SDLAction | undefined;
  /** Listar ações de um schema específico */
  getActionsBySchema: (schema: string) => SDLAction[];
  /** Listar ações SELECT */
  getSelectActions: () => SDLSelectAction[];
  /** Listar ações MUTATE */
  getMutateActions: () => SDLMutateAction[];
  /** Listar ações searchable (para Command Palette) */
  getSearchableActions: () => SDLAction[];
  /** Listar entidades de um schema */
  getEntitiesBySchema: (schema: string) => SDLEntity[];
}

/**
 * Resultado completo com helpers
 */
export type UseSchemaDiscoveryReturn = SchemaDiscoveryResult & SchemaDiscoveryHelpers;

/**
 * Fetch SDL document from backend
 */
async function fetchSchemas(): Promise<SDLDocument> {
  const response = await fetch('/api/jqel/schemas');

  if (!response.ok) {
    throw new Error(`Failed to fetch schemas: ${response.statusText}`);
  }

  const data = await response.json();

  // Validar estrutura básica
  if (!data.schemas || !data.entities || !data.actions) {
    throw new Error('Invalid SDL document: missing required sections');
  }

  return data as SDLDocument;
}

/**
 * Hook para descoberta de schemas
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const {
 *     schemas,
 *     entities,
 *     actions,
 *     isLoading,
 *     getSchema,
 *     getEntity,
 *     getAction,
 *   } = useSchemaDiscovery();
 *
 *   if (isLoading) return <div>Loading...</div>;
 *
 *   return (
 *     <div>
 *       <h2>Schemas disponíveis:</h2>
 *       <ul>
 *         {schemas.map(s => <li key={s.name}>{s.name}</li>)}
 *       </ul>
 *     </div>
 *   );
 * }
 * ```
 */
export function useSchemaDiscovery(
  options: UseSchemaDiscoveryOptions = {}
): UseSchemaDiscoveryReturn {
  const { enabled = true, staleTime = 5 * 60 * 1000 } = options;

  const {
    data: document,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['schema-discovery'],
    queryFn: fetchSchemas,
    enabled,
    staleTime,
    retry: 2,
  });

  const schemas = document?.schemas ?? [];
  const entities = document?.entities ?? [];
  const actions = document?.actions ?? [];

  // Helper functions
  const getSchema = (name: string): SDLSchema | undefined => {
    return schemas.find((s) => s.name === name);
  };

  const getEntity = (schema: string, name: string): SDLEntity | undefined => {
    return entities.find((e) => e.schema === schema && e.name === name);
  };

  const getAction = (name: string): SDLAction | undefined => {
    return actions.find((a) => a.name === name);
  };

  const getActionsBySchema = (schema: string): SDLAction[] => {
    return actions.filter((a) => a.schema === schema);
  };

  const getSelectActions = (): SDLSelectAction[] => {
    return actions.filter((a) => a.operation === 'select') as SDLSelectAction[];
  };

  const getMutateActions = (): SDLMutateAction[] => {
    return actions.filter((a) => a.operation === 'mutate') as SDLMutateAction[];
  };

  const getSearchableActions = (): SDLAction[] => {
    return actions.filter((a) => a.searchable?.enabled === true);
  };

  const getEntitiesBySchema = (schema: string): SDLEntity[] => {
    return entities.filter((e) => e.schema === schema);
  };

  return {
    document,
    schemas,
    entities,
    actions,
    isLoading,
    isError,
    error: error as Error | null,
    refetch,
    getSchema,
    getEntity,
    getAction,
    getActionsBySchema,
    getSelectActions,
    getMutateActions,
    getSearchableActions,
    getEntitiesBySchema,
  };
}

/**
 * Hook simplificado para buscar apenas ações searchable
 * (útil para Command Palette)
 *
 * @example
 * ```tsx
 * function CommandPalette() {
 *   const { actions, isLoading } = useSearchableActions();
 *
 *   return (
 *     <CommandPaletteUI actions={actions} loading={isLoading} />
 *   );
 * }
 * ```
 */
export function useSearchableActions(options: UseSchemaDiscoveryOptions = {}) {
  const { actions, isLoading, isError, error, refetch } = useSchemaDiscovery(options);

  const searchableActions = actions.filter((a) => a.searchable?.enabled === true);

  return {
    actions: searchableActions,
    isLoading,
    isError,
    error,
    refetch,
  };
}
