/**
 * HomepagePreview Component
 *
 * Preview em tempo real da Homepage para uso no Setup Module.
 * Aceita config via props (não faz fetch via JQEL) e aplica scale transform.
 *
 * @see spec/SPEC-module-homepage.md - SPEC-M-HP-INT-006 a SPEC-M-HP-INT-008
 */

import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { HeroSection } from '../sections/HeroSection';
import { FeaturesSection } from '../sections/FeaturesSection';
import { PortalsSection } from '../sections/PortalsSection';
import { CTASection } from '../sections/CTASection';
import type { HomepageConfig, SectionConfig } from '../../types';

export interface HomepagePreviewProps {
  /**
   * Configuração da homepage (passada diretamente, não busca via JQEL)
   */
  config: HomepageConfig;

  /**
   * Tema do preview
   * @default 'light'
   */
  theme?: 'light' | 'dark';

  /**
   * Escala do preview (0.0 a 1.0)
   * @default 0.5
   */
  scale?: number;

  /**
   * Largura base do preview (px)
   * @default 1440
   */
  baseWidth?: number;

  /**
   * Altura base do preview (px)
   * @default 1024
   */
  baseHeight?: number;

  /**
   * Classes CSS adicionais
   */
  className?: string;
}

/**
 * HomepagePreview - Preview em tempo real para Setup Module
 *
 * @example
 * ```tsx
 * const [config, setConfig] = useState<HomepageConfig>(...);
 *
 * <HomepagePreview
 *   config={config}
 *   theme="light"
 *   scale={0.5}
 * />
 * ```
 */
export function HomepagePreview({
  config,
  theme = 'light',
  scale = 0.5,
  baseWidth = 1440,
  baseHeight = 1024,
  className,
}: HomepagePreviewProps) {
  // Filtrar seções habilitadas
  const enabledSections = useMemo(() => {
    if (!config?.sections) return [];
    return config.sections.filter((section) => section.enabled);
  }, [config?.sections]);

  // Aplicar tema
  const themeClass = theme === 'dark' ? 'dark' : 'light';

  // Calcular dimensões escaladas
  const scaledWidth = baseWidth * scale;
  const scaledHeight = baseHeight * scale;

  return (
    <div
      className={cn('homepage-preview-wrapper', className)}
      style={{
        width: `${scaledWidth}px`,
        height: `${scaledHeight}px`,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <div
        className={cn('homepage-preview', themeClass)}
        style={{
          width: `${baseWidth}px`,
          height: `${baseHeight}px`,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          overflow: 'auto',
          backgroundColor: theme === 'dark' ? 'hsl(224 71% 4%)' : 'hsl(0 0% 100%)',
          color: theme === 'dark' ? 'hsl(213 31% 91%)' : 'hsl(224 71% 4%)',
        }}
      >
        {/* Renderizar seções */}
        {enabledSections.length > 0 ? (
          <main className="homepage">
            {enabledSections.map((section: SectionConfig, index) => {
              const key = `preview-${section.type}-${index}`;

              switch (section.type) {
                case 'hero':
                  return <HeroSection key={key} config={section} />;

                case 'features':
                  return <FeaturesSection key={key} config={section} />;

                case 'portals':
                  return <PortalsSection key={key} config={section} />;

                case 'cta':
                  return <CTASection key={key} config={section} />;

                default:
                  return null;
              }
            })}
          </main>
        ) : (
          // Empty state
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-2 p-8">
              <p className="text-muted-foreground text-sm">
                No sections enabled
              </p>
              <p className="text-xs text-muted-foreground/70">
                Enable sections to see the preview
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * HomepagePreviewFullscreen
 *
 * Versão fullscreen do preview (escala 1.0) para visualização detalhada.
 */
export function HomepagePreviewFullscreen({
  config,
  theme = 'light',
  className,
}: Omit<HomepagePreviewProps, 'scale' | 'baseWidth' | 'baseHeight'>) {
  return (
    <HomepagePreview
      config={config}
      theme={theme}
      scale={1.0}
      className={className}
    />
  );
}
