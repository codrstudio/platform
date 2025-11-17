/**
 * AnimatedCard Component
 *
 * Card with animation effects and flip capability
 */

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import type { CardEffect } from '../types';

interface AnimatedCardProps {
  children: React.ReactNode;
  effect?: CardEffect;
  backContent?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  effect = 'none',
  backContent,
  className,
  onClick,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);

  // Flip card effect
  if (effect === 'flip-hover' && backContent) {
    return (
      <div
        className={cn('relative preserve-3d h-full', className)}
        style={{ perspective: '1000px' }}
        onMouseEnter={() => setIsFlipped(true)}
        onMouseLeave={() => setIsFlipped(false)}
        onClick={onClick}
      >
        <motion.div
          className="w-full h-full"
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, type: 'spring' }}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Front */}
          <Card
            className={cn(
              'absolute inset-0 w-full h-full backface-hidden',
              className
            )}
            style={{ backfaceVisibility: 'hidden' }}
          >
            {children}
          </Card>

          {/* Back */}
          <Card
            className={cn(
              'absolute inset-0 w-full h-full backface-hidden',
              className
            )}
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            {backContent}
          </Card>
        </motion.div>
      </div>
    );
  }

  // Hover lift effect
  if (effect === 'hover-lift') {
    return (
      <motion.div
        whileHover={{ scale: 1.05, y: -8 }}
        transition={{ type: 'spring', stiffness: 300 }}
        onClick={onClick}
      >
        <Card className={cn('transition-shadow hover:shadow-xl', className)}>
          {children}
        </Card>
      </motion.div>
    );
  }

  // Glow effect
  if (effect === 'glow') {
    return (
      <Card
        className={cn(
          'transition-all duration-300 hover:shadow-xl hover:shadow-primary/25',
          className
        )}
        onClick={onClick}
      >
        {children}
      </Card>
    );
  }

  // Border effect
  if (effect === 'border') {
    return (
      <Card
        className={cn(
          'transition-all duration-300 hover:border-primary',
          className
        )}
        onClick={onClick}
      >
        {children}
      </Card>
    );
  }

  // No effect
  return (
    <Card className={className} onClick={onClick}>
      {children}
    </Card>
  );
};

export default AnimatedCard;