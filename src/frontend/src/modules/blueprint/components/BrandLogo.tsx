import { Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BrandLogoProps {
  variant?: 'full' | 'icon-only';
  className?: string;
}

export function BrandLogo({ variant = 'full', className }: BrandLogoProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 font-semibold',
        variant === 'icon-only' && 'justify-center',
        className
      )}
    >
      <Home className="h-6 w-6" />
      {variant === 'full' && <span className="text-lg text-foreground">Blueprint</span>}
    </div>
  );
}
