import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SVGRippleEffectProps {
  className?: string;
  color?: string;
  opacity?: number;
  duration?: number;
}

export function SVGRippleEffect({
  className,
  color = 'currentColor',
  opacity = 0.3,
  duration = 3,
}: SVGRippleEffectProps) {
  const ripples = [0, 1, 2];

  return (
    <div className={cn('pointer-events-none absolute inset-0 flex items-center justify-center', className)}>
      <svg className="h-full w-full" viewBox="0 0 1000 1000">
        {ripples.map((index) => (
          <motion.circle
            key={index}
            cx="500"
            cy="500"
            r="0"
            stroke={color}
            strokeWidth="2"
            fill="none"
            style={{ opacity }}
            animate={{
              r: [0, 400],
              opacity: [opacity, 0],
            }}
            transition={{
              duration,
              repeat: Infinity,
              delay: index * (duration / ripples.length),
              ease: 'easeOut',
            }}
          />
        ))}
      </svg>
    </div>
  );
}
