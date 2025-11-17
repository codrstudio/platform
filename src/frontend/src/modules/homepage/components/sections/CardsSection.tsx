/**
 * CardsSection Component
 *
 * Displays a grid of feature cards with:
 * - Static or dynamic content (JQEL)
 * - Configurable columns (1-6)
 * - Animation effects
 * - Responsive design
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { DynamicFeatureCard } from '../shared/DynamicFeatureCard';
import type { CardsSectionConfig, FeaturesSectionConfig } from '../../types';

interface CardsSectionProps {
  config: CardsSectionConfig | FeaturesSectionConfig;
  portalId?: string;
  instanceId?: string;
}

/**
 * Get grid column class based on columns configuration
 */
function getGridColumns(columns?: number): string {
  switch (columns) {
    case 1:
      return 'grid-cols-1';
    case 2:
      return 'grid-cols-1 md:grid-cols-2';
    case 3:
      return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
    case 4:
      return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';
    case 5:
      return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5';
    case 6:
      return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6';
    default:
      return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
  }
}

/**
 * Get gap class based on gap configuration
 */
function getGapClass(gap?: string): string {
  switch (gap) {
    case 'sm':
      return 'gap-2';
    case 'md':
      return 'gap-4';
    case 'lg':
      return 'gap-6';
    case 'xl':
      return 'gap-8';
    default:
      return 'gap-4';
  }
}

export const CardsSection: React.FC<CardsSectionProps> = ({
  config,
  portalId,
  instanceId,
}) => {
  if (!config.enabled) return null;

  const columns = config.columns || 3;
  const gap = config.gap || 'md';
  const cardEffect = config.cardEffect || 'none';
  const cardVariant = config.cardVariant || 'default';

  const shouldAnimate = config.animation !== 'none';

  return (
    <section
      id="cards"
      className={cn(
        'py-16 px-4 md:px-6 lg:px-8',
        config.className
      )}
    >
      <div className="container mx-auto max-w-7xl">
        {/* Section Header */}
        {(config.title || config.subtitle) && (
          <div className="text-center mb-12">
            {config.title && (
              <motion.h2
                initial={{ opacity: 0, y: -20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5 }}
                className="text-3xl md:text-4xl font-bold mb-4"
              >
                {config.title}
              </motion.h2>
            )}
            {config.subtitle && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-lg text-muted-foreground max-w-2xl mx-auto"
              >
                {config.subtitle}
              </motion.p>
            )}
          </div>
        )}

        {/* Cards Grid */}
        <div
          className={cn(
            'grid',
            getGridColumns(columns),
            getGapClass(gap)
          )}
        >
          {config.items?.map((item, index) => {
            // Generate unique key based on item content to prevent animation issues
            const itemKey = `card-${index}-${item.title || ''}-${item.icon || ''}`;

            if (shouldAnimate) {
              return (
                <motion.div
                  key={itemKey}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    type: 'spring',
                    stiffness: 100,
                    delay: index * 0.1,
                  }}
                  layout
                >
                  <DynamicFeatureCard
                    item={item}
                    columns={columns}
                    variant={cardVariant}
                    effect={cardEffect}
                    index={index}
                  />
                </motion.div>
              );
            }

            return (
              <div key={itemKey}>
                <DynamicFeatureCard
                  item={item}
                  columns={columns}
                  variant={cardVariant}
                  effect={cardEffect}
                  index={index}
                />
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {(config.items?.length ?? 0) === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No cards configured</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default CardsSection;