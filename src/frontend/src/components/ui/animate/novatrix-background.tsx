import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface NovatrixBackgroundProps {
  className?: string;
  dotColor?: string;
  dotSize?: number;
  spacing?: number;
  opacity?: number;
}

export function NovatrixBackground({
  className,
  dotColor = 'currentColor',
  dotSize = 2,
  spacing = 30,
  opacity = 0.3,
}: NovatrixBackgroundProps) {
  const dots = Array.from({ length: 100 }, (_, i) => ({
    id: i,
    x: (i % 10) * spacing,
    y: Math.floor(i / 10) * spacing,
  }));

  return (
    <div className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}>
      <svg className="h-full w-full" style={{ opacity }}>
        {dots.map((dot) => (
          <motion.circle
            key={dot.id}
            cx={dot.x}
            cy={dot.y}
            r={dotSize}
            fill={dotColor}
            initial={{ opacity: 0.3 }}
            animate={{
              opacity: [0.3, 1, 0.3],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: dot.id * 0.05,
              ease: 'easeInOut',
            }}
          />
        ))}
      </svg>
    </div>
  );
}
