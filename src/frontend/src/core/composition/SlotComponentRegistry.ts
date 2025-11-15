import type { SlotComponent, SlotType } from './types';

/**
 * Registry centralizado para gerenciar componentes de slots
 *
 * Componentes de slots são componentes React que podem ser
 * renderizados em slots específicos de composições de layout
 * (navbar, sidebar, companion, breadcrumb, footer).
 */
class SlotComponentRegistry {
  private components: Map<string, SlotComponent> = new Map();

  /**
   * Registra um novo componente de slot
   * @param component - Componente a ser registrado
   */
  register(component: SlotComponent): void {
    this.components.set(component.componentId, component);
  }

  /**
   * Remove um componente do registry
   * @param componentId - ID do componente a ser removido
   */
  unregister(componentId: string): void {
    this.components.delete(componentId);
  }

  /**
   * Obtém um componente pelo ID
   * @param componentId - ID do componente
   * @returns O componente ou undefined se não encontrado
   */
  get(componentId: string): SlotComponent | undefined {
    return this.components.get(componentId);
  }

  /**
   * Obtém todos os componentes registrados para um slot específico
   * @param slot - Tipo do slot
   * @returns Array com os componentes do slot
   */
  getBySlot(slot: SlotType): SlotComponent[] {
    return this.getAll().filter(c => c.slot === slot);
  }

  /**
   * Obtém todos os componentes registrados
   * @returns Array com todos os componentes
   */
  getAll(): SlotComponent[] {
    return Array.from(this.components.values());
  }
}

/**
 * Instância singleton do registry de componentes de slots
 */
export const slotComponentRegistry = new SlotComponentRegistry();
