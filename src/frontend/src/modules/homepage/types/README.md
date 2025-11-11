# Types

TypeScript type definitions do módulo Homepage.

## Arquivo: index.ts

Centraliza todas as exportações de types do módulo.

```typescript
// index.ts
export type {
  // Config types
  HomepageConfig,
  AnimationConfig,
  BackgroundConfig,
  ThemeConfig,
  IntegrationConfig,

  // Section types
  SectionConfig,
  BaseSectionConfig,
  HeroSectionConfig,
  FeaturesSectionConfig,
  PortalsSectionConfig,
  CTASectionConfig,

  // Item types
  CTAButton,
  FeatureItem,
  PortalItem,

  // Component prop types
  HomePageProps,
  HeroSectionProps,
  FeaturesSectionProps,
  PortalsSectionProps,
  CTASectionProps,
  AnimatedTextProps,
  AnimatedBadgeProps,
  AnimatedCardProps,

  // Hook return types
  UseHomepageConfigReturn,
  UseScrollAnimationReturn,
  UsePortalsListReturn,

  // Utility types
  AnimationIntensity,
  AnimationType,
  BackgroundType,
  LayoutType,
  CardEffect,
} from './homepage';
```

## Estrutura de Types

### Config Types

```typescript
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

export type AnimationIntensity = 'subtle' | 'normal' | 'intense';

/**
 * Configuração de background da página
 */
export interface BackgroundConfig {
  /** Tipo de background animado */
  type: BackgroundType;

  /** Opacidade do efeito (0.0 a 1.0) */
  opacity: number;
}

export type BackgroundType = 'grid' | 'novatrix' | 'hacker' | 'solid';

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
```

### Section Types

```typescript
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
 * Union type de todas as configurações de seção
 */
export type SectionConfig =
  | HeroSectionConfig
  | FeaturesSectionConfig
  | PortalsSectionConfig
  | CTASectionConfig;

/**
 * Configuração da Hero Section
 */
export interface HeroSectionConfig extends BaseSectionConfig {
  type: 'hero';

  /** Layout da seção */
  layout: 'centered' | 'split';

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

export type AnimationType = 'blur-in' | 'pull-up' | 'fade' | 'gradual-spacing';
export type CardEffect = 'flip-hover' | 'hover-lift' | 'none';
```

### Item Types

```typescript
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
```

### Component Prop Types

```typescript
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
```

### Hook Return Types

```typescript
export interface UseHomepageConfigReturn {
  config: HomepageConfig | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

export interface UseScrollAnimationReturn<T extends HTMLElement> {
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

export interface Portal {
  portalId: string;
  name: string;
  description: string;
  icon: string;
  active: boolean;
  visibility: 'public' | 'private';
}
```

## Type Guards

```typescript
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
 * Type guard para seções específicas
 */
export function isHeroSection(
  section: SectionConfig
): section is HeroSectionConfig {
  return section.type === 'hero';
}

export function isFeaturesSection(
  section: SectionConfig
): section is FeaturesSectionConfig {
  return section.type === 'features';
}

export function isPortalsSection(
  section: SectionConfig
): section is PortalsSectionConfig {
  return section.type === 'portals';
}

export function isCTASection(
  section: SectionConfig
): section is CTASectionConfig {
  return section.type === 'cta';
}
```

## Utility Types

```typescript
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

// Exemplos:
// type Hero = ExtractSectionType<'hero'>; // HeroSectionConfig
// type Features = ExtractSectionType<'features'>; // FeaturesSectionConfig
```

## Convenções

### Naming

- Interfaces: PascalCase (`HomepageConfig`)
- Types: PascalCase (`SectionConfig`)
- Propriedades: camelCase (`backgroundEffect`)
- Union types: PascalCase (`AnimationType`)

### Documentation

- Sempre adicionar JSDoc comments
- Descrever propósito e uso
- Incluir exemplos quando apropriado

### Exports

- Export tudo de `index.ts`
- Usar `export type` para types
- Agrupar logicamente

## Referências

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/)
