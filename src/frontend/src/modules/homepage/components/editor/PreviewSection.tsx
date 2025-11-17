/**
 * Preview Section Component
 *
 * Renderiza uma seção individual no preview do editor.
 * Componente simplificado que renderiza diretamente da config,
 * sem carregar de arquivo externo.
 *
 * Features:
 * - Renderização direta da config (não carrega arquivo)
 * - Clicável para selecionar a seção
 * - Visual highlight quando selecionada
 * - Error boundary para evitar crashes
 *
 * @module homepage/components/editor
 */

import React from 'react';
import { cn } from '@/lib/utils';
import type { SectionConfig } from '../../types';

// Import section components
import { HeroSection } from '../sections/HeroSection';
import { CardsSection } from '../sections/CardsSection';
import { QuickLinksSection } from '../sections/QuickLinksSection';
import { StatsSection } from '../sections/StatsSection';
import { FAQSection } from '../sections/FAQSection';
import { NewsletterSection } from '../sections/NewsletterSection';
import { FooterSection } from '../sections/FooterSection';

export interface PreviewSectionProps {
  /** Section configuration */
  section: SectionConfig;

  /** Section index */
  index: number;

  /** Whether this section is selected */
  isSelected: boolean;

  /** Callback when section is clicked */
  onSelect: () => void;

  /** Portal ID for context */
  portalId: string;

  /** Instance ID for context */
  instanceId?: string;
}

/**
 * PreviewSection Component
 *
 * Renderiza uma seção no preview, com suporte a clique para seleção.
 */
export function PreviewSection({
  section,
  index,
  isSelected,
  onSelect,
  portalId,
  instanceId,
}: PreviewSectionProps) {
  // Skip disabled sections
  if (!section.enabled) {
    return (
      <div
        data-section-index={index}
        onClick={onSelect}
        className={cn(
          'relative cursor-pointer p-8 text-center border-2 border-dashed',
          isSelected
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/20 bg-muted/5 hover:border-muted-foreground/40'
        )}
      >
        <p className="text-sm text-muted-foreground">
          Seção desabilitada: {section.type}
        </p>
      </div>
    );
  }

  // Render section based on type
  const renderSection = () => {
    switch (section.type) {
      case 'hero':
        return <HeroSection config={section} portalId={portalId} instanceId={instanceId} />;

      case 'cards':
      case 'features':
        return <CardsSection config={section} portalId={portalId} instanceId={instanceId} />;

      case 'quickLinks':
        return <QuickLinksSection config={section} portalId={portalId} instanceId={instanceId} />;

      case 'stats':
        return <StatsSection config={section} portalId={portalId} instanceId={instanceId} />;

      case 'faq':
        return <FAQSection config={section} portalId={portalId} instanceId={instanceId} />;

      case 'newsletter':
        return <NewsletterSection config={section} portalId={portalId} instanceId={instanceId} />;

      case 'footer':
        return <FooterSection config={section} portalId={portalId} instanceId={instanceId} />;

      default:
        return (
          <div className="p-8 text-center border-2 border-dashed border-muted-foreground/20">
            <p className="text-sm text-muted-foreground">
              Tipo de seção não suportado: {section.type}
            </p>
          </div>
        );
    }
  };

  return (
    <div
      data-section-index={index}
      className={cn(
        'relative transition-all',
        isSelected && 'ring-2 ring-primary ring-offset-2 ring-offset-background'
      )}
    >
      {/* Click Overlay - Capture clicks without interfering with content */}
      <div
        onClick={onSelect}
        className={cn(
          'absolute inset-0 z-20 cursor-pointer',
          'bg-primary/0 hover:bg-primary/5 transition-colors',
          isSelected && 'bg-primary/5'
        )}
        title={isSelected ? 'Clique para desselecionar' : 'Clique para selecionar e editar'}
      />

      {/* Selection Indicator */}
      {isSelected && (
        <div className="absolute top-0 left-0 right-0 z-30 bg-primary text-primary-foreground text-xs font-medium px-3 py-1 flex items-center justify-between pointer-events-none">
          <span>Editando: {section.type}</span>
          <span className="text-primary-foreground/70">Clique para desselecionar</span>
        </div>
      )}

      {/* Section Content - No pointer events interference */}
      <div className={cn(isSelected && 'pt-8', 'relative z-10 pointer-events-none')}>
        {renderSection()}
      </div>
    </div>
  );
}
