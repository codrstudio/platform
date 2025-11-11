import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { badgeVariants, type BadgeProps } from '@/components/ui/badge';

export interface AnimatedBadgeProps extends BadgeProps {
  delay?: number;
  duration?: number;
}

export function AnimatedBadge({
  className,
  variant,
  delay = 0,
  duration = 0.5,
  children,
  ...props
}: AnimatedBadgeProps) {
  return (
    <motion.div
      className={cn(badgeVariants({ variant }), className)}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        duration,
        delay,
        ease: [0.4, 0, 0.2, 1],
      }}
      whileHover={{ scale: 1.05 }}
    >
      <div {...props}>{children}</div>
    </motion.div>
  );
}
