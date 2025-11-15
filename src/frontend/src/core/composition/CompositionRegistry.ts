import type { Composition } from './types';

/**
 * Registry centralizado para gerenciar composições de layout
 *
 * Composições definem a estrutura de layout de páginas, incluindo
 * quais slots estão disponíveis e quais componentes devem ser
 * renderizados em cada slot.
 */
class CompositionRegistry {
  private compositions: Map<string, Composition> = new Map();

  /**
   * Registra uma nova composição
   * @param composition - Composição a ser registrada
   */
  register(composition: Composition): void {
    this.compositions.set(composition.id, composition);
  }

  /**
   * Remove uma composição do registry
   * @param compositionId - ID da composição a ser removida
   */
  unregister(compositionId: string): void {
    this.compositions.delete(compositionId);
  }

  /**
   * Obtém uma composição pelo ID
   * @param compositionId - ID da composição
   * @returns A composição ou undefined se não encontrada
   */
  get(compositionId: string): Composition | undefined {
    return this.compositions.get(compositionId);
  }

  /**
   * Obtém todas as composições registradas
   * @returns Array com todas as composições
   */
  getAll(): Composition[] {
    return Array.from(this.compositions.values());
  }

  /**
   * Obtém todas as composições fornecidas por um provedor específico
   * @param providedBy - ID do provedor (módulo ou 'platform')
   * @returns Array com as composições do provedor
   */
  getByProvider(providedBy: string): Composition[] {
    return this.getAll().filter(c => c.providedBy === providedBy);
  }
}

/**
 * Instância singleton do registry de composições
 */
export const compositionRegistry = new CompositionRegistry();
