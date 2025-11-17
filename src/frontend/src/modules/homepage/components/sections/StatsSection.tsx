/**
 * StatsSection Component
 *
 * Displays statistics with:
 * - Count-up animations
 * - Flexible layouts (horizontal, grid)
 * - Optional icons and suffixes
 * - JQEL datasource support for dynamic data
 * - Responsive design
 */

import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { motion, useInView } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import { useJQELQuery } from '@/hooks/useJQEL';
import { evaluateTemplate } from '@/lib/templateEngine';
import type { StatsSectionConfig } from '../../types';

interface StatsSectionProps {
  config: StatsSectionConfig;
  portalId?: string;
  instanceId?: string;
}

/**
 * Get icon component by name
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
 * Count-up animation hook
 */
function useCountUp(end: number, duration: number = 2000, start: boolean = false) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!start) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);

      // Easing function (ease-out cubic)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(end * easeOut));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [end, duration, start]);

  return count;
}

/**
 * Format number with separators
 */
function formatNumber(value: number | string, format?: string): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(num)) return value.toString();

  switch (format) {
    case 'decimal':
      return num.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    case 'percentage':
      return `${num.toLocaleString('pt-BR')}%`;
    case 'currency':
      return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    case 'compact':
      if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
      if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
      return num.toLocaleString('pt-BR');
    default:
      return num.toLocaleString('pt-BR');
  }
}

/**
 * Single Stat Item
 */
const StatItem: React.FC<{
  stat: StatsSectionConfig['items'][0];
  index: number;
  animate: boolean;
  layout?: string;
}> = ({ stat, index, animate, layout }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const Icon = getIcon(stat.icon);

  // Parse value for animation
  const numericValue = typeof stat.value === 'string'
    ? parseFloat(stat.value.replace(/[^0-9.-]/g, ''))
    : stat.value;

  const animatedValue = useCountUp(
    isNaN(numericValue) ? 0 : numericValue,
    2000,
    animate && isInView
  );

  const displayValue = animate && !isNaN(numericValue)
    ? formatNumber(animatedValue, stat.format)
    : stat.value;

  const isGrid = layout === 'grid';

  return (
    <motion.div
      ref={ref}
      initial={animate ? { opacity: 0, y: 20 } : false}
      animate={animate && isInView ? { opacity: 1, y: 0 } : false}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={cn(
        'flex items-center gap-4',
        isGrid && 'flex-col text-center'
      )}
    >
      {/* Icon */}
      {Icon && (
        <div className={cn(
          'p-3 rounded-lg bg-primary/10',
          isGrid ? 'mx-auto' : ''
        )}>
          <Icon className="h-6 w-6 text-primary" />
        </div>
      )}

      {/* Content */}
      <div className={isGrid ? 'space-y-1' : 'space-y-0.5'}>
        <div className={cn(
          'font-bold',
          isGrid ? 'text-3xl md:text-4xl' : 'text-2xl md:text-3xl'
        )}>
          {stat.prefix && <span className="text-muted-foreground">{stat.prefix}</span>}
          {displayValue}
          {stat.suffix && <span className="text-muted-foreground">{stat.suffix}</span>}
        </div>
        <div className={cn(
          'text-muted-foreground',
          isGrid ? 'text-sm' : 'text-xs'
        )}>
          {stat.label}
        </div>
        {stat.description && (
          <div className="text-xs text-muted-foreground/70 mt-1">
            {stat.description}
          </div>
        )}
      </div>
    </motion.div>
  );
};

/**
 * Dynamic Stats with JQEL
 */
const DynamicStats: React.FC<{
  datasource: StatsSectionConfig['datasource'];
  layout?: string;
  animate: boolean;
}> = ({ datasource, layout, animate }) => {
  if (!datasource?.query) return null;

  const { data: result, isLoading, isError } = useJQELQuery(
    datasource.query,
    {
      enabled: true,
      staleTime: 5 * 60 * 1000,
    }
  );

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (isError || !result?.success) {
    return null; // Fail silently in production
  }

  // Process data
  const items = datasource.multiple && Array.isArray(result.data)
    ? result.data
    : [result.data];

  const stats = items.slice(0, datasource.limit || 10).map((item: any) => {
    const mapping = datasource.mapping || {};
    return {
      value: mapping.value ? evaluateTemplate(mapping.value, item) : item.value,
      label: mapping.label ? evaluateTemplate(mapping.label, item) : item.label,
      description: mapping.description ? evaluateTemplate(mapping.description, item) : item.description,
      icon: mapping.icon ? evaluateTemplate(mapping.icon, item) : item.icon,
      prefix: mapping.prefix ? evaluateTemplate(mapping.prefix, item) : item.prefix,
      suffix: mapping.suffix ? evaluateTemplate(mapping.suffix, item) : item.suffix,
      format: mapping.format ? evaluateTemplate(mapping.format, item) : item.format,
    };
  });

  return (
    <>
      {stats.map((stat, index) => (
        <StatItem
          key={`dynamic-stat-${index}`}
          stat={stat}
          index={index}
          animate={animate}
          layout={layout}
        />
      ))}
    </>
  );
};

export const StatsSection: React.FC<StatsSectionProps> = ({
  config,
  portalId,
  instanceId,
}) => {
  if (!config.enabled) return null;

  const layout = config.layout || 'horizontal';
  const animate = config.animation !== false;

  // Get layout classes
  const getLayoutClass = () => {
    if (layout === 'grid') {
      const count = config.items.length + (config.datasource ? 4 : 0); // Estimate dynamic items
      if (count <= 2) return 'grid grid-cols-1 md:grid-cols-2 gap-8';
      if (count === 3) return 'grid grid-cols-1 md:grid-cols-3 gap-8';
      if (count === 4) return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8';
      return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8';
    }
    return 'flex flex-wrap justify-around gap-8 md:gap-12';
  };

  return (
    <section
      id="stats"
      className={cn(
        'py-16 px-4 md:px-6 lg:px-8',
        config.background === 'muted' && 'bg-muted/50',
        config.className
      )}
    >
      <div className="container mx-auto max-w-7xl">
        {/* Section Header */}
        {(config.title || config.subtitle) && (
          <div className="text-center mb-12">
            {config.title && (
              <motion.h2
                initial={animate ? { opacity: 0, y: -20 } : false}
                animate={animate ? { opacity: 1, y: 0 } : false}
                transition={{ duration: 0.5 }}
                className="text-3xl md:text-4xl font-bold mb-4"
              >
                {config.title}
              </motion.h2>
            )}
            {config.subtitle && (
              <motion.p
                initial={animate ? { opacity: 0, y: -10 } : false}
                animate={animate ? { opacity: 1, y: 0 } : false}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-lg text-muted-foreground max-w-2xl mx-auto"
              >
                {config.subtitle}
              </motion.p>
            )}
          </div>
        )}

        {/* Stats Container */}
        <div className={getLayoutClass()}>
          {/* Static Stats */}
          {config.items?.map((stat, index) => (
            <StatItem
              key={`stat-${index}`}
              stat={stat}
              index={index}
              animate={animate}
              layout={layout}
            />
          ))}

          {/* Dynamic Stats */}
          {config.datasource && (
            <DynamicStats
              datasource={config.datasource}
              layout={layout}
              animate={animate}
            />
          )}
        </div>

        {/* Empty State */}
        {config.items.length === 0 && !config.datasource && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No statistics configured</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default StatsSection;