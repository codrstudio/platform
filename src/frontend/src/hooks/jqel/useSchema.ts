/**
 * useSchema Hook (formerly useSchemaDiscovery)
 *
 * Hook para descoberta de schemas, entidades e ações disponíveis no sistema.
 * Utilizado pelo Command Palette e outras features que precisam descobrir
 * dinamicamente quais operações estão disponíveis.
 *
 * MIGRATED: Now uses JQEL instead of direct fetch
 * Query: { schema: "system", select: "sdl" }
 *
 * @see SPEC-jqel-schema.md
 */

import { useMemo } from 'react'
import { useJQELQuery } from '../useJQEL'
import type {
  SDLDocument,
  SDLSchema,
  SDLEntity,
  SDLAction,
  SDLSelectAction,
  SDLMutateAction,
} from '@/types/sdl'

/**
 * Opções para useSchemaDiscovery
 */
export interface UseSchemaDiscoveryOptions {
  /** Se deve fazer fetch imediatamente (default: true) */
  enabled?: boolean
  /** Tempo de cache em ms (default: 5 minutos) */
  staleTime?: number
}

/**
 * Resultado do useSchemaDiscovery
 */
export interface SchemaDiscoveryResult {
  /** Documento SDL completo */
  document: SDLDocument | undefined
  /** Lista de schemas disponíveis */
  schemas: SDLSchema[]
  /** Lista de entidades disponíveis */
  entities: SDLEntity[]
  /** Lista de ações disponíveis */
  actions: SDLAction[]
  /** Se está carregando */
  isLoading: boolean
  /** Se ocorreu erro */
  isError: boolean
  /** Erro (se houver) */
  error: Error | null
  /** Recarregar schemas */
  refetch: () => void
}

/**
 * Funções de busca e filtro
 */
export interface SchemaDiscoveryHelpers {
  /** Buscar schema por nome */
  getSchema: (name: string) => SDLSchema | undefined
  /** Buscar entidade por schema + nome */
  getEntity: (schema: string, name: string) => SDLEntity | undefined
  /** Buscar ação por nome */
  getAction: (name: string) => SDLAction | undefined
  /** Listar ações de um schema específico */
  getActionsBySchema: (schema: string) => SDLAction[]
  /** Listar ações SELECT */
  getSelectActions: () => SDLSelectAction[]
  /** Listar ações MUTATE */
  getMutateActions: () => SDLMutateAction[]
  /** Listar ações searchable (para Command Palette) */
  getSearchableActions: () => SDLAction[]
  /** Listar entidades de um schema */
  getEntitiesBySchema: (schema: string) => SDLEntity[]
}

/**
 * Resultado completo com helpers
 */
export type UseSchemaDiscoveryReturn = SchemaDiscoveryResult & SchemaDiscoveryHelpers

/**
 * Hook para descoberta de schemas via JQEL
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
  const { enabled = true, staleTime = 5 * 60 * 1000 } = options

  const {
    data: result,
    isLoading,
    isError,
    error,
    refetch,
  } = useJQELQuery<SDLDocument[]>({
    schema: 'system',
    select: 'sdl',
  }, {
    enabled,
    staleTime,
    retry: 2,
  })

  const document = result?.data?.[0]
  const schemas = document?.schemas ?? []
  const entities = document?.entities ?? []
  const actions = document?.actions ?? []

  // Helper functions with useMemo for performance
  const getSchema = useMemo(() => (name: string): SDLSchema | undefined => {
    return schemas.find((s) => s.name === name)
  }, [schemas])

  const getEntity = useMemo(() => (schema: string, name: string): SDLEntity | undefined => {
    return entities.find((e) => e.schema === schema && e.name === name)
  }, [entities])

  const getAction = useMemo(() => (name: string): SDLAction | undefined => {
    return actions.find((a) => a.name === name)
  }, [actions])

  const getActionsBySchema = useMemo(() => (schema: string): SDLAction[] => {
    return actions.filter((a) => a.schema === schema)
  }, [actions])

  const getSelectActions = useMemo(() => (): SDLSelectAction[] => {
    return actions.filter((a) => a.operation === 'select') as SDLSelectAction[]
  }, [actions])

  const getMutateActions = useMemo(() => (): SDLMutateAction[] => {
    return actions.filter((a) => a.operation === 'mutate') as SDLMutateAction[]
  }, [actions])

  const getSearchableActions = useMemo(() => (): SDLAction[] => {
    return actions.filter((a) => a.searchable?.enabled === true)
  }, [actions])

  const getEntitiesBySchema = useMemo(() => (schema: string): SDLEntity[] => {
    return entities.filter((e) => e.schema === schema)
  }, [entities])

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
  }
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
  const { actions, isLoading, isError, error, refetch } = useSchemaDiscovery(options)

  const searchableActions = useMemo(() =>
    actions.filter((a) => a.searchable?.enabled === true),
    [actions]
  )

  return {
    actions: searchableActions,
    isLoading,
    isError,
    error,
    refetch,
  }
}
