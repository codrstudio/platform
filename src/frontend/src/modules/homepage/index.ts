// Module exports - Public API
export { manifest } from './manifest';
export { routes } from './routes';

// Components - Public components for use by other modules
export { HomePage } from './components/HomePage';
export { HomepageHeader } from './components/HomepageHeader';
export { HomepagePreview, HomepagePreviewFullscreen } from './components/preview/HomepagePreview';

// Hooks - Public hooks for integration
export { useHomepageConfig } from './hooks/useHomepageConfig';
export { useUpdateHomepageConfig } from './hooks/useUpdateHomepageConfig';
export { usePortalsList } from './hooks/usePortalsList';
export { useScrollAnimation } from './hooks/useScrollAnimation';
export { useReducedMotion } from './hooks/useReducedMotion';

// Types - Public types for TypeScript consumers
export type {
  HomepageConfig,
  SectionConfig,
  HeroSectionConfig,
  FeaturesSectionConfig,
  PortalsSectionConfig,
  CTASectionConfig,
  AnimationConfig,
  BackgroundConfig,
  ThemeConfig,
  IntegrationConfig,
  CTAButton,
  FeatureItem,
  PortalItem,
  AnimationType,
  AnimationIntensity,
  CardEffect,
  BackgroundType,
  LayoutType,
} from './types';

// Context - Export context for advanced use cases
export { HomepageConfigProvider, useHomepageConfigContext } from './contexts/HomepageConfigContext';

// Utils - Public utilities
export { validateHomepageConfig, parseHomepageConfig } from './utils/validateConfig';
export {
  DEFAULT_ANIMATION_CONFIG,
  DEFAULT_BACKGROUND_CONFIG,
  DEFAULT_THEME_CONFIG,
} from './utils/validateConfig';
export { handleCTAAction, useHandleCTAAction } from './utils/handleCTAAction';
