import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface FadeTextProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
}

export function FadeText({
  text,
  className,
  delay = 0,
  duration = 0.6,
  direction = 'up'
}: FadeTextProps) {
  const directionOffset = {
    up: { y: 20 },
    down: { y: -20 },
    left: { x: 20 },
    right: { x: -20 },
    none: {},
  };

  return (
    <motion.span
      className={cn('inline-block', className)}
      initial={{ opacity: 0, ...directionOffset[direction] }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      transition={{
        duration,
        delay,
        ease: 'easeOut',
      }}
    >
      {text}
    </motion.span>
  );
}
