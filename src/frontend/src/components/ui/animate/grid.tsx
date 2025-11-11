import { cn } from '@/lib/utils';

interface GridProps {
  className?: string;
  opacity?: number;
  color?: string;
  size?: number;
}

export function Grid({
  className,
  opacity = 0.2,
  color = 'currentColor',
  size = 50,
}: GridProps) {
  return (
    <div
      className={cn('pointer-events-none absolute inset-0', className)}
      style={{
        backgroundImage: `
          linear-gradient(${color} 1px, transparent 1px),
          linear-gradient(90deg, ${color} 1px, transparent 1px)
        `,
        backgroundSize: `${size}px ${size}px`,
        opacity,
      }}
    />
  );
}
