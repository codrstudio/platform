import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

interface HackerBackgroundProps {
  className?: string;
  color?: string;
  opacity?: number;
  speed?: number;
}

export function HackerBackground({
  className,
  color = 'currentColor',
  opacity = 0.1,
  speed = 50,
}: HackerBackgroundProps) {
  const [characters, setCharacters] = useState<string[]>([]);

  useEffect(() => {
    const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
    const columns = Math.floor(window.innerWidth / 20);
    const newChars = Array.from({ length: columns * 20 }, () =>
      chars.charAt(Math.floor(Math.random() * chars.length))
    );
    setCharacters(newChars);
  }, []);

  return (
    <div
      className={cn('pointer-events-none absolute inset-0 overflow-hidden font-mono', className)}
      style={{ opacity, color }}
    >
      <div className="flex flex-wrap">
        {characters.map((char, i) => (
          <motion.span
            key={i}
            className="inline-block text-xs"
            initial={{ opacity: 0, y: -20 }}
            animate={{
              opacity: [0, 1, 0],
              y: [0, 500],
            }}
            transition={{
              duration: speed,
              repeat: Infinity,
              delay: i * 0.1,
              ease: 'linear',
            }}
          >
            {char}
          </motion.span>
        ))}
      </div>
    </div>
  );
}
