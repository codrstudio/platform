/**
 * DynamicFeatureCard Component
 *
 * Renders feature cards with support for:
 * - Static content (backward compatible)
 * - Dynamic content via JQEL queries
 * - Template expressions for field mapping
 * - Multiple cards from single query
 */

import React from 'react';
import { useJQELQuery } from '@/hooks/useJQEL';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { cn } from '@/lib/utils';
import { evaluateTemplate } from '@/lib/templateEngine';
import type { FeatureItem, CardEffect } from '../../types';
import { validateAllowedSchema } from '../../types';
import { AnimatedCard } from '../AnimatedCard';

// ============================================================================
// Types
// ============================================================================

interface DynamicFeatureCardProps {
  item: FeatureItem;
  columns?: number;
  variant?: 'default' | 'bordered' | 'ghost' | 'elevated';
  effect?: CardEffect;
  index?: number;
}

interface ProcessedCardData {
  icon?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  badge?: string;
  badgeAnimated?: boolean;
  backContent?: string;
  link?: FeatureItem['link'];
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get Lucide icon component by name
 */
function getIcon(iconName?: string): React.ComponentType<any> | null {
  if (!iconName) return null;

  // Handle special cases
  if (iconName === 'default' || iconName === '') {
    return LucideIcons.Package;
  }

  // Convert kebab-case to PascalCase
  // e.g., "align-horizontal-distribute-start" -> "AlignHorizontalDistributeStart"
  const pascalCaseName = iconName
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');

  // Get icon from Lucide (try PascalCase first, then original)
  const Icon = (LucideIcons as any)[pascalCaseName] || (LucideIcons as any)[iconName];
  if (!Icon) {
    console.warn(`Icon "${iconName}" (converted to "${pascalCaseName}") not found in Lucide icons`);
    return LucideIcons.HelpCircle;
  }

  return Icon;
}

/**
 * Process template mappings against data
 */
function processTemplateData(
  data: Record<string, unknown>,
  mapping?: FeatureItem['datasource']['mapping']
): ProcessedCardData {
  if (!mapping) return {};

  const processed: ProcessedCardData = {};

  // Process each mapping field
  for (const [key, template] of Object.entries(mapping)) {
    if (template && typeof template === 'string') {
      const value = evaluateTemplate(template, data, { escapeHtml: true });
      (processed as any)[key] = value;
    }
  }

  return processed;
}

/**
 * Merge static config with dynamic data
 */
function mergeCardData(
  staticItem: FeatureItem,
  dynamicData: ProcessedCardData
): ProcessedCardData {
  return {
    icon: dynamicData.icon || staticItem.icon,
    title: dynamicData.title || staticItem.title,
    subtitle: dynamicData.subtitle || staticItem.subtitle,
    description: dynamicData.description || staticItem.description,
    badge: dynamicData.badge || staticItem.badge,
    badgeAnimated: staticItem.badgeAnimated,
    backContent: dynamicData.backContent || staticItem.backContent,
    link: staticItem.link, // Always use static link for security
  };
}

// ============================================================================
// Sub-components
// ============================================================================

/**
 * Loading skeleton for card
 */
const CardSkeleton: React.FC<{ columns?: number }> = ({ columns = 3 }) => {
  const height = columns >= 4 ? 'h-32' : 'h-48';

  return (
    <Card className={cn('animate-pulse', height)}>
      <CardHeader>
        <Skeleton className="h-4 w-20 mb-2" />
        <Skeleton className="h-6 w-32" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-3/4" />
      </CardContent>
    </Card>
  );
};

/**
 * Error card display
 */
const ErrorCard: React.FC<{ message?: string; onRetry?: () => void }> = ({
  message = 'Failed to load content',
  onRetry,
}) => {
  return (
    <Card className="border-destructive/50 bg-destructive/5">
      <CardHeader>
        <div className="flex items-center gap-2 text-destructive">
          <AlertCircle className="h-5 w-5" />
          <CardTitle className="text-base">Error</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-2 text-sm text-primary hover:underline"
          >
            Try again
          </button>
        )}
      </CardContent>
    </Card>
  );
};

/**
 * Single card renderer
 */
const SingleCard: React.FC<{
  data: ProcessedCardData;
  variant?: DynamicFeatureCardProps['variant'];
  effect?: CardEffect;
  columns?: number;
}> = ({ data, variant = 'default', effect = 'none', columns }) => {
  const Icon = getIcon(data.icon);

  const cardContent = (
    <>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {Icon && (
              <div className="p-2 rounded-lg bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
              </div>
            )}
            <div>
              {data.badge && (
                <Badge
                  variant="secondary"
                  className={cn(
                    'mb-1',
                    data.badgeAnimated && 'animate-pulse'
                  )}
                >
                  {data.badge}
                </Badge>
              )}
              <CardTitle className="text-lg">{data.title || 'Untitled'}</CardTitle>
              {data.subtitle && (
                <p className="text-sm text-muted-foreground mt-1">{data.subtitle}</p>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      {data.description && (
        <CardContent>
          <CardDescription>{data.description}</CardDescription>
        </CardContent>
      )}
    </>
  );

  const cardClasses = cn(
    'transition-all duration-200',
    variant === 'bordered' && 'border-2',
    variant === 'ghost' && 'border-0 shadow-none',
    variant === 'elevated' && 'shadow-lg',
    columns && columns >= 4 && 'h-full min-h-[150px]',
    columns && columns < 4 && 'h-full min-h-[200px]'
  );

  // If effect requires AnimatedCard
  if (effect === 'flip-hover' && data.backContent) {
    return (
      <AnimatedCard
        effect={effect}
        className={cardClasses}
        backContent={<div className="p-6">{data.backContent}</div>}
      >
        {cardContent}
      </AnimatedCard>
    );
  }

  // Regular card with hover effects
  const hoverClasses = cn(
    effect === 'hover-lift' && 'hover:scale-105 hover:shadow-xl',
    effect === 'glow' && 'hover:shadow-primary/25 hover:shadow-xl',
    effect === 'border' && 'hover:border-primary'
  );

  return (
    <Card className={cn(cardClasses, hoverClasses)}>
      {cardContent}
    </Card>
  );
};

// ============================================================================
// Main Component
// ============================================================================

export const DynamicFeatureCard: React.FC<DynamicFeatureCardProps> = ({
  item,
  columns = 3,
  variant = 'default',
  effect = 'none',
  index = 0,
}) => {
  // If static item, render directly
  if (!item.datasource || item.datasource.type === 'static') {
    const staticData: ProcessedCardData = {
      icon: item.icon,
      title: item.title,
      subtitle: item.subtitle,
      description: item.description,
      badge: item.badge,
      badgeAnimated: item.badgeAnimated,
      backContent: item.backContent,
      link: item.link,
    };

    return (
      <SingleCard
        data={staticData}
        variant={variant}
        effect={effect || item.hover}
        columns={columns}
      />
    );
  }

  // Validate schema security
  if (item.datasource.query && !validateAllowedSchema(item.datasource.query.schema)) {
    return (
      <ErrorCard message={`Schema "${item.datasource.query.schema}" is not allowed`} />
    );
  }

  // Fetch data via JQEL
  const { data: result, isLoading, isError, refetch } = useJQELQuery(
    item.datasource.query!,
    {
      enabled: !!item.datasource.query,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    }
  );

  // Loading state
  if (isLoading) {
    return <CardSkeleton columns={columns} />;
  }

  // Error state
  if (isError || !result?.data) {
    return (
      <ErrorCard
        message="Failed to load dynamic content"
        onRetry={() => refetch()}
      />
    );
  }

  // Process results
  const items = item.datasource.multiple
    ? Array.isArray(result.data)
      ? result.data
      : [result.data]
    : [Array.isArray(result.data) ? result.data[0] : result.data];

  // Apply limit if specified
  const limitedItems = item.datasource.limit
    ? items.slice(0, item.datasource.limit)
    : items;

  // No data
  if (limitedItems.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex items-center justify-center h-32 text-muted-foreground">
          No data available
        </CardContent>
      </Card>
    );
  }

  // Render cards
  return (
    <>
      {limitedItems.map((dataItem, idx) => {
        const dynamicData = processTemplateData(dataItem, item.datasource!.mapping);
        const mergedData = mergeCardData(item, dynamicData);

        return (
          <SingleCard
            key={`dynamic-${index}-${idx}`}
            data={mergedData}
            variant={variant}
            effect={effect || item.hover}
            columns={columns}
          />
        );
      })}
    </>
  );
};

// ============================================================================
// Exports
// ============================================================================

export default DynamicFeatureCard;