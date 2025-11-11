/**
 * Homepage Module - Zod Validation Schemas
 *
 * Schemas de validação para configuração da instância do módulo Homepage.
 *
 * @module homepage/utils/validateConfig
 */

import { z } from 'zod';
import type {
  HomepageConfig,
  AnimationConfig,
  BackgroundConfig,
  ThemeConfig,
  IntegrationConfig,
} from '../types';

// ========================================
// BASE SCHEMAS
// ========================================

/**
 * Schema de validação para AnimationConfig
 */
export const AnimationConfigSchema = z.object({
  enabled: z.boolean().default(true),
  intensity: z.enum(['subtle', 'normal', 'intense']).default('normal'),
  reducedMotion: z.boolean().default(true),
});

/**
 * Schema de validação para BackgroundConfig
 */
export const BackgroundConfigSchema = z.object({
  type: z.enum(['grid', 'novatrix', 'hacker', 'solid']).default('grid'),
  opacity: z.number().min(0).max(1).default(0.1),
});

/**
 * Schema de validação para ThemeConfig
 */
export const ThemeConfigSchema = z.object({
  brandColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color'),
  accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color'),
  heroGradient: z.string().optional(),
});

/**
 * Schema de validação para IntegrationConfig
 */
export const IntegrationConfigSchema = z.object({
  auth: z.object({
    showLoginButton: z.boolean().default(true),
    showSignupButton: z.boolean().default(true),
    redirectAfterLogin: z.string().optional(),
  }),
});

// ========================================
// ITEM SCHEMAS
// ========================================

/**
 * Schema de validação para CTAButton
 */
export const CTAButtonSchema = z.object({
  label: z.string().min(1, 'Button label is required'),
  action: z.enum(['signup', 'login', 'scroll-to', 'link', 'external']),
  target: z.string().optional(),
  url: z.string().url().optional(),
  variant: z.enum(['shiny', 'default', 'outline', 'ghost']).default('default'),
  icon: z.string().optional(),
});

/**
 * Schema de validação para FeatureItem
 */
export const FeatureItemSchema = z.object({
  icon: z.string().min(1, 'Icon name is required'),
  badge: z.string().optional(),
  badgeAnimated: z.boolean().default(true),
  title: z.string().min(1, 'Title is required'),
  titleAnimation: z
    .enum(['blur-in', 'pull-up', 'fade', 'gradual-spacing', 'none'])
    .default('pull-up'),
  description: z.string().min(1, 'Description is required'),
  backContent: z.string().optional(),
});

/**
 * Schema de validação para PortalItem
 */
export const PortalItemSchema = z.object({
  portalId: z.string().min(1, 'Portal ID is required'),
  highlight: z.boolean().default(false),
  description: z.string().optional(),
  customTitle: z.string().optional(),
  screenshot: z.string().url().optional(),
});

// ========================================
// SECTION SCHEMAS
// ========================================

/**
 * Schema de validação para HeroSectionConfig
 */
export const HeroSectionConfigSchema = z.object({
  type: z.literal('hero'),
  enabled: z.boolean(),
  layout: z.enum(['centered', 'split']).default('centered'),
  title: z.object({
    text: z.string().min(1, 'Title is required'),
    animation: z
      .enum(['blur-in', 'pull-up', 'fade', 'gradual-spacing'])
      .default('blur-in'),
  }),
  subtitle: z.object({
    text: z.string().min(1, 'Subtitle is required'),
    animation: z
      .enum(['blur-in', 'pull-up', 'fade', 'gradual-spacing'])
      .default('fade'),
  }),
  backgroundEffect: z.enum(['grid', 'none']).optional(),
  backgroundImage: z.string().url().optional(),
  ctaButtons: z.array(CTAButtonSchema).min(1).max(3),
});

/**
 * Schema de validação para FeaturesSectionConfig
 */
export const FeaturesSectionConfigSchema = z.object({
  type: z.literal('features'),
  enabled: z.boolean(),
  title: z.string().min(1, 'Section title is required'),
  animation: z.enum(['animated-list', 'fade-in', 'none']).default('animated-list'),
  columns: z.union([z.literal(2), z.literal(3), z.literal(4)]).default(3),
  cardEffect: z.enum(['flip-hover', 'hover-lift', 'none']).default('flip-hover'),
  items: z.array(FeatureItemSchema).min(1, 'At least one feature is required'),
});

/**
 * Schema de validação para PortalsSectionConfig
 */
export const PortalsSectionConfigSchema = z.object({
  type: z.literal('portals'),
  enabled: z.boolean(),
  title: z.string().min(1, 'Section title is required'),
  layout: z.enum(['grid', 'orbit']).default('grid'),
  animation: z.enum(['fade-in', 'animated-list', 'none']).default('fade-in'),
  cardEffect: z.enum(['flip-hover', 'hover-lift', 'none']).default('flip-hover'),
  portals: z.array(PortalItemSchema).min(1, 'At least one portal is required'),
});

/**
 * Schema de validação para CTASectionConfig
 */
export const CTASectionConfigSchema = z.object({
  type: z.literal('cta'),
  enabled: z.boolean(),
  title: z.string().min(1, 'Title is required'),
  titleAnimation: z.enum(['blur-in', 'pull-up', 'fade', 'gradual-spacing']).default('fade'),
  description: z.string().min(1, 'Description is required'),
  backgroundEffect: z.enum(['ripple', 'none']).default('ripple'),
  primaryButton: CTAButtonSchema,
  secondaryButton: CTAButtonSchema.optional(),
});

/**
 * Schema de validação para SectionConfig (discriminated union)
 */
export const SectionConfigSchema = z.discriminatedUnion('type', [
  HeroSectionConfigSchema,
  FeaturesSectionConfigSchema,
  PortalsSectionConfigSchema,
  CTASectionConfigSchema,
]);

// ========================================
// MAIN CONFIG SCHEMA
// ========================================

/**
 * Schema principal de validação para HomepageConfig
 */
export const HomepageConfigSchema = z
  .object({
    route: z.string().min(1, 'Route is required').default('/'),
    animations: AnimationConfigSchema.optional(),
    background: BackgroundConfigSchema.optional(),
    sections: z.array(SectionConfigSchema).min(1, 'At least one section is required'),
    theme: ThemeConfigSchema.optional(),
    integrations: IntegrationConfigSchema.optional(),
  })
  .refine(
    (config) => {
      // Ensure if Hero is enabled, it's first
      const heroIndex = config.sections.findIndex((s) => s.type === 'hero' && s.enabled);
      if (heroIndex > 0) {
        return false;
      }
      return true;
    },
    {
      message: 'Hero section must be first if enabled',
    }
  );

// ========================================
// VALIDATION FUNCTIONS
// ========================================

/**
 * Valida configuração da homepage
 *
 * @param config - Configuração a validar
 * @returns Objeto com resultado da validação
 */
export function validateHomepageConfig(config: unknown) {
  const result = HomepageConfigSchema.safeParse(config);

  if (!result.success) {
    return {
      valid: false as const,
      errors: result.error.issues,
      config: null,
    };
  }

  return {
    valid: true as const,
    errors: [],
    config: result.data,
  };
}

/**
 * Valida e retorna config ou lança erro
 *
 * @param config - Configuração a validar
 * @returns Config validada
 * @throws ZodError se inválida
 */
export function parseHomepageConfig(config: unknown) {
  return HomepageConfigSchema.parse(config);
}

/**
 * Valida seção específica
 *
 * @param section - Seção a validar
 * @returns Objeto com resultado da validação
 */
export function validateSection(section: unknown) {
  const result = SectionConfigSchema.safeParse(section);

  return {
    valid: result.success,
    errors: result.success ? [] : result.error.issues,
    section: result.success ? result.data : null,
  };
}

// ========================================
// DEFAULT VALUES
// ========================================

/**
 * Configuração padrão de animações
 */
export const DEFAULT_ANIMATION_CONFIG: AnimationConfig = {
  enabled: true,
  intensity: 'normal',
  reducedMotion: true,
};

/**
 * Configuração padrão de background
 */
export const DEFAULT_BACKGROUND_CONFIG: BackgroundConfig = {
  type: 'grid',
  opacity: 0.1,
};

/**
 * Configuração padrão de tema
 */
export const DEFAULT_THEME_CONFIG: ThemeConfig = {
  brandColor: '#4F46E5', // Indigo-600
  accentColor: '#10B981', // Green-500
};

/**
 * Configuração padrão de integrações
 */
export const DEFAULT_INTEGRATION_CONFIG: IntegrationConfig = {
  auth: {
    showLoginButton: true,
    showSignupButton: true,
  },
};

/**
 * Gera configuração padrão completa
 *
 * @returns Configuração padrão da homepage
 */
export function getDefaultHomepageConfig(): HomepageConfig {
  return {
    route: '/',
    animations: DEFAULT_ANIMATION_CONFIG,
    background: DEFAULT_BACKGROUND_CONFIG,
    sections: [],
    theme: DEFAULT_THEME_CONFIG,
    integrations: DEFAULT_INTEGRATION_CONFIG,
  };
}
