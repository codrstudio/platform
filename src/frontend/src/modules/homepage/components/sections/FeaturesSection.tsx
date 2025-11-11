/**
 * FeaturesSection Component
 *
 * Seção de features da Homepage com grid responsivo e cards interativos.
 *
 * Suporta:
 * - Grid responsivo (2/3/4 colunas configurável)
 * - Animação de lista (animated-list, fade-in, ou none)
 * - Cards com efeitos: flip-hover, hover-lift, ou none
 * - Icons Lucide, badges animados, títulos e descrições
 * - Conteúdo do verso (backContent) para flip cards
 *
 * @see spec/ui/SPEC-ui-homepage.md - Features Section
 * @see spec/SPEC-module-homepage.md - SPEC-M-HP-SEC-006 a SPEC-M-HP-SEC-009
 */

import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { AnimatedList } from '@/components/ui/animate/animated-list';
import { CardFlipHover } from '@/components/ui/animate/card-flip-hover';
import { AnimatedText } from '../animated/AnimatedText';
import { AnimatedBadge } from '../animated/AnimatedBadge';
import type { FeaturesSectionConfig, FeatureItem } from '../../types';
import * as LucideIcons from 'lucide-react';
import { ArrowRight } from 'lucide-react';

export interface FeaturesSectionProps {
  config: FeaturesSectionConfig;
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
 * FeatureCard - Card individual de feature
 */
function FeatureCard({
  item,
  effect,
}: {
  item: FeatureItem;
  effect: FeaturesSectionConfig['cardEffect'];
}) {
  // Renderizar ícone Lucide
  const IconComponent = (
    LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>
  )[item.icon];

  // Conteúdo da frente do card
  const frontContent = (
    <Card className="p-6 h-full flex flex-col">
      {/* Icon Container */}
      <div className="mb-4 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
        {IconComponent ? (
          <IconComponent className="w-6 h-6 text-primary" />
        ) : (
          <span className="text-primary text-xs">?</span>
        )}
      </div>

      {/* Badge (opcional) */}
      {item.badge && (
        <AnimatedBadge variant="secondary" className="mb-3 self-start">
          {item.badge}
        </AnimatedBadge>
      )}

      {/* Title */}
      {item.titleAnimation && item.titleAnimation !== 'none' ? (
        <AnimatedText
          text={item.title}
          type={item.titleAnimation}
          className="feature-title text-xl font-semibold mb-2 leading-snug"
          delay={0.1}
        />
      ) : (
        <h3 className="feature-title text-xl font-semibold mb-2 leading-snug">
          {item.title}
        </h3>
      )}

      {/* Description */}
      <p className="body-text text-muted-foreground flex-grow leading-relaxed">
        {item.description}
      </p>

      {/* Hover Indicator (apenas para flip cards) */}
      {effect === 'flip-hover' && item.backContent && (
        <p className="text-sm text-primary mt-4 flex items-center gap-2">
          Learn more <ArrowRight className="w-4 h-4" />
        </p>
      )}
    </Card>
  );

  // Conteúdo do verso (para flip cards)
  const backContent = item.backContent ? (
    <Card className="p-6 h-full bg-primary text-primary-foreground flex flex-col">
      <h3 className="feature-title text-xl font-semibold mb-4">{item.title}</h3>
      <p className="body-text flex-grow leading-relaxed">{item.backContent}</p>
    </Card>
  ) : null;

  // Renderizar baseado no efeito configurado
  switch (effect) {
    case 'flip-hover':
      if (backContent) {
        return (
          <CardFlipHover
            frontContent={frontContent}
            backContent={backContent}
            className="h-full"
          />
        );
      }
      // Fallback para hover-lift se não houver backContent
      return (
        <div className="h-full transition-all hover:shadow-xl hover:-translate-y-1">
          {frontContent}
        </div>
      );

    case 'hover-lift':
      return (
        <div className="h-full transition-all hover:shadow-xl hover:-translate-y-1">
          {frontContent}
        </div>
      );

    case 'none':
    default:
      return <div className="h-full">{frontContent}</div>;
  }
}

/**
 * FeaturesSection - Grid de features
 */
export function FeaturesSection({ config }: FeaturesSectionProps) {
  // Classes do grid baseadas em colunas configuradas
  const gridClasses = {
    2: 'grid md:grid-cols-2 gap-8',
    3: 'grid md:grid-cols-2 lg:grid-cols-3 gap-8',
    4: 'grid md:grid-cols-2 lg:grid-cols-4 gap-6',
  }[config.columns];

  // Renderizar items
  const renderItems = () => {
    return config.items.map((item, index) => (
      <FeatureCard key={`feature-${index}`} item={item} effect={config.cardEffect} />
    ));
  };

  return (
    <section className="features-section py-24 md:py-32 bg-muted/30">
      <Container>
        {/* Section Title */}
        <AnimatedText
          text={config.title}
          type="pull-up"
          className="section-title text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-16"
          delay={0}
        />

        {/* Features Grid */}
        {config.animation === 'animated-list' ? (
          <AnimatedList className={gridClasses} delay={0.1} staggerDelay={0.1}>
            {renderItems()}
          </AnimatedList>
        ) : config.animation === 'fade-in' ? (
          <div className={cn(gridClasses, 'animate-in fade-in duration-700')}>
            {renderItems()}
          </div>
        ) : (
          <div className={gridClasses}>{renderItems()}</div>
        )}
      </Container>
    </section>
  );
}
