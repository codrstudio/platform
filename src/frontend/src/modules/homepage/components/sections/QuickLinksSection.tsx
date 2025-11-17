/**
 * QuickLinksSection Component
 *
 * Displays quick navigation links with:
 * - Flexible layouts (horizontal, vertical, grid)
 * - Support for all link types (relative, portal, external)
 * - Optional icons and descriptions
 * - Responsive design
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { ArrowRight, ExternalLink } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LinkHandler } from '../shared/LinkHandler';
import type { QuickLinksSectionConfig } from '../../types';

interface QuickLinksSectionProps {
  config: QuickLinksSectionConfig;
  portalId?: string;
  instanceId?: string;
}

/**
 * Get Lucide icon component by name
 */
function getIcon(iconName?: string): React.ComponentType<any> | null {
  if (!iconName) return null;

  const Icon = (LucideIcons as any)[iconName];
  if (!Icon) {
    console.warn(`Icon "${iconName}" not found in Lucide icons`);
    return null;
  }

  return Icon;
}

/**
 * Get layout classes
 */
function getLayoutClass(layout?: string, columns?: number): string {
  switch (layout) {
    case 'horizontal':
      return 'flex flex-row flex-wrap gap-4';
    case 'vertical':
      return 'flex flex-col gap-4';
    case 'grid':
      const colClass = columns === 2
        ? 'grid-cols-1 md:grid-cols-2'
        : columns === 3
        ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
        : columns === 4
        ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
        : columns === 6
        ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6'
        : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
      return `grid ${colClass} gap-4`;
    default:
      return 'flex flex-row flex-wrap gap-4';
  }
}

/**
 * Single Quick Link Item
 */
const QuickLinkItem: React.FC<{
  item: QuickLinksSectionConfig['items'][0];
  layout?: string;
  showIcons?: boolean;
  showDescriptions?: boolean;
  index: number;
}> = ({ item, layout, showIcons = true, showDescriptions = false, index }) => {
  const Icon = showIcons ? getIcon(item.icon) : null;
  const isExternal = item.link.type === 'external';
  const isHorizontal = layout === 'horizontal';

  const content = (
    <Card
      className={cn(
        'group transition-all duration-200',
        'hover:shadow-lg hover:scale-105 hover:border-primary/50',
        isHorizontal && 'min-w-[150px]'
      )}
    >
      <CardContent className="p-4">
        <div className={cn(
          'flex items-center',
          showDescriptions ? 'flex-col text-center' : 'gap-3'
        )}>
          {/* Icon */}
          {Icon && (
            <div className={cn(
              'p-2 rounded-lg bg-primary/10',
              'group-hover:bg-primary/20 transition-colors',
              showDescriptions && 'mb-2'
            )}>
              <Icon className="h-5 w-5 text-primary" />
            </div>
          )}

          {/* Text Content */}
          <div className={cn(showDescriptions ? 'space-y-1' : 'flex-1')}>
            <div className="flex items-center gap-2">
              <span className="font-medium group-hover:text-primary transition-colors">
                {item.label}
              </span>
              {item.badge && (
                <Badge variant="secondary" className="text-xs">
                  {item.badge}
                </Badge>
              )}
            </div>
            {showDescriptions && item.description && (
              <p className="text-sm text-muted-foreground">
                {item.description}
              </p>
            )}
          </div>

          {/* Arrow/External Icon */}
          {!showDescriptions && (
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              {isExternal ? (
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <LinkHandler link={item.link} className="block">
        {content}
      </LinkHandler>
    </motion.div>
  );
};

export const QuickLinksSection: React.FC<QuickLinksSectionProps> = ({
  config,
  portalId,
  instanceId,
}) => {
  if (!config.enabled) return null;

  const layout = config.layout || 'horizontal';
  const showIcons = config.showIcons !== false;
  const showDescriptions = config.showDescriptions || false;

  return (
    <section
      id="quick-links"
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
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-3xl md:text-4xl font-bold mb-4"
              >
                {config.title}
              </motion.h2>
            )}
            {config.subtitle && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-lg text-muted-foreground max-w-2xl mx-auto"
              >
                {config.subtitle}
              </motion.p>
            )}
          </div>
        )}

        {/* Links Container */}
        <div className={getLayoutClass(layout, config.columns)}>
          {config.items.map((item, index) => (
            <QuickLinkItem
              key={`quick-link-${index}`}
              item={item}
              layout={layout}
              showIcons={showIcons}
              showDescriptions={showDescriptions}
              index={index}
            />
          ))}
        </div>

        {/* Empty State */}
        {config.items.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No quick links configured</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default QuickLinksSection;