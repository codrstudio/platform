/**
 * HeroSection Component
 *
 * Hero section with flexible background options:
 * - Solid colors
 * - Transparent background
 * - Gradients (linear/radial)
 * - Images (with overlay and parallax)
 * - Videos (background video support)
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { NavigationButton } from '../shared/LinkHandler';
import type { HeroSectionConfig } from '../../types';

interface HeroSectionProps {
  config: HeroSectionConfig;
  portalId?: string;
  instanceId?: string;
}

/**
 * Render background based on configuration
 */
const BackgroundRenderer: React.FC<{
  background: HeroSectionConfig['background'];
  className?: string;
}> = ({ background, className }) => {
  if (!background || background.type === 'transparent') {
    return null;
  }

  // Solid color background
  if (background.type === 'solid') {
    return (
      <div
        className={cn('absolute inset-0', className)}
        style={{ backgroundColor: background.color }}
      />
    );
  }

  // Gradient background
  if (background.type === 'gradient' && background.gradient) {
    const { from, to, direction = 'to-r' } = background.gradient;
    const gradientStyle =
      direction === 'radial'
        ? `radial-gradient(circle, ${from}, ${to})`
        : direction === 'to-r'
        ? `linear-gradient(to right, ${from}, ${to})`
        : direction === 'to-l'
        ? `linear-gradient(to left, ${from}, ${to})`
        : direction === 'to-b'
        ? `linear-gradient(to bottom, ${from}, ${to})`
        : direction === 'to-t'
        ? `linear-gradient(to top, ${from}, ${to})`
        : direction === 'to-br'
        ? `linear-gradient(to bottom right, ${from}, ${to})`
        : direction === 'to-bl'
        ? `linear-gradient(to bottom left, ${from}, ${to})`
        : direction === 'to-tr'
        ? `linear-gradient(to top right, ${from}, ${to})`
        : `linear-gradient(to top left, ${from}, ${to})`;

    return (
      <div
        className={cn('absolute inset-0', className)}
        style={{ background: gradientStyle }}
      />
    );
  }

  // Image background
  if (background.type === 'image' && background.image) {
    const { url, position = 'center', size = 'cover', overlay, parallax = false } = background.image;

    return (
      <>
        <div
          className={cn(
            'absolute inset-0',
            parallax && 'fixed',
            className
          )}
          style={{
            backgroundImage: `url(${url})`,
            backgroundPosition: position,
            backgroundSize: size,
            backgroundRepeat: 'no-repeat',
          }}
        />
        {overlay && (
          <div
            className="absolute inset-0"
            style={{
              backgroundColor: overlay.color,
              opacity: overlay.opacity || 0.5,
            }}
          />
        )}
      </>
    );
  }

  // Video background
  if (background.type === 'video' && background.video) {
    const { url, poster, muted = true, loop = true, autoPlay = true, overlay } = background.video;

    return (
      <>
        <video
          className={cn('absolute inset-0 w-full h-full object-cover', className)}
          src={url}
          poster={poster}
          muted={muted}
          loop={loop}
          autoPlay={autoPlay}
          playsInline
        >
          <source src={url} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        {overlay && (
          <div
            className="absolute inset-0"
            style={{
              backgroundColor: overlay.color,
              opacity: overlay.opacity || 0.5,
            }}
          />
        )}
      </>
    );
  }

  return null;
};

/**
 * Hero content size classes
 */
function getContentSizeClass(size?: string): string {
  switch (size) {
    case 'sm':
      return 'py-12 md:py-16';
    case 'md':
      return 'py-16 md:py-24';
    case 'lg':
      return 'py-24 md:py-32';
    case 'xl':
      return 'py-32 md:py-48';
    case 'full':
      return 'min-h-screen flex items-center';
    default:
      return 'py-16 md:py-24';
  }
}

/**
 * Text alignment classes
 */
function getAlignmentClass(alignment?: string): string {
  switch (alignment) {
    case 'left':
      return 'text-left items-start';
    case 'center':
      return 'text-center items-center';
    case 'right':
      return 'text-right items-end';
    default:
      return 'text-center items-center';
  }
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  config,
  portalId,
  instanceId,
}) => {
  if (!config.enabled) return null;

  const size = config.size || 'md';
  const alignment = config.alignment || 'center';
  const hasBackground = config.background && config.background.type !== 'transparent';

  return (
    <section
      id="hero"
      className={cn(
        'relative overflow-hidden',
        hasBackground && 'bg-background',
        config.className
      )}
    >
      {/* Background Layer */}
      <BackgroundRenderer background={config.background} />

      {/* Content Layer */}
      <div
        className={cn(
          'relative z-10',
          getContentSizeClass(size)
        )}
      >
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className={cn('flex flex-col gap-6', getAlignmentClass(alignment))}>
            {/* Badge */}
            {config.badge && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5 }}
              >
                <span className={cn(
                  'inline-block px-3 py-1 rounded-full text-sm font-medium',
                  'bg-primary/10 text-primary border border-primary/20'
                )}>
                  {config.badge}
                </span>
              </motion.div>
            )}

            {/* Title */}
            {config.title && (
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className={cn(
                  'font-bold tracking-tight',
                  size === 'sm' && 'text-3xl md:text-4xl',
                  size === 'md' && 'text-4xl md:text-5xl lg:text-6xl',
                  size === 'lg' && 'text-5xl md:text-6xl lg:text-7xl',
                  size === 'xl' && 'text-6xl md:text-7xl lg:text-8xl',
                  size === 'full' && 'text-5xl md:text-6xl lg:text-7xl'
                )}
              >
                {config.title}
              </motion.h1>
            )}

            {/* Subtitle */}
            {config.subtitle && (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className={cn(
                  'text-muted-foreground max-w-3xl',
                  alignment === 'center' && 'mx-auto',
                  size === 'sm' && 'text-lg md:text-xl',
                  size === 'md' && 'text-xl md:text-2xl',
                  size === 'lg' && 'text-2xl md:text-3xl',
                  size === 'xl' && 'text-3xl md:text-4xl',
                  size === 'full' && 'text-xl md:text-2xl'
                )}
              >
                {config.subtitle}
              </motion.p>
            )}

            {/* Description */}
            {config.description && (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className={cn(
                  'text-muted-foreground max-w-2xl',
                  alignment === 'center' && 'mx-auto'
                )}
              >
                {config.description}
              </motion.p>
            )}

            {/* CTA Buttons */}
            {config.actions && config.actions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className={cn(
                  'flex flex-wrap gap-4 mt-4',
                  alignment === 'center' && 'justify-center',
                  alignment === 'right' && 'justify-end'
                )}
              >
                {config.actions.map((action, index) => (
                  <NavigationButton
                    key={`hero-action-${index}`}
                    link={action.link}
                    variant={action.variant || (index === 0 ? 'default' : 'outline')}
                    size={size === 'xl' || size === 'full' ? 'lg' : 'default'}
                  >
                    {action.label}
                  </NavigationButton>
                ))}
              </motion.div>
            )}

            {/* Stats */}
            {config.stats && config.stats.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className={cn(
                  'grid gap-8 mt-8',
                  config.stats.length === 2 && 'grid-cols-2',
                  config.stats.length === 3 && 'grid-cols-3',
                  config.stats.length === 4 && 'grid-cols-2 md:grid-cols-4',
                  config.stats.length > 4 && 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
                )}
              >
                {config.stats?.map((stat, index) => (
                  <div
                    key={`hero-stat-${index}`}
                    className={cn(
                      'text-center',
                      alignment === 'left' && 'text-left',
                      alignment === 'right' && 'text-right'
                    )}
                  >
                    <div className="text-3xl md:text-4xl font-bold">
                      {stat.value}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {/* Features List */}
            {config.features && config.features.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className={cn(
                  'flex flex-wrap gap-6 mt-8',
                  alignment === 'center' && 'justify-center',
                  alignment === 'right' && 'justify-end'
                )}
              >
                {config.features.map((feature, index) => (
                  <div
                    key={`hero-feature-${index}`}
                    className="flex items-center gap-2"
                  >
                    <svg
                      className="h-5 w-5 text-primary"
                      fill="none"
                      strokeWidth="2"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-sm font-medium">{feature}</span>
                  </div>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;