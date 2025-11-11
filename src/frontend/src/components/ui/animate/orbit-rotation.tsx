import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface OrbitRotationProps {
  items: ReactNode[];
  className?: string;
  radius?: number;
  duration?: number;
  reverse?: boolean;
}

export function OrbitRotation({
  items,
  className,
  radius = 200,
  duration = 20,
  reverse = false,
}: OrbitRotationProps) {
  const angleStep = (2 * Math.PI) / items.length;

  return (
    <div
      className={cn('relative', className)}
      style={{ width: radius * 2, height: radius * 2 }}
    >
      <motion.div
        className="absolute inset-0"
        animate={{ rotate: reverse ? -360 : 360 }}
        transition={{
          duration,
          repeat: Infinity,
          ease: 'linear',
        }}
      >
        {items.map((item, index) => {
          const angle = angleStep * index;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;

          return (
            <motion.div
              key={index}
              className="absolute"
              style={{
                left: '50%',
                top: '50%',
                transform: `translate(${x}px, ${y}px) translate(-50%, -50%)`,
              }}
              animate={{ rotate: reverse ? 360 : -360 }}
              transition={{
                duration,
                repeat: Infinity,
                ease: 'linear',
              }}
            >
              {item}
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
