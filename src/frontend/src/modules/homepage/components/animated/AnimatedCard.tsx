import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { CardFlipHover } from '@/components/ui/animate';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useHomepageConfigContext } from '../../contexts/HomepageConfigContext';

export type CardEffect = 'flip-hover' | 'hover-lift' | 'none';

export interface AnimatedCardProps {
  frontContent: ReactNode;
  backContent?: ReactNode;
  effect?: CardEffect;
  className?: string;
  flipOnClick?: boolean;
}

export function AnimatedCard({
  frontContent,
  backContent,
  effect = 'none',
  className,
  flipOnClick = false,
}: AnimatedCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const { config } = useHomepageConfigContext();

  // Sem animações
  if (prefersReducedMotion || !config?.animations?.enabled || effect === 'none') {
    return <div className={className}>{frontContent}</div>;
  }

  // Flip effect
  if (effect === 'flip-hover' && backContent) {
    return (
      <CardFlipHover
        frontContent={frontContent}
        backContent={backContent}
        className={className}
        flipOnClick={flipOnClick}
      />
    );
  }

  // Hover lift effect
  if (effect === 'hover-lift') {
    const intensity = config.animations.intensity || 'normal';
    const liftAmount = {
      subtle: -4,
      normal: -8,
      intense: -12,
    }[intensity];

    return (
      <motion.div
        className={cn('cursor-pointer', className)}
        whileHover={{
          y: liftAmount,
          transition: { duration: 0.2, ease: 'easeOut' },
        }}
        whileTap={{ scale: 0.98 }}
      >
        {frontContent}
      </motion.div>
    );
  }

  // Fallback
  return <div className={className}>{frontContent}</div>;
}
