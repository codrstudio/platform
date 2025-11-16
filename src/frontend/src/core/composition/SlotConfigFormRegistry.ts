/**
 * SlotConfigForm Registry - Central management for slot configuration forms
 *
 * DESIGN Reference: DES-ARCH-002
 *
 * Registry for managing configuration forms associated with slot components.
 * Allows modules to register forms that can be used to configure slot components.
 */

import type { ComponentType } from 'react';
import type { SlotType } from './types';
import { z } from 'zod';

/**
 * Configuration object for slot components
 * Can contain any key-value pairs specific to the component
 */
export interface SlotComponentConfig {
  [key: string]: any;
}

/**
 * Props passed to slot configuration form components
 * DESIGN Reference: DES-COMP-003
 */
export interface SlotConfigFormProps {
  /** Type of slot this component belongs to */
  slotType: SlotType;

  /** ID of the component being configured */
  componentId: string;

  /** Current configuration values */
  config: SlotComponentConfig;

  /** Callback when configuration changes */
  onChange: (config: SlotComponentConfig) => void;
}

/**
 * Metadata for a slot configuration form
 */
export interface SlotConfigFormMetadata {
  /** ID of the component this form configures */
  componentId: string;

  /** Type of slot this component belongs to */
  slotType: SlotType;

  /** React component that renders the configuration form */
  formComponent: ComponentType<SlotConfigFormProps>;

  /** Optional Zod schema for validation */
  schema?: z.ZodSchema;

  /** Default configuration values */
  defaults?: SlotComponentConfig;

  /** Human-readable name for the form */
  name?: string;

  /** Description of what can be configured */
  description?: string;
}

/**
 * Registry for slot configuration forms
 *
 * Manages registration and discovery of configuration forms
 * for slot components across all modules.
 */
class SlotConfigFormRegistry {
  private forms = new Map<string, SlotConfigFormMetadata>();

  /**
   * Register a configuration form for a slot component
   */
  register(metadata: SlotConfigFormMetadata): void {
    const { componentId } = metadata;

    if (this.forms.has(componentId)) {
      console.warn(
        `[SlotConfigFormRegistry] Form for component "${componentId}" is already registered. Overwriting.`
      );
    }

    this.forms.set(componentId, metadata);

    if (import.meta.env.DEV) {
      console.log(
        `[SlotConfigFormRegistry] Registered config form for component: ${componentId}`
      );
    }
  }

  /**
   * Get configuration form metadata for a component
   */
  getForm(componentId: string): SlotConfigFormMetadata | undefined {
    return this.forms.get(componentId);
  }

  /**
   * Get all registered configuration forms
   */
  getAll(): SlotConfigFormMetadata[] {
    return Array.from(this.forms.values());
  }

  /**
   * Get configuration forms by slot type
   */
  getBySlot(slotType: SlotType): SlotConfigFormMetadata[] {
    return Array.from(this.forms.values()).filter(
      (form) => form.slotType === slotType
    );
  }

  /**
   * Check if a component has a configuration form
   */
  hasForm(componentId: string): boolean {
    return this.forms.has(componentId);
  }

  /**
   * Unregister a configuration form
   */
  unregister(componentId: string): boolean {
    const deleted = this.forms.delete(componentId);

    if (deleted && import.meta.env.DEV) {
      console.log(
        `[SlotConfigFormRegistry] Unregistered config form for component: ${componentId}`
      );
    }

    return deleted;
  }

  /**
   * Clear all registered forms
   */
  clear(): void {
    this.forms.clear();

    if (import.meta.env.DEV) {
      console.log('[SlotConfigFormRegistry] All config forms cleared');
    }
  }

  /**
   * Validate configuration using component's schema
   */
  validateConfig(
    componentId: string,
    config: SlotComponentConfig
  ): { valid: boolean; errors?: z.ZodError } {
    const form = this.forms.get(componentId);

    if (!form?.schema) {
      return { valid: true };
    }

    try {
      form.schema.parse(config);
      return { valid: true };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { valid: false, errors: error };
      }
      throw error;
    }
  }

  /**
   * Get default configuration for a component
   */
  getDefaults(componentId: string): SlotComponentConfig | undefined {
    return this.forms.get(componentId)?.defaults;
  }
}

// Singleton instance
export const slotConfigFormRegistry = new SlotConfigFormRegistry();