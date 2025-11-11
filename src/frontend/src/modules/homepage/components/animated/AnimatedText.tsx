import {
  BlurInText,
  LetterPullUpText,
  FadeText,
  GradualSpacingText,
} from '@/components/ui/animate';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useHomepageConfigContext } from '../../contexts/HomepageConfigContext';

export type AnimationType = 'blur-in' | 'pull-up' | 'fade' | 'gradual-spacing';

export interface AnimatedTextProps {
  text: string;
  type: AnimationType;
  className?: string;
  delay?: number;
}

export function AnimatedText({
  text,
  type,
  className,
  delay = 0,
}: AnimatedTextProps) {
  const prefersReducedMotion = useReducedMotion();
  const { config } = useHomepageConfigContext();

  // Fallback se animações desabilitadas ou reduced motion
  if (prefersReducedMotion || !config?.animations?.enabled) {
    return <span className={className}>{text}</span>;
  }

  // Ajustar delay baseado na intensidade
  const intensity = config.animations.intensity || 'normal';
  const adjustedDelay = {
    subtle: delay ? delay * 0.5 : 0,
    normal: delay || 0,
    intense: delay ? delay * 1.5 : 0,
  }[intensity];

  // Renderizar componente apropriado baseado no tipo
  switch (type) {
    case 'blur-in':
      return (
        <BlurInText
          text={text}
          className={className}
          delay={adjustedDelay}
          duration={intensity === 'subtle' ? 0.5 : intensity === 'intense' ? 1.2 : 0.8}
        />
      );

    case 'pull-up':
      return (
        <LetterPullUpText
          text={text}
          className={className}
          delay={adjustedDelay}
          staggerDelay={intensity === 'subtle' ? 0.02 : intensity === 'intense' ? 0.05 : 0.03}
        />
      );

    case 'fade':
      return (
        <FadeText
          text={text}
          className={className}
          delay={adjustedDelay}
          duration={intensity === 'subtle' ? 0.4 : intensity === 'intense' ? 0.9 : 0.6}
          direction="up"
        />
      );

    case 'gradual-spacing':
      return (
        <GradualSpacingText
          text={text}
          className={className}
          delay={adjustedDelay}
          duration={intensity === 'subtle' ? 0.5 : intensity === 'intense' ? 1.2 : 0.8}
        />
      );

    default:
      return <span className={className}>{text}</span>;
  }
}
