/**
 * Zod schemas for composition validation
 *
 * Provides validation schemas for compositions and related data structures.
 */

import { z } from 'zod';

/**
 * Layout width validation
 */
export const LayoutWidthSchema = z.enum(['full', 'lg', 'md', 'sm']);

/**
 * Slot type validation
 */
export const SlotTypeSchema = z.enum(['navbar', 'sidebar', 'companion', 'breadcrumb', 'footer']);

/**
 * Slots configuration validation
 */
export const SlotsConfigSchema = z.object({
  navbar: z.boolean().optional(),
  sidebar: z.boolean().optional(),
  companion: z.boolean().optional(),
  breadcrumb: z.boolean().optional(),
  desktop: z.literal(true),
  footer: z.boolean().optional(),
}).refine(
  (slots) => {
    // At least desktop must be true (which it always is)
    return slots.desktop === true;
  },
  {
    message: 'Desktop slot must always be active',
  }
);

/**
 * Component assignments validation
 */
export const ComponentsConfigSchema = z.object({
  navbar: z.string().optional(),
  sidebar: z.string().optional(),
  companion: z.string().optional(),
  breadcrumb: z.string().optional(),
  footer: z.string().optional(),
});

/**
 * Slot configuration validation
 * Allows any configuration object for flexibility
 */
export const SlotConfigSchema = z.record(z.string(), z.any());

/**
 * Single slot config validation
 */
export const SingleSlotConfigSchema = z.record(z.string(), z.any());

/**
 * Base composition validation (without slotConfigs)
 */
export const BaseCompositionSchema = z.object({
  id: z.string()
    .min(1, 'Composition ID is required')
    .regex(/^[a-z0-9-]+$/, 'ID must contain only lowercase letters, numbers, and hyphens'),

  name: z.string()
    .min(1, 'Composition name is required')
    .max(100, 'Composition name must not exceed 100 characters'),

  providedBy: z.string()
    .min(1, 'Provider is required'),

  slots: SlotsConfigSchema,

  components: ComponentsConfigSchema,

  layout: z.object({
    width: LayoutWidthSchema,
  }),

  metadata: z.record(z.string(), z.any()).optional(),
});

/**
 * Extended composition validation (with slotConfigs)
 * DESIGN Reference: DES-ARCH-003
 */
export const CompositionWithConfigsSchema = BaseCompositionSchema.extend({
  slotConfigs: z.record(z.string(), SingleSlotConfigSchema).optional(),
});

/**
 * Composition editor state validation
 */
export const CompositionEditorStateSchema = z.object({
  compositionId: z.string(),
  name: z.string(),
  description: z.string().optional(),
  slots: SlotsConfigSchema,
  components: ComponentsConfigSchema,
  slotConfigs: z.record(z.string(), SingleSlotConfigSchema),
  layout: z.object({
    width: LayoutWidthSchema,
  }),
  providedBy: z.string(),
  hasChanges: z.boolean().optional(),
  isSaving: z.boolean().optional(),
  errors: z.record(z.string(), z.string()).optional(),
});

/**
 * Validate that components match active slots
 */
export const validateComponentSlotAlignment = (
  slots: z.infer<typeof SlotsConfigSchema>,
  components: z.infer<typeof ComponentsConfigSchema>
) => {
  const errors: string[] = [];

  // Check navbar
  if (!slots.navbar && components.navbar) {
    errors.push('Navbar component assigned but slot is not active');
  }

  // Check sidebar
  if (!slots.sidebar && components.sidebar) {
    errors.push('Sidebar component assigned but slot is not active');
  }

  // Check companion
  if (!slots.companion && components.companion) {
    errors.push('Companion component assigned but slot is not active');
  }

  // Check breadcrumb
  if (!slots.breadcrumb && components.breadcrumb) {
    errors.push('Breadcrumb component assigned but slot is not active');
  }

  // Check footer
  if (!slots.footer && components.footer) {
    errors.push('Footer component assigned but slot is not active');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Create default composition
 */
export function createDefaultComposition(portalId: string): z.infer<typeof CompositionWithConfigsSchema> {
  return {
    id: `${portalId}-custom-${Date.now()}`,
    name: 'New Composition',
    providedBy: `portal:${portalId}`,
    slots: {
      desktop: true,
      breadcrumb: true,
    },
    components: {
      breadcrumb: 'portal-breadcrumb',
    },
    layout: {
      width: 'md',
    },
    slotConfigs: {},
  };
}

/**
 * Validate composition
 */
export function validateComposition(
  composition: unknown
): { valid: boolean; errors?: z.ZodError } {
  try {
    const parsed = CompositionWithConfigsSchema.parse(composition);

    // Additional validation for component-slot alignment
    const alignmentCheck = validateComponentSlotAlignment(parsed.slots, parsed.components);

    if (!alignmentCheck.valid) {
      return {
        valid: false,
        errors: new z.ZodError(
          alignmentCheck.errors.map((message, index) => ({
            code: 'custom',
            message,
            path: ['components', index.toString()],
          }))
        ),
      };
    }

    return { valid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { valid: false, errors: error };
    }
    throw error;
  }
}

// Type exports
export type LayoutWidth = z.infer<typeof LayoutWidthSchema>;
export type SlotType = z.infer<typeof SlotTypeSchema>;
export type SlotsConfig = z.infer<typeof SlotsConfigSchema>;
export type ComponentsConfig = z.infer<typeof ComponentsConfigSchema>;
export type CompositionWithConfigs = z.infer<typeof CompositionWithConfigsSchema>;
export type CompositionEditorState = z.infer<typeof CompositionEditorStateSchema>;