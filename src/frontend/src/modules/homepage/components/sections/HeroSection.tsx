/**
 * HeroSection Component
 *
 * Seção principal (Hero) da Homepage com suporte a dois layouts:
 * - centered: Conteúdo centralizado com texto e CTAs
 * - split: Layout de duas colunas (conteúdo + imagem)
 *
 * Suporta:
 * - Animações de texto configuráveis (blur-in, pull-up, fade, gradual-spacing)
 * - Background effects (grid ou none)
 * - Background image com overlay
 * - Múltiplos botões CTA com variantes
 *
 * @see spec/ui/SPEC-ui-homepage.md - Hero Section
 * @see spec/SPEC-module-homepage.md - SPEC-M-HP-SEC-001 a SPEC-M-HP-SEC-005
 */

import { cn } from '@/lib/utils';
import { Grid } from '@/components/ui/animate/grid';
import { AnimatedText } from '../animated/AnimatedText';
import { AnimatedShinyButton } from '@/components/ui/animate/animated-shiny-button';
import { Button } from '@/components/ui/button';
import type { HeroSectionConfig } from '../../types';
import * as LucideIcons from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export interface HeroSectionProps {
  config: HeroSectionConfig;
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
}: {
  button: HeroSectionConfig['ctaButtons'][0];
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

  // Renderizar AnimatedShinyButton para variante 'shiny'
  if (button.variant === 'shiny') {
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
  return (
    <Button
      size="lg"
      variant={button.variant === 'default' ? 'default' : button.variant}
      onClick={handleClick}
    >
      {IconComponent && <IconComponent className="mr-2 h-5 w-5" />}
      {button.label}
    </Button>
  );
}

/**
 * HeroSection - Seção principal da Homepage
 */
export function HeroSection({ config }: HeroSectionProps) {
  const isCentered = config.layout === 'centered';

  return (
    <section className="hero-section relative overflow-hidden min-h-[600px] md:min-h-[700px] flex items-center">
      {/* Background Effect (Grid) */}
      {config.backgroundEffect === 'grid' && (
        <Grid className="absolute inset-0" opacity={0.1} size={50} />
      )}

      {/* Background Image com Overlay */}
      {config.backgroundImage && (
        <div className="absolute inset-0 z-0">
          <img
            src={config.backgroundImage}
            alt="Hero background"
            className="w-full h-full object-cover"
          />
          {/* Overlay escuro para melhorar legibilidade */}
          <div className="absolute inset-0 bg-background/80" />
        </div>
      )}

      {/* Conteúdo */}
      <Container className="relative z-10 py-24 md:py-32 lg:py-40 w-full">
        {isCentered ? (
          // Layout Centered
          <div className="flex flex-col items-center text-center space-y-8">
            {/* Animated Title */}
            <AnimatedText
              text={config.title.text}
              type={config.title.animation}
              className="hero-title max-w-4xl text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight leading-tight"
              delay={0.2}
            />

            {/* Animated Subtitle */}
            <AnimatedText
              text={config.subtitle.text}
              type={config.subtitle.animation}
              className="hero-subtitle max-w-2xl text-lg md:text-xl lg:text-2xl text-muted-foreground"
              delay={0.4}
            />

            {/* CTA Buttons */}
            {config.ctaButtons.length > 0 && (
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                {config.ctaButtons.map((button, index) => (
                  <CTAButtonRenderer
                    key={`cta-${index}`}
                    button={button}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          // Layout Split
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Text Content (Left Column) */}
            <div className="space-y-6">
              <AnimatedText
                text={config.title.text}
                type={config.title.animation}
                className="hero-title text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-extrabold tracking-tight leading-tight"
                delay={0.2}
              />

              <AnimatedText
                text={config.subtitle.text}
                type={config.subtitle.animation}
                className="hero-subtitle text-base md:text-lg lg:text-xl text-muted-foreground"
                delay={0.4}
              />

              {config.ctaButtons.length > 0 && (
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  {config.ctaButtons.map((button, index) => (
                    <CTAButtonRenderer
                      key={`cta-${index}`}
                      button={button}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Visual Content (Right Column) */}
            <div className="relative">
              {config.backgroundImage ? (
                <img
                  src={config.backgroundImage}
                  alt="Hero illustration"
                  className="w-full h-auto rounded-lg shadow-2xl"
                />
              ) : (
                // Placeholder se não houver imagem configurada
                <div className="w-full aspect-video bg-muted rounded-lg flex items-center justify-center">
                  <span className="text-muted-foreground text-sm">
                    Hero Visual
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </Container>
    </section>
  );
}
