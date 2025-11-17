// Module System Integration
import { lazy } from 'react';
import type { ModuleExports } from '@/types/module';
import { moduleRegistry } from '@/core/modules';
import { manifest } from './manifest';
import { routes } from './routes';

// Lazy-load config component for better performance
const HomepageConfigForm = lazy(() =>
  import('./components/HomepageConfigForm').then((m) => ({ default: m.HomepageConfigForm }))
);

// Module exports object
export const homepageModule: ModuleExports = {
  manifest,
  routes,
  configComponent: HomepageConfigForm,
};

// Auto-registro no moduleRegistry (CRÍTICO!)
moduleRegistry.register(homepageModule);

// ============================================================================
// Public API - Exports for external consumption
// ============================================================================

// Re-export manifest and routes for direct access
export { manifest } from './manifest';
export { routes } from './routes';

// Components - Public components for use by other modules
export { HomePage } from './pages/HomePage';
export { EditorPage } from './pages/EditorPage';

// Section Components - Available for direct use
export { HeroSection } from './components/sections/HeroSection';
export { CardsSection } from './components/sections/CardsSection';
export { QuickLinksSection } from './components/sections/QuickLinksSection';
export { StatsSection } from './components/sections/StatsSection';
export { FAQSection } from './components/sections/FAQSection';
export { NewsletterSection } from './components/sections/NewsletterSection';
export { FooterSection } from './components/sections/FooterSection';

// Shared Components
export { DynamicFeatureCard } from './components/shared/DynamicFeatureCard';
export { LinkHandler, NavigationButton, useNavigateLink } from './components/shared/LinkHandler';
export { AnimatedCard } from './components/AnimatedCard';

// Legacy Components (backward compatibility)
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
  CardsSectionConfig,
  QuickLinksSectionConfig,
  StatsSectionConfig,
  FAQSectionConfig,
  NewsletterSectionConfig,
  FooterSectionConfig,
  FeaturesSectionConfig,
  PortalsSectionConfig,
  CTASectionConfig,
  LinkConfig,
  RelativeLinkConfig,
  PortalLinkConfig,
  ExternalLinkConfig,
  DatasourceConfig,
  TemplateMapping,
  BackgroundConfig,
  GradientConfig,
  ImageBackgroundConfig,
  VideoBackgroundConfig,
  CardEffect,
} from './types';

// Context - Export context for advanced use cases
export { HomepageConfigProvider, useHomepageConfigContext } from './contexts/HomepageConfigContext';

// Utils - Public utilities
export { validateHomepageConfig, validateDatasourceConfig, validateAllowedSchema } from './types/validation';
export { evaluateTemplate, createTemplateFunction, extractTemplateVariables as extractVariables } from '@/lib/templateEngine';
export { handleCTAAction, useHandleCTAAction } from './utils/handleCTAAction';

// Editor Components - Public for customization
export { HomepageVisualEditor } from './components/editor/HomepageVisualEditor';
export { EditorToolbar } from './components/editor/EditorToolbar';
export { SectionList } from './components/editor/SectionList';
export { LivePreviewPanel } from './components/editor/LivePreviewPanel';
export { EditorPanelRouter } from './components/editor/EditorPanelRouter';
