/**
 * Extended types for the Composition Editor system
 * DESIGN Reference: DES-ARCH-003
 *
 * This file contains additional types needed for the SlotConfigForm system
 * that extend the base composition types.
 */

import type { Composition, SlotType, LayoutWidth } from './types';

/**
 * Extended Composition interface with slot configurations
 * DESIGN Reference: DES-ARCH-003
 *
 * Extends the base Composition interface to include configurations
 * for individual slot components.
 */
export interface CompositionWithConfigs extends Composition {
  /**
   * Configurações específicas de cada componente de slot
   *
   * Armazena configurações customizadas para cada componente usado nos slots.
   * A chave é o componentId e o valor são as configurações específicas do componente.
   *
   * Exemplo:
   * {
   *   'blueprint-header': {
   *     menuItems: [...],
   *     showBrandLogo: true,
   *     showThemeToggle: true
   *   }
   * }
   */
  slotConfigs?: {
    [componentId: string]: Record<string, any>;
  };
}

/**
 * State for the composition editor
 *
 * Maintains the current state of a composition being edited,
 * including slot selections, component assignments, and configurations.
 */
export interface CompositionEditorState {
  /** ID of the composition being edited */
  compositionId: string;

  /** Name of the composition */
  name: string;

  /** Description of the composition */
  description?: string;

  /** Active slots in the composition */
  slots: {
    navbar?: boolean;
    sidebar?: boolean;
    companion?: boolean;
    breadcrumb?: boolean;
    desktop: true;
    footer?: boolean;
  };

  /** Component assignments for each slot */
  components: {
    navbar?: string;
    sidebar?: string;
    companion?: string;
    breadcrumb?: string;
    footer?: string;
  };

  /** Configuration for each slot component */
  slotConfigs: {
    [componentId: string]: Record<string, any>;
  };

  /** Layout configuration */
  layout: {
    width: LayoutWidth;
  };

  /** Provider of the composition */
  providedBy: string;

  /** Whether the composition has unsaved changes */
  hasChanges?: boolean;

  /** Whether the composition is being saved */
  isSaving?: boolean;

  /** Any validation errors */
  errors?: Record<string, string>;
}

/**
 * Individual slot configuration with component and config
 */
export interface SlotConfiguration {
  /** Type of the slot */
  slotType: SlotType;

  /** ID of the component assigned to this slot */
  componentId?: string;

  /** Configuration for the component */
  config?: Record<string, any>;

  /** Whether this slot is active */
  isActive: boolean;
}

/**
 * Props for the composition editor component
 */
export interface CompositionEditorProps {
  /** ID of existing composition to edit */
  compositionId?: string;

  /** Portal ID this composition belongs to */
  portalId: string;

  /** Callback when composition is saved */
  onSave?: (composition: CompositionWithConfigs) => void | Promise<void>;

  /** Callback when editor is closed */
  onClose?: () => void;

  /** Initial composition data for new compositions */
  initialData?: Partial<CompositionWithConfigs>;
}

/**
 * Configuration for a specific slot component
 * Used to type individual component configurations
 */
export type SlotComponentConfig<T = Record<string, any>> = T;

/**
 * Helper type to extract config type from a slot component
 */
export type ExtractSlotConfig<T> = T extends { config: infer C } ? C : never;