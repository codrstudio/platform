import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import type { ReactNode } from 'react';

interface CardFlipHoverProps {
  frontContent: ReactNode;
  backContent: ReactNode;
  className?: string;
  flipOnClick?: boolean;
}

export function CardFlipHover({
  frontContent,
  backContent,
  className,
  flipOnClick = false,
}: CardFlipHoverProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleInteraction = () => {
    if (flipOnClick) {
      setIsFlipped((prev) => !prev);
    }
  };

  return (
    <div
      className={cn('relative h-full w-full', className)}
      style={{ perspective: '1000px' }}
      onMouseEnter={() => !flipOnClick && setIsFlipped(true)}
      onMouseLeave={() => !flipOnClick && setIsFlipped(false)}
      onClick={handleInteraction}
    >
      <motion.div
        className="relative h-full w-full"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 h-full w-full backface-hidden"
          style={{ backfaceVisibility: 'hidden' }}
        >
          {frontContent}
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 h-full w-full backface-hidden"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          {backContent}
        </div>
      </motion.div>
    </div>
  );
}
