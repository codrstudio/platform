import { useParams } from 'react-router-dom';
import { useHomepageConfig } from '../hooks/useHomepageConfig';
import { HeroSection } from './sections/HeroSection';
import { FeaturesSection } from './sections/FeaturesSection';
import { PortalsSection } from './sections/PortalsSection';
import { CTASection } from './sections/CTASection';
import { HomepageHeader } from './HomepageHeader';
import { LoadingSkeleton } from './LoadingSkeleton';
import { ErrorState } from './ErrorState';
import { EmptyState } from './EmptyState';
import type { SectionConfig } from '../types';

interface HomePageProps {
  instanceId?: string;
}

export function HomePage({ instanceId: propsInstanceId }: HomePageProps) {
  const params = useParams();
  const instanceId = propsInstanceId || params.instanceId || 'default';

  const { config, isLoading, isError, error, refetch } = useHomepageConfig({ instanceId });

  // Loading state
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  // Error state
  if (isError) {
    return <ErrorState error={error} onRetry={refetch} />;
  }

  // Empty state - no config or no sections
  if (!config || !config.sections || config.sections.length === 0) {
    return <EmptyState />;
  }

  // Render sections
  const enabledSections = config.sections.filter(section => section.enabled);

  // Empty state - no enabled sections
  if (enabledSections.length === 0) {
    return <EmptyState />;
  }

  return (
    <>
      {/* Optional Header with Auth Integration */}
      {config.integrations?.auth && (
        <HomepageHeader
          show={config.integrations.auth.showLoginButton || config.integrations.auth.showSignupButton}
          redirectAfterLogin={config.integrations.auth.redirectAfterLogin}
          className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50"
        />
      )}

      <main className="homepage">
        {enabledSections.map((section: SectionConfig, index) => {
          const key = `${section.type}-${index}`;

          switch (section.type) {
            case 'hero':
              return <HeroSection key={key} config={section} />;

            case 'features':
              return <FeaturesSection key={key} config={section} />;

            case 'portals':
              return <PortalsSection key={key} config={section} />;

            case 'cta':
              return <CTASection key={key} config={section} />;

            default:
              // Unknown section type - skip silently
              console.warn(`Unknown section type: ${(section as any).type}`);
              return null;
          }
        })}
      </main>
    </>
  );
}
