import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface LetterPullUpTextProps {
  text: string;
  className?: string;
  delay?: number;
  staggerDelay?: number;
}

export function LetterPullUpText({
  text,
  className,
  delay = 0,
  staggerDelay = 0.03
}: LetterPullUpTextProps) {
  const letters = text.split('');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delay,
        staggerChildren: staggerDelay,
      },
    },
  };

  const letterVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: [0.6, 0.01, -0.05, 0.95],
      },
    },
  };

  return (
    <motion.span
      className={cn('inline-block', className)}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {letters.map((letter, index) => (
        <motion.span
          key={`${letter}-${index}`}
          className="inline-block"
          variants={letterVariants}
          style={{ whiteSpace: letter === ' ' ? 'pre' : 'normal' }}
        >
          {letter}
        </motion.span>
      ))}
    </motion.span>
  );
}
