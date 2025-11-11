import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GradualSpacingTextProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
}

export function GradualSpacingText({
  text,
  className,
  delay = 0,
  duration = 0.8
}: GradualSpacingTextProps) {
  const letters = text.split('');

  return (
    <motion.span className={cn('inline-block', className)}>
      {letters.map((letter, index) => (
        <motion.span
          key={`${letter}-${index}`}
          className="inline-block"
          initial={{ letterSpacing: '0.5em', opacity: 0 }}
          animate={{ letterSpacing: '0em', opacity: 1 }}
          transition={{
            duration,
            delay: delay + index * 0.03,
            ease: 'easeOut',
          }}
          style={{ whiteSpace: letter === ' ' ? 'pre' : 'normal' }}
        >
          {letter}
        </motion.span>
      ))}
    </motion.span>
  );
}
