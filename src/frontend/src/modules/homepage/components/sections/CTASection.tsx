/**
 * CTASection Component
 *
 * Seção de Call-to-Action (CTA) da Homepage.
 *
 * Centralizada com:
 * - Título com animação configurável
 * - Descrição
 * - Background effect (ripple ou none)
 * - Botões primário e secundário (opcional)
 * - Trust indicators (checkmarks opcionais)
 *
 * @see spec/ui/SPEC-ui-homepage.md - CTA Section
 * @see spec/SPEC-module-homepage.md - SPEC-M-HP-SEC-014 a SPEC-M-HP-SEC-016
 */

import { cn } from '@/lib/utils';
import { SVGRippleEffect } from '@/components/ui/animate/svg-ripple-effect';
import { AnimatedText } from '../animated/AnimatedText';
import { AnimatedShinyButton } from '@/components/ui/animate/animated-shiny-button';
import { Button } from '@/components/ui/button';
import type { CTASectionConfig } from '../../types';
import * as LucideIcons from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export interface CTASectionProps {
  config: CTASectionConfig;
}

/**
 * Container genérico com max-width e padding responsivo
 */
function Container({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('container mx-auto px-4 md:px-6 lg:px-8', className)}>
      {children}
    </div>
  );
}

/**
 * Renderiza um botão CTA baseado na configuração
 */
function CTAButtonRenderer({
  button,
  isPrimary,
}: {
  button: CTASectionConfig['primaryButton'];
  isPrimary: boolean;
}) {
  const navigate = useNavigate();

  const handleClick = () => {
    switch (button.action) {
      case 'signup':
        navigate('/auth/signup');
        break;
      case 'login':
        navigate('/auth/login');
        break;
      case 'link':
        if (button.target) {
          navigate(button.target);
        }
        break;
      case 'external':
        if (button.url) {
          window.open(button.url, '_blank', 'noopener,noreferrer');
        }
        break;
      case 'scroll-to':
        if (button.target) {
          const element = document.querySelector(button.target);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }
        break;
    }
  };

  // Renderizar ícone Lucide se especificado
  const IconComponent = button.icon
    ? (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[
        button.icon
      ]
    : null;

  // Renderizar AnimatedShinyButton para primário com variante 'shiny'
  if (isPrimary && button.variant === 'shiny') {
    return (
      <AnimatedShinyButton
        onClick={handleClick}
        className="h-10 px-8 text-sm"
      >
        {IconComponent && <IconComponent className="mr-2 h-5 w-5" />}
        {button.label}
      </AnimatedShinyButton>
    );
  }

  // Renderizar Button normal para outras variantes
  // Filtrar apenas variantes válidas do shadcn Button
  const validVariant = ['default', 'outline', 'ghost'].includes(button.variant)
    ? (button.variant as 'default' | 'outline' | 'ghost')
    : 'default';

  return (
    <Button
      size="lg"
      variant={validVariant}
      onClick={handleClick}
    >
      {IconComponent && <IconComponent className="mr-2 h-5 w-5" />}
      {button.label}
    </Button>
  );
}

/**
 * CTASection - Call-to-Action final
 */
export function CTASection({ config }: CTASectionProps) {
  return (
    <section className="cta-section relative overflow-hidden py-24 md:py-32 bg-gradient-to-br from-primary/5 via-background to-accent/5">
      {/* Background Effect (Ripple) */}
      {config.backgroundEffect === 'ripple' && (
        <SVGRippleEffect
          opacity={0.15}
          color="hsl(var(--primary))"
          duration={4}
        />
      )}

      <Container className="relative z-10">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          {/* Title */}
          <AnimatedText
            text={config.title}
            type={config.titleAnimation}
            className="section-title text-3xl md:text-4xl lg:text-5xl font-bold"
            delay={0.2}
          />

          {/* Description */}
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
            {config.description}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <CTAButtonRenderer button={config.primaryButton} isPrimary={true} />

            {config.secondaryButton && (
              <CTAButtonRenderer
                button={config.secondaryButton}
                isPrimary={false}
              />
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
