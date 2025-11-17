/**
 * Homepage Module - Type Validation
 *
 * Runtime validation using Zod for configuration safety
 */

import { z } from 'zod';

// ============================================================================
// Link Validation Schemas
// ============================================================================

const RelativeLinkSchema = z.object({
  type: z.literal('relative'),
  route: z.string(),
  target: z.enum(['_self', '_blank']).optional(),
});

const PortalLinkSchema = z.object({
  type: z.literal('portal'),
  portal: z.string(),
  route: z.string(),
  target: z.enum(['_self', '_blank']).optional(),
});

const ExternalLinkSchema = z.object({
  type: z.literal('external'),
  url: z.string().url(),
  target: z.enum(['_blank', '_self']).optional(),
});

export const LinkConfigSchema = z.union([
  RelativeLinkSchema,
  PortalLinkSchema,
  ExternalLinkSchema,
]);

// ============================================================================
// Datasource Validation Schemas
// ============================================================================

const JQELQuerySchema = z.object({
  schema: z.string(),
  select: z.string(),
  where: z.record(z.any()).optional(),
  options: z.object({
    limit: z.number().optional(),
    offset: z.number().optional(),
    orderBy: z.array(z.object({
      field: z.string(),
      direction: z.enum(['asc', 'desc']),
    })).optional(),
  }).optional(),
  output: z.array(z.string()).optional(),
  except: z.array(z.string()).optional(),
});

const TemplateMappingSchema = z.record(z.string());

export const DatasourceConfigSchema = z.object({
  type: z.enum(['jqel', 'static']),
  query: JQELQuerySchema.optional(),
  mapping: TemplateMappingSchema.optional(),
  multiple: z.boolean().optional(),
  limit: z.number().optional(),
});

// ============================================================================
// Common Validation Schemas
// ============================================================================

const BackgroundConfigSchema = z.object({
  type: z.enum(['solid', 'gradient', 'transparent', 'image', 'grid', 'novatrix', 'hacker']),
  opacity: z.number().min(0).max(1).optional(),
  color: z.string().optional(),
  gradient: z.object({
    from: z.string(),
    to: z.string(),
    direction: z.enum(['to-r', 'to-l', 'to-t', 'to-b', 'to-tr', 'to-tl', 'to-br', 'to-bl']),
  }).optional(),
  image: z.object({
    url: z.string(),
    overlay: z.boolean().optional(),
    overlayOpacity: z.number().min(0).max(1).optional(),
  }).optional(),
  className: z.string().optional(),
});

const AnimationConfigSchema = z.object({
  enabled: z.boolean(),
  intensity: z.enum(['subtle', 'normal', 'intense', 'dramatic']).optional(),
  reducedMotion: z.boolean().optional(),
  type: z.enum([
    'blur-in', 'pull-up', 'fade', 'gradual-spacing',
    'slideUp', 'slideDown', 'scale', 'none'
  ]).optional(),
  duration: z.number().optional(),
  delay: z.number().optional(),
  stagger: z.boolean().optional(),
});

// ============================================================================
// Section Validation Schemas
// ============================================================================

const BaseSectionSchema = z.object({
  type: z.string(),
  enabled: z.boolean(),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  animation: z.union([
    AnimationConfigSchema,
    z.enum(['animated-list', 'fade-in', 'none']),
  ]).optional(),
  className: z.string().optional(),
});

const CTAButtonSchema = z.object({
  label: z.string(),
  action: z.enum(['signup', 'login', 'scroll-to', 'link', 'external']).optional(),
  target: z.string().optional(),
  url: z.string().optional(),
  link: LinkConfigSchema.optional(),
  variant: z.enum(['shiny', 'default', 'outline', 'ghost', 'destructive', 'secondary']).optional(),
  icon: z.string().optional(),
  size: z.enum(['sm', 'md', 'lg']).optional(),
});

const HeroSectionSchema = BaseSectionSchema.extend({
  type: z.literal('hero'),
  layout: z.enum(['centered', 'split']).optional(),
  description: z.string().optional(),
  backgroundEffect: z.union([
    z.enum(['grid', 'none']),
    BackgroundConfigSchema,
  ]).optional(),
  backgroundImage: z.string().optional(),
  background: BackgroundConfigSchema.optional(),
  ctaButtons: z.array(CTAButtonSchema).optional(),
  cta: z.object({
    primary: CTAButtonSchema.optional(),
    secondary: CTAButtonSchema.optional(),
  }).optional(),
  image: z.object({
    src: z.string(),
    alt: z.string().optional(),
    position: z.enum(['left', 'right', 'center']).optional(),
  }).optional(),
});

const FeatureItemSchema = z.object({
  icon: z.string().optional(),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  badge: z.string().optional(),
  badgeAnimated: z.boolean().optional(),
  titleAnimation: z.union([
    z.enum(['blur-in', 'pull-up', 'fade', 'gradual-spacing', 'none']),
  ]).optional(),
  backContent: z.string().optional(),
  link: LinkConfigSchema.optional(),
  datasource: DatasourceConfigSchema.optional(),
  hover: z.enum(['lift', 'glow', 'border', 'none']).optional(),
  className: z.string().optional(),
});

const FeaturesSectionSchema = BaseSectionSchema.extend({
  type: z.enum(['features', 'cards']),
  columns: z.union([
    z.literal(1), z.literal(2), z.literal(3),
    z.literal(4), z.literal(5), z.literal(6)
  ]).optional(),
  gap: z.enum(['sm', 'md', 'lg', 'xl']).optional(),
  cardEffect: z.enum(['flip-hover', 'hover-lift', 'none', 'glow', 'border']).optional(),
  items: z.array(FeatureItemSchema),
  cardVariant: z.enum(['default', 'bordered', 'ghost', 'elevated']).optional(),
});

const PortalItemSchema = z.object({
  portalId: z.string(),
  highlight: z.boolean().optional(),
  description: z.string().optional(),
  customTitle: z.string().optional(),
  screenshot: z.string().optional(),
  link: LinkConfigSchema.optional(),
});

const PortalsSectionSchema = BaseSectionSchema.extend({
  type: z.literal('portals'),
  layout: z.enum(['grid', 'orbit', 'list']).optional(),
  cardEffect: z.enum(['flip-hover', 'hover-lift', 'none', 'glow', 'border']).optional(),
  portals: z.array(PortalItemSchema),
  columns: z.union([
    z.literal(2), z.literal(3), z.literal(4)
  ]).optional(),
});

const QuickLinkItemSchema = z.object({
  icon: z.string().optional(),
  label: z.string(),
  description: z.string().optional(),
  link: LinkConfigSchema,
  badge: z.string().optional(),
});

const QuickLinksSectionSchema = BaseSectionSchema.extend({
  type: z.literal('quickLinks'),
  layout: z.enum(['horizontal', 'vertical', 'grid']).optional(),
  items: z.array(QuickLinkItemSchema),
  showIcons: z.boolean().optional(),
  showDescriptions: z.boolean().optional(),
  columns: z.union([
    z.literal(2), z.literal(3), z.literal(4), z.literal(6)
  ]).optional(),
});

const StatItemSchema = z.object({
  value: z.union([z.number(), z.string()]),
  label: z.string(),
  prefix: z.string().optional(),
  suffix: z.string().optional(),
  icon: z.string().optional(),
  description: z.string().optional(),
  trend: z.object({
    value: z.number(),
    direction: z.enum(['up', 'down']),
  }).optional(),
  datasource: DatasourceConfigSchema.optional(),
});

const StatsSectionSchema = BaseSectionSchema.extend({
  type: z.literal('stats'),
  columns: z.union([
    z.literal(2), z.literal(3), z.literal(4)
  ]).optional(),
  items: z.array(StatItemSchema),
  showAnimation: z.boolean().optional(),
  background: BackgroundConfigSchema.optional(),
});

const FAQItemSchema = z.object({
  question: z.string(),
  answer: z.string(),
  category: z.string().optional(),
});

const FAQSectionSchema = BaseSectionSchema.extend({
  type: z.literal('faq'),
  items: z.array(FAQItemSchema),
  layout: z.enum(['accordion', 'cards']).optional(),
  searchable: z.boolean().optional(),
  allowMultiple: z.boolean().optional(),
  showCategories: z.boolean().optional(),
});

const NewsletterSectionSchema = BaseSectionSchema.extend({
  type: z.literal('newsletter'),
  description: z.string().optional(),
  placeholder: z.string().optional(),
  buttonText: z.string().optional(),
  layout: z.enum(['inline', 'stacked', 'card']).optional(),
  incentive: z.string().optional(),
  showPrivacy: z.boolean().optional(),
  endpoint: z.string().optional(),
  background: BackgroundConfigSchema.optional(),
});

const FooterLinkGroupSchema = z.object({
  title: z.string(),
  links: z.array(z.object({
    label: z.string(),
    link: LinkConfigSchema,
  })),
});

const FooterSectionSchema = BaseSectionSchema.extend({
  type: z.literal('footer'),
  logo: z.object({
    src: z.string(),
    alt: z.string().optional(),
    href: LinkConfigSchema.optional(),
  }).optional(),
  description: z.string().optional(),
  linkGroups: z.array(FooterLinkGroupSchema).optional(),
  socialLinks: z.array(z.object({
    platform: z.enum(['twitter', 'facebook', 'linkedin', 'github', 'instagram', 'youtube']),
    url: z.string().url(),
  })).optional(),
  copyright: z.string().optional(),
  showNewsletter: z.boolean().optional(),
  background: BackgroundConfigSchema.optional(),
});

const CTASectionSchema = BaseSectionSchema.extend({
  type: z.literal('cta'),
  description: z.string().optional(),
  titleAnimation: z.enum([
    'blur-in', 'pull-up', 'fade', 'gradual-spacing'
  ]).optional(),
  backgroundEffect: z.enum(['ripple', 'none']).optional(),
  background: BackgroundConfigSchema.optional(),
  primaryButton: CTAButtonSchema.optional(),
  secondaryButton: CTAButtonSchema.optional(),
  buttons: z.array(CTAButtonSchema).optional(),
  centered: z.boolean().optional(),
});

// ============================================================================
// Main Configuration Schema
// ============================================================================

export const SectionConfigSchema = z.union([
  HeroSectionSchema,
  FeaturesSectionSchema,
  PortalsSectionSchema,
  QuickLinksSectionSchema,
  StatsSectionSchema,
  FAQSectionSchema,
  NewsletterSectionSchema,
  FooterSectionSchema,
  CTASectionSchema,
]);

export const HomepageConfigSchema = z.object({
  route: z.string(),
  animations: z.union([
    AnimationConfigSchema,
    z.object({
      enabled: z.boolean(),
      intensity: z.enum(['subtle', 'normal', 'intense', 'dramatic']).optional(),
      reducedMotion: z.boolean().optional(),
    }),
  ]).optional(),
  background: BackgroundConfigSchema.optional(),
  theme: z.object({
    brandColor: z.string().optional(),
    accentColor: z.string().optional(),
    heroGradient: z.string().optional(),
    mode: z.enum(['light', 'dark', 'system']).optional(),
    primaryColor: z.string().optional(),
  }).optional(),
  sections: z.array(SectionConfigSchema),
  integrations: z.object({
    auth: z.object({
      showLoginButton: z.boolean().optional(),
      showSignupButton: z.boolean().optional(),
      redirectAfterLogin: z.string().optional(),
    }).optional(),
  }).optional(),
  seo: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    keywords: z.array(z.string()).optional(),
    ogImage: z.string().optional(),
  }).optional(),
  analytics: z.object({
    enabled: z.boolean(),
    trackingId: z.string().optional(),
  }).optional(),
});

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Validate homepage configuration
 */
export function validateHomepageConfig(config: unknown): {
  valid: boolean;
  data?: z.infer<typeof HomepageConfigSchema>;
  errors?: z.ZodError;
} {
  const result = HomepageConfigSchema.safeParse(config);

  if (result.success) {
    return { valid: true, data: result.data };
  }

  return { valid: false, errors: result.error };
}

/**
 * Validate datasource configuration
 */
export function validateDatasourceConfig(config: unknown): {
  valid: boolean;
  data?: z.infer<typeof DatasourceConfigSchema>;
  errors?: z.ZodError;
} {
  const result = DatasourceConfigSchema.safeParse(config);

  if (result.success) {
    return { valid: true, data: result.data };
  }

  return { valid: false, errors: result.error };
}

/**
 * Validate allowed schemas for security
 */
export function validateAllowedSchema(schema: string): boolean {
  const ALLOWED_SCHEMAS = ['system', 'public', 'content', 'homepage'];
  return ALLOWED_SCHEMAS.includes(schema);
}