import { AnimatedBadge as AnimatedBadgeBase } from '@/components/ui/animate';
import type { BadgeProps } from '@/components/ui/badge';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useHomepageConfigContext } from '../../contexts/HomepageConfigContext';
import { Badge } from '@/components/ui/badge';

export interface AnimatedBadgeWrapperProps extends BadgeProps {
  delay?: number;
}

export function AnimatedBadge({
  delay = 0,
  variant,
  className,
  children,
  ...props
}: AnimatedBadgeWrapperProps) {
  const prefersReducedMotion = useReducedMotion();
  const { config } = useHomepageConfigContext();

  // Fallback se animações desabilitadas ou reduced motion
  if (prefersReducedMotion || !config?.animations?.enabled) {
    return (
      <Badge variant={variant} className={className} {...props}>
        {children}
      </Badge>
    );
  }

  // Ajustar delay e duration baseado na intensidade
  const intensity = config.animations.intensity || 'normal';
  const adjustedDelay = {
    subtle: delay ? delay * 0.5 : 0,
    normal: delay || 0,
    intense: delay ? delay * 1.5 : 0,
  }[intensity];

  const duration = {
    subtle: 0.3,
    normal: 0.5,
    intense: 0.8,
  }[intensity];

  return (
    <AnimatedBadgeBase
      variant={variant}
      className={className}
      delay={adjustedDelay}
      duration={duration}
      {...props}
    >
      {children}
    </AnimatedBadgeBase>
  );
}
