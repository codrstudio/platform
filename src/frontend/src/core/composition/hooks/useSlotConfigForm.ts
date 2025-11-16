/**
 * Hook for managing slot configuration forms
 *
 * Provides access to the SlotConfigFormRegistry and utilities
 * for working with slot component configurations.
 */

import { useMemo, useCallback } from 'react';
import { slotConfigFormRegistry } from '../SlotConfigFormRegistry';
import type { SlotComponentConfig, SlotConfigFormMetadata } from '../SlotConfigFormRegistry';
import type { SlotType } from '../types';

/**
 * Hook to access and manage slot configuration forms
 */
export function useSlotConfigForm(componentId?: string) {
  /**
   * Get configuration form metadata for a specific component
   */
  const formMetadata = useMemo(() => {
    if (!componentId) return undefined;
    return slotConfigFormRegistry.getForm(componentId);
  }, [componentId]);

  /**
   * Check if component has a configuration form
   */
  const hasConfigForm = useMemo(() => {
    if (!componentId) return false;
    return slotConfigFormRegistry.hasForm(componentId);
  }, [componentId]);

  /**
   * Get default configuration for the component
   */
  const defaultConfig = useMemo(() => {
    if (!componentId) return undefined;
    return slotConfigFormRegistry.getDefaults(componentId);
  }, [componentId]);

  /**
   * Validate configuration using component's schema
   */
  const validateConfig = useCallback(
    (config: SlotComponentConfig) => {
      if (!componentId) {
        return { valid: true };
      }
      return slotConfigFormRegistry.validateConfig(componentId, config);
    },
    [componentId]
  );

  /**
   * Get all forms for a specific slot type
   */
  const getFormsBySlot = useCallback((slotType: SlotType) => {
    return slotConfigFormRegistry.getBySlot(slotType);
  }, []);

  /**
   * Get all registered forms
   */
  const getAllForms = useCallback(() => {
    return slotConfigFormRegistry.getAll();
  }, []);

  return {
    formMetadata,
    hasConfigForm,
    defaultConfig,
    validateConfig,
    getFormsBySlot,
    getAllForms,
    FormComponent: formMetadata?.formComponent,
    schema: formMetadata?.schema,
  };
}

/**
 * Hook to get all available configuration forms for a slot type
 */
export function useSlotConfigForms(slotType?: SlotType) {
  /**
   * Get all forms for the specified slot type
   */
  const forms = useMemo(() => {
    if (!slotType) {
      return slotConfigFormRegistry.getAll();
    }
    return slotConfigFormRegistry.getBySlot(slotType);
  }, [slotType]);

  /**
   * Get form metadata by component ID
   */
  const getForm = useCallback((componentId: string) => {
    return slotConfigFormRegistry.getForm(componentId);
  }, []);

  /**
   * Check if a component has a form
   */
  const hasForm = useCallback((componentId: string) => {
    return slotConfigFormRegistry.hasForm(componentId);
  }, []);

  return {
    forms,
    getForm,
    hasForm,
  };
}

/**
 * Hook to manage configuration state for a slot component
 */
export function useSlotConfig<T extends SlotComponentConfig = SlotComponentConfig>(
  componentId: string,
  initialConfig?: T
) {
  const { defaultConfig, validateConfig } = useSlotConfigForm(componentId);

  /**
   * Merge initial config with defaults
   */
  const mergedConfig = useMemo(() => {
    return {
      ...defaultConfig,
      ...initialConfig,
    } as T;
  }, [defaultConfig, initialConfig]);

  /**
   * Validate the current configuration
   */
  const validate = useCallback(
    (config: T) => {
      return validateConfig(config);
    },
    [validateConfig]
  );

  return {
    config: mergedConfig,
    validate,
  };
}