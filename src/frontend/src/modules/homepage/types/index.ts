/**
 * Homepage Module - TypeScript Type Definitions
 *
 * Centraliza todas as type definitions do módulo Homepage.
 *
 * @module homepage/types
 */

import { z } from 'zod';
import type {
  LinkConfigSchema,
  DatasourceConfigSchema,
  HomepageConfigSchema,
  SectionConfigSchema,
} from './validation';

// ========================================
// INFERRED TYPES FROM ZOD SCHEMAS
// ========================================

/**
 * Link configuration types (inferred from Zod)
 */
export type LinkConfig = z.infer<typeof LinkConfigSchema>;

export type RelativeLinkConfig = Extract<LinkConfig, { type: 'relative' }>;
export type PortalLinkConfig = Extract<LinkConfig, { type: 'portal' }>;
export type ExternalLinkConfig = Extract<LinkConfig, { type: 'external' }>;

/**
 * Datasource configuration (inferred from Zod)
 */
export type DatasourceConfig = z.infer<typeof DatasourceConfigSchema>;

/**
 * Section configuration (inferred from Zod)
 */
export type SectionConfig = z.infer<typeof SectionConfigSchema>;

export type HeroSectionConfig = Extract<SectionConfig, { type: 'hero' }>;
export type CardsSectionConfig = Extract<SectionConfig, { type: 'cards' | 'features' }>;
export type QuickLinksSectionConfig = Extract<SectionConfig, { type: 'quickLinks' }>;
export type StatsSectionConfig = Extract<SectionConfig, { type: 'stats' }>;
export type FAQSectionConfig = Extract<SectionConfig, { type: 'faq' }>;
export type NewsletterSectionConfig = Extract<SectionConfig, { type: 'newsletter' }>;
export type FooterSectionConfig = Extract<SectionConfig, { type: 'footer' }>;
export type CTASectionConfig = Extract<SectionConfig, { type: 'cta' }>;

/**
 * Full homepage configuration (inferred from Zod)
 */
export type HomepageConfig = z.infer<typeof HomepageConfigSchema>;

// ========================================
// BASIC CONFIG (for simple form)
// ========================================

/**
 * Basic configuration for homepage instance
 * Used in simple ConfigForm (route, title, enabled)
 * Full visual config stored in external file
 */
export interface HomepageBasicConfig {
  /** Page route (e.g., "/", "/home") */
  route: string;

  /** Page title (for browser tab and SEO) */
  title?: string;

  /** Enable/disable the page */
  enabled: boolean;
}

// ========================================
// UTILITY TYPES
// ========================================

/**
 * Intensidade das animações
 */
export type AnimationIntensity = 'subtle' | 'normal' | 'intense';

/**
 * Tipo de animação de texto
 */
export type AnimationType = 'blur-in' | 'pull-up' | 'fade' | 'gradual-spacing';

/**
 * Tipo de background animado
 */
export type BackgroundType = 'grid' | 'novatrix' | 'hacker' | 'solid';

/**
 * Tipo de layout da seção
 */
export type LayoutType = 'centered' | 'split';

/**
 * Efeito de card
 */
export type CardEffect = 'flip-hover' | 'hover-lift' | 'none';

// ========================================
// CONFIG TYPES
// ========================================

/**
 * Configurações de animação global
 */
export interface AnimationConfig {
  /** Master switch - habilita/desabilita todas as animações */
  enabled: boolean;

  /** Intensidade das animações */
  intensity: AnimationIntensity;

  /** Auto-disable em prefers-reduced-motion */
  reducedMotion: boolean;
}

/**
 * Configuração de background da página
 */
export interface BackgroundConfig {
  /** Tipo de background animado */
  type: BackgroundType;

  /** Opacidade do efeito (0.0 a 1.0) */
  opacity: number;
}

/**
 * Customizações de tema específicas da homepage
 */
export interface ThemeConfig {
  /** Cor primária da marca (hex) */
  brandColor: string;

  /** Cor de acento (hex) */
  accentColor: string;

  /** Classes de gradiente Tailwind para hero */
  heroGradient?: string;
}

/**
 * Configurações de integração com outros módulos
 */
export interface IntegrationConfig {
  auth: {
    showLoginButton: boolean;
    showSignupButton: boolean;
    redirectAfterLogin?: string;
  };
}

/**
 * Configuração completa da instância do módulo Homepage
 */
export interface HomepageConfig {
  /** Rota da página (ex: "/", "/home") */
  route: string;

  /** Configurações de animação */
  animations?: AnimationConfig;

  /** Configuração de background da página */
  background?: BackgroundConfig;

  /** Array de seções da homepage */
  sections: SectionConfig[];

  /** Customizações de tema */
  theme?: ThemeConfig;

  /** Integrações com outros módulos */
  integrations?: IntegrationConfig;
}

// ========================================
// ITEM TYPES
// ========================================

/**
 * Configuração de botão de CTA
 */
export interface CTAButton {
  /** Texto do botão */
  label: string;

  /** Ação ao clicar */
  action: 'signup' | 'login' | 'scroll-to' | 'link' | 'external';

  /** Target (usado por scroll-to e link) */
  target?: string;

  /** URL (usado por external) */
  url?: string;

  /** Variante visual do botão */
  variant: 'shiny' | 'default' | 'outline' | 'ghost';

  /** Nome do ícone Lucide (opcional) */
  icon?: string;
}

/**
 * Item de feature
 */
export interface FeatureItem {
  /** Nome do ícone Lucide */
  icon: string;

  /** Texto do badge (opcional) */
  badge?: string;

  /** Se badge deve ser animado */
  badgeAnimated: boolean;

  /** Título da feature */
  title: string;

  /** Animação do título */
  titleAnimation?: AnimationType | 'none';

  /** Descrição */
  description: string;

  /** Conteúdo do verso (para flip cards) */
  backContent?: string;
}

/**
 * Item de portal
 */
export interface PortalItem {
  /** ID do portal */
  portalId: string;

  /** Se deve ser destacado */
  highlight: boolean;

  /** Descrição customizada (override) */
  description?: string;

  /** Título customizado (override) */
  customTitle?: string;

  /** URL de screenshot do portal */
  screenshot?: string;
}

// ========================================
// SECTION TYPES
// ========================================

/**
 * Configuração base de todas as seções
 */
export interface BaseSectionConfig {
  /** Tipo da seção */
  type: 'hero' | 'features' | 'portals' | 'cta';

  /** Se a seção está habilitada */
  enabled: boolean;
}

/**
 * Configuração da Hero Section
 */
export interface HeroSectionConfig extends BaseSectionConfig {
  type: 'hero';

  /** Layout da seção */
  layout: LayoutType;

  /** Configuração do título */
  title: {
    text: string;
    animation: AnimationType;
  };

  /** Configuração do subtítulo */
  subtitle: {
    text: string;
    animation: AnimationType;
  };

  /** Efeito de background */
  backgroundEffect?: 'grid' | 'none';

  /** URL ou path da imagem de background */
  backgroundImage?: string;

  /** Botões de CTA */
  ctaButtons: CTAButton[];
}

/**
 * Configuração da Features Section
 */
export interface FeaturesSectionConfig extends BaseSectionConfig {
  type: 'features';

  /** Título da seção */
  title: string;

  /** Tipo de animação do container */
  animation: 'animated-list' | 'fade-in' | 'none';

  /** Número de colunas em desktop */
  columns: 2 | 3 | 4;

  /** Efeito dos cards */
  cardEffect: CardEffect;

  /** Lista de features */
  items: FeatureItem[];
}

/**
 * Configuração da Portals Section
 */
export interface PortalsSectionConfig extends BaseSectionConfig {
  type: 'portals';

  /** Título da seção */
  title: string;

  /** Layout da seção */
  layout: 'grid' | 'orbit';

  /** Tipo de animação */
  animation: 'fade-in' | 'animated-list' | 'none';

  /** Efeito dos cards */
  cardEffect: CardEffect;

  /** Lista de portais */
  portals: PortalItem[];
}

/**
 * Configuração da CTA Section
 */
export interface CTASectionConfig extends BaseSectionConfig {
  type: 'cta';

  /** Título da seção */
  title: string;

  /** Animação do título */
  titleAnimation: AnimationType;

  /** Descrição */
  description: string;

  /** Efeito de background */
  backgroundEffect: 'ripple' | 'none';

  /** Botão primário */
  primaryButton: CTAButton;

  /** Botão secundário (opcional) */
  secondaryButton?: CTAButton;
}

/**
 * Union type de todas as configurações de seção
 */
export type SectionConfig =
  | HeroSectionConfig
  | FeaturesSectionConfig
  | PortalsSectionConfig
  | CTASectionConfig;

// ========================================
// COMPONENT PROP TYPES
// ========================================

export interface HomePageProps {
  /** ID da instância (opcional, pode vir de route params) */
  instanceId?: string;
}

export interface HeroSectionProps {
  config: HeroSectionConfig;
}

export interface FeaturesSectionProps {
  config: FeaturesSectionConfig;
}

export interface PortalsSectionProps {
  config: PortalsSectionConfig;
}

export interface CTASectionProps {
  config: CTASectionConfig;
}

export interface AnimatedTextProps {
  text: string;
  type: AnimationType;
  className?: string;
  delay?: number;
}

export interface AnimatedBadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'secondary' | 'outline';
  className?: string;
}

export interface AnimatedCardProps {
  children: React.ReactNode;
  effect: CardEffect;
  backContent?: React.ReactNode;
  className?: string;
}

// ========================================
// PORTAL TYPE (from platform)
// ========================================

export interface Portal {
  portalId: string;
  name: string;
  description: string;
  icon: string;
  active: boolean;
  visibility: 'public' | 'private';
}

// ========================================
// HOOK RETURN TYPES
// ========================================

export interface UseHomepageConfigReturn {
  config: HomepageConfig | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

export interface UseScrollAnimationReturn<T extends HTMLElement = HTMLDivElement> {
  ref: React.RefObject<T>;
  isVisible: boolean;
  hasAnimated: boolean;
}

export interface UsePortalsListReturn {
  portals: Portal[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

// ========================================
// TYPE GUARDS
// ========================================

/**
 * Type guard para verificar se config é válida
 */
export function isValidHomepageConfig(
  config: unknown
): config is HomepageConfig {
  return (
    typeof config === 'object' &&
    config !== null &&
    'route' in config &&
    'sections' in config &&
    Array.isArray((config as HomepageConfig).sections)
  );
}

/**
 * Type guard para seção Hero
 */
export function isHeroSection(
  section: SectionConfig
): section is HeroSectionConfig {
  return section.type === 'hero';
}

/**
 * Type guard para seção Features
 */
export function isFeaturesSection(
  section: SectionConfig
): section is FeaturesSectionConfig {
  return section.type === 'features';
}

/**
 * Type guard para seção Portals
 */
export function isPortalsSection(
  section: SectionConfig
): section is PortalsSectionConfig {
  return section.type === 'portals';
}

/**
 * Type guard para seção CTA
 */
export function isCTASection(
  section: SectionConfig
): section is CTASectionConfig {
  return section.type === 'cta';
}

// ========================================
// UTILITY TYPES (ADVANCED)
// ========================================

/**
 * Torna todos os campos opcionais recursivamente
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Config parcial para updates
 */
export type PartialHomepageConfig = DeepPartial<HomepageConfig>;

/**
 * Extrai tipos de seção específicos
 */
export type ExtractSectionType<T extends SectionConfig['type']> = Extract<
  SectionConfig,
  { type: T }
>;

// Exemplos de uso:
// type Hero = ExtractSectionType<'hero'>; // HeroSectionConfig
// type Features = ExtractSectionType<'features'>; // FeaturesSectionConfig

// ========================================
// VALIDATION FUNCTIONS
// ========================================

export { validateAllowedSchema, validateHomepageConfig, validateDatasourceConfig } from './validation';
