/**
 * PortalsSection Component
 *
 * Seção de portais da Homepage com dois layouts:
 * - grid: Grid responsivo de cards de portais
 * - orbit: Layout circular com rotação (máximo 6 portais recomendado)
 *
 * Busca portais públicos via JQEL e filtra pelos IDs configurados.
 *
 * Suporta:
 * - Grid responsivo com cards de portais
 * - Layout orbital com rotação suave
 * - Screenshots de portais
 * - Badges de status (Active/Coming Soon)
 * - Badge "Featured" para portais destacados
 * - Efeitos de card (flip-hover, hover-lift, none)
 *
 * @see spec/ui/SPEC-ui-homepage.md - Portals Section
 * @see spec/SPEC-module-homepage.md - SPEC-M-HP-SEC-010 a SPEC-M-HP-SEC-013
 */

import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AnimatedList } from '@/components/ui/animate/animated-list';
import { CardFlipHover } from '@/components/ui/animate/card-flip-hover';
import { OrbitRotation } from '@/components/ui/animate/orbit-rotation';
import { AnimatedText } from '../animated/AnimatedText';
import { AnimatedBadge } from '../animated/AnimatedBadge';
import { usePortalsList } from '../../hooks/usePortalsList';
import type { PortalsSectionConfig } from '../../types';
import * as LucideIcons from 'lucide-react';
import { ArrowRight, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface PortalsSectionProps {
  config: PortalsSectionConfig;
}

/**
 * Container genérico com max-width e padding responsivo
 */
function Container({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('container mx-auto px-4 md:px-6 lg:px-8', className)}>
      {children}
    </div>
  );
}

/**
 * PortalCard - Card individual de portal
 */
function PortalCard({
  portalId,
  name,
  description,
  icon,
  screenshot,
  status,
  highlight,
  customTitle,
  customDescription,
  effect,
}: {
  portalId: string;
  name: string;
  description?: string;
  icon?: string;
  screenshot?: string;
  status: 'active' | 'inactive' | 'coming-soon';
  highlight: boolean;
  customTitle?: string;
  customDescription?: string;
  effect: PortalsSectionConfig['cardEffect'];
}) {
  // Renderizar ícone Lucide
  const IconComponent = icon
    ? (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[icon]
    : null;

  const isActive = status === 'active';

  // Conteúdo da frente do card
  const frontContent = (
    <Card className="p-0 overflow-hidden h-full flex flex-col relative">
      {/* Featured Badge */}
      {highlight && (
        <div className="absolute top-4 right-4 z-10">
          <AnimatedBadge className="bg-yellow-500 text-yellow-950">
            <Star className="w-3 h-3 mr-1 inline" />
            Featured
          </AnimatedBadge>
        </div>
      )}

      {/* Screenshot */}
      {screenshot ? (
        <div className="relative aspect-video overflow-hidden bg-muted">
          <img
            src={screenshot}
            alt={`${name} preview`}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      ) : (
        <div className="relative aspect-video overflow-hidden bg-muted flex items-center justify-center">
          <span className="text-muted-foreground text-sm">No preview</span>
        </div>
      )}

      {/* Content */}
      <div className="p-6 flex-grow flex flex-col">
        {/* Portal Icon & Name */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            {IconComponent ? (
              <IconComponent className="w-5 h-5 text-primary" />
            ) : (
              <span className="text-primary text-xs font-bold">
                {name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <h3 className="feature-title text-lg font-semibold">
            {customTitle || name}
          </h3>
        </div>

        {/* Description */}
        <p className="body-text text-sm text-muted-foreground mb-4 flex-grow line-clamp-3">
          {customDescription || description || 'Explore this portal'}
        </p>

        {/* Status Badge & Link */}
        <div className="flex items-center justify-between">
          <Badge
            variant={isActive ? 'default' : 'secondary'}
            className={cn(
              isActive && 'bg-green-500 text-white hover:bg-green-600'
            )}
          >
            {isActive ? 'Active' : 'Coming Soon'}
          </Badge>

          {/* Link */}
          {isActive && (
            <Link
              to={`/${portalId}`}
              className="text-primary hover:underline flex items-center gap-1 text-sm font-medium"
            >
              Visit <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>
    </Card>
  );

  // Conteúdo do verso (para flip cards) - Informações adicionais
  const backContent = (
    <Card className="p-6 h-full bg-primary text-primary-foreground flex flex-col">
      <h3 className="feature-title text-lg font-semibold mb-4">{customTitle || name}</h3>
      <p className="body-text flex-grow text-sm leading-relaxed">
        {customDescription || description || 'Explore this portal to discover more features and functionalities.'}
      </p>
      {isActive && (
        <Link
          to={`/${portalId}`}
          className="mt-4 inline-flex items-center gap-2 text-sm font-medium underline"
        >
          Visit Portal <ArrowRight className="w-4 h-4" />
        </Link>
      )}
    </Card>
  );

  // Renderizar baseado no efeito configurado
  switch (effect) {
    case 'flip-hover':
      return (
        <CardFlipHover
          frontContent={frontContent}
          backContent={backContent}
          className="h-full"
        />
      );

    case 'hover-lift':
      return (
        <div className="h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
          {frontContent}
        </div>
      );

    case 'none':
    default:
      return <div className="h-full">{frontContent}</div>;
  }
}

/**
 * PortalsSection - Seção de portais
 */
export function PortalsSection({ config }: PortalsSectionProps) {
  // Buscar todos os portais públicos
  const { portals, isLoading, isError } = usePortalsList({
    onlyPublic: true,
    onlyActive: false, // Mostrar todos, incluindo coming soon
  });

  // Filtrar portais pelos IDs configurados
  const filteredPortals = portals?.filter((portal) =>
    config.portals.some((item) => item.portalId === portal.portalId)
  );

  // Mesclar configurações personalizadas com dados dos portais
  const enrichedPortals = filteredPortals?.map((portal) => {
    const configItem = config.portals.find((item) => item.portalId === portal.portalId);
    return {
      ...portal,
      highlight: configItem?.highlight || false,
      customTitle: configItem?.customTitle,
      customDescription: configItem?.description,
    };
  });

  // Estados de loading e error
  if (isLoading) {
    return (
      <section className="portals-section py-24 md:py-32 bg-muted/50">
        <Container>
          <div className="section-title text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-16">
            {config.title}
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-96 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </Container>
      </section>
    );
  }

  if (isError || !enrichedPortals || enrichedPortals.length === 0) {
    return (
      <section className="portals-section py-24 md:py-32 bg-muted/50">
        <Container>
          <div className="section-title text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-16">
            {config.title}
          </div>
          <div className="text-center text-muted-foreground">
            No portals available at the moment.
          </div>
        </Container>
      </section>
    );
  }

  // Renderizar cards
  const renderPortalCards = () => {
    return enrichedPortals.map((portal) => (
      <PortalCard
        key={portal.portalId}
        portalId={portal.portalId}
        name={portal.name}
        description={portal.description}
        icon={portal.icon}
        screenshot={portal.screenshot}
        status={portal.status}
        highlight={portal.highlight}
        customTitle={portal.customTitle}
        customDescription={portal.customDescription}
        effect={config.cardEffect}
      />
    ));
  };

  return (
    <section className="portals-section py-24 md:py-32 bg-muted/50">
      <Container>
        {/* Section Title */}
        <AnimatedText
          text={config.title}
          type="fade"
          className="section-title text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-16"
          delay={0}
        />

        {/* Portals - Layout Grid */}
        {config.layout === 'grid' && (
          <>
            {config.animation === 'animated-list' ? (
              <AnimatedList
                className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                delay={0.1}
                staggerDelay={0.1}
              >
                {renderPortalCards()}
              </AnimatedList>
            ) : config.animation === 'fade-in' ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-700">
                {renderPortalCards()}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {renderPortalCards()}
              </div>
            )}
          </>
        )}

        {/* Portals - Layout Orbit */}
        {config.layout === 'orbit' && (
          <div className="flex justify-center items-center min-h-[600px]">
            <OrbitRotation
              items={renderPortalCards()}
              radius={250}
              duration={30}
            />
          </div>
        )}
      </Container>
    </section>
  );
}
