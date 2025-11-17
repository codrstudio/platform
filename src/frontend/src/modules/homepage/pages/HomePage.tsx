/**
 * HomePage Component
 *
 * Main homepage component that renders sections based on configuration
 * Supports dynamic section ordering and conditional rendering
 */

import React, { useMemo } from 'react';
import { usePortal } from '@/contexts/PortalContext';
import { useJQELQuery } from '@/hooks/useJQEL';
import { evaluateTemplate } from '@/lib/templateEngine';

// Import all section components
import { HeroSection } from '../components/sections/HeroSection';
import { CardsSection } from '../components/sections/CardsSection';
import { QuickLinksSection } from '../components/sections/QuickLinksSection';
import { StatsSection } from '../components/sections/StatsSection';
import { FAQSection } from '../components/sections/FAQSection';
import { NewsletterSection } from '../components/sections/NewsletterSection';
import { FooterSection } from '../components/sections/FooterSection';

// Legacy sections (backward compatibility)
import { FeaturesSection } from '../components/sections/FeaturesSection';
import { CTASection } from '../components/sections/CTASection';
import { PortalsSection } from '../components/sections/PortalsSection';

import type { HomepageConfig, SectionConfig } from '../types';

interface HomePageProps {
  config?: HomepageConfig;
  instanceId?: string;
}

/**
 * Section renderer based on type
 */
const SectionRenderer: React.FC<{
  section: SectionConfig;
  portalId: string;
  instanceId?: string;
  index: number;
}> = ({ section, portalId, instanceId, index }) => {
  // Skip disabled sections
  if (!section.enabled) return null;

  // Process template variables in section config
  const processedSection = useMemo(() => {
    const portalData = { portalId, instanceId };

    // Deep clone and process templates
    const processed = JSON.parse(JSON.stringify(section));

    // Process string fields with template expressions
    const processField = (value: any): any => {
      if (typeof value === 'string' && value.includes('${')) {
        return evaluateTemplate(value, { portal: portalData });
      }
      if (Array.isArray(value)) {
        return value.map(processField);
      }
      if (value && typeof value === 'object') {
        const result: any = {};
        for (const key in value) {
          result[key] = processField(value[key]);
        }
        return result;
      }
      return value;
    };

    return processField(processed);
  }, [section, portalId, instanceId]);

  // Render section based on type
  switch (section.type) {
    case 'hero':
      return <HeroSection config={processedSection} portalId={portalId} instanceId={instanceId} />;

    case 'cards':
    case 'features': // Backward compatibility
      return <CardsSection config={processedSection} portalId={portalId} instanceId={instanceId} />;

    case 'quickLinks':
      return <QuickLinksSection config={processedSection} portalId={portalId} instanceId={instanceId} />;

    case 'stats':
      return <StatsSection config={processedSection} portalId={portalId} instanceId={instanceId} />;

    case 'faq':
      return <FAQSection config={processedSection} portalId={portalId} instanceId={instanceId} />;

    case 'newsletter':
      return <NewsletterSection config={processedSection} portalId={portalId} instanceId={instanceId} />;

    case 'footer':
      return <FooterSection config={processedSection} portalId={portalId} instanceId={instanceId} />;

    // Legacy sections
    case 'cta':
      return <CTASection config={processedSection} />;

    case 'portals':
      return <PortalsSection config={processedSection} />;

    default:
      console.warn(`Unknown section type: ${section.type}`);
      return null;
  }
};

/**
 * Default homepage configuration
 */
const defaultConfig: HomepageConfig = {
  route: '/',
  title: 'Welcome',
  sections: [
    {
      type: 'hero',
      enabled: true,
      title: 'Welcome to ${portal.portalId}',
      subtitle: 'Build amazing applications with our platform',
      size: 'lg',
      alignment: 'center',
      background: {
        type: 'gradient',
        gradient: {
          from: '#667eea',
          to: '#764ba2',
          direction: 'to-r'
        }
      },
      actions: [
        {
          label: 'Get Started',
          link: { type: 'relative', route: '/dashboard' },
          variant: 'default'
        },
        {
          label: 'Learn More',
          link: { type: 'relative', route: '/docs' },
          variant: 'outline'
        }
      ]
    },
    {
      type: 'cards',
      enabled: true,
      title: 'Features',
      subtitle: 'Everything you need to build modern applications',
      columns: 3,
      items: [
        {
          icon: 'Zap',
          title: 'Fast Performance',
          description: 'Optimized for speed and efficiency'
        },
        {
          icon: 'Shield',
          title: 'Secure by Default',
          description: 'Built-in security best practices'
        },
        {
          icon: 'Users',
          title: 'Team Collaboration',
          description: 'Work together seamlessly'
        }
      ]
    }
  ]
};

export const HomePage: React.FC<HomePageProps> = ({
  config = defaultConfig,
  instanceId
}) => {
  const { portalId } = usePortal();

  // Load configuration from JQEL if needed (future enhancement)
  const { data: dynamicConfig } = useJQELQuery(
    {
      schema: 'backend',
      select: 'homepage_config',
      where: { portalId: { $eq: portalId }, instanceId: { $eq: instanceId } },
    },
    {
      enabled: false, // Disabled for now, enable when backend is ready
      staleTime: 5 * 60 * 1000,
    }
  );

  // Use dynamic config if available, otherwise use provided config
  const finalConfig = dynamicConfig?.data || config;

  // Sort sections by order if specified
  const sortedSections = useMemo(() => {
    if (!finalConfig.sections) return [];

    return [...finalConfig.sections].sort((a, b) => {
      const orderA = a.order ?? 999;
      const orderB = b.order ?? 999;
      return orderA - orderB;
    });
  }, [finalConfig.sections]);

  return (
    <div className="homepage min-h-screen">
      {/* Page Title */}
      {finalConfig.title && (
        <title>{finalConfig.title} | {portalId}</title>
      )}

      {/* Render all sections */}
      {sortedSections.map((section, index) => (
        <SectionRenderer
          key={`section-${section.type}-${index}`}
          section={section}
          portalId={portalId}
          instanceId={instanceId}
          index={index}
        />
      ))}

      {/* Empty state */}
      {sortedSections.length === 0 && (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">No sections configured</h1>
            <p className="text-muted-foreground">
              Please configure homepage sections in the setup module
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;