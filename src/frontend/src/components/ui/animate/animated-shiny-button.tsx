import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface AnimatedShinyButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  shimmerColor?: string;
}

export function AnimatedShinyButton({
  children,
  className,
  shimmerColor = 'rgba(255, 255, 255, 0.5)',
  onClick,
  disabled,
  type = 'button',
  ...props
}: AnimatedShinyButtonProps) {
  return (
    <motion.div
      className={cn(
        'group relative inline-flex items-center justify-center overflow-hidden rounded-md',
        'bg-gradient-to-r from-primary to-primary/80',
        'text-primary-foreground shadow-lg hover:shadow-xl',
        className
      )}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
    >
      <motion.div
        className="absolute inset-0 flex h-full w-full justify-center"
        initial={{ x: '-100%' }}
        animate={{ x: '100%' }}
        transition={{
          repeat: Infinity,
          repeatType: 'loop',
          duration: 3,
          ease: 'linear',
        }}
      >
        <div
          className="h-full w-1/3 rotate-12 blur-xl"
          style={{
            background: `linear-gradient(90deg, transparent, ${shimmerColor}, transparent)`,
          }}
        />
      </motion.div>
      <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        className="relative z-10 w-full px-6 py-3 font-medium transition-all"
        {...props}
      >
        {children}
      </button>
    </motion.div>
  );
}
