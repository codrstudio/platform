import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface BlurInTextProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
}

export function BlurInText({
  text,
  className,
  delay = 0,
  duration = 0.8
}: BlurInTextProps) {
  return (
    <motion.span
      className={cn('inline-block', className)}
      initial={{ filter: 'blur(10px)', opacity: 0 }}
      animate={{ filter: 'blur(0px)', opacity: 1 }}
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
