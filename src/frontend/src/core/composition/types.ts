import type { ComponentType } from 'react';

// Tipos de slots disponíveis no sistema de composição
export type SlotType = 'navbar' | 'sidebar' | 'companion' | 'breadcrumb' | 'footer';

// Largura do layout (unificado)
export type LayoutWidth = 'full' | 'lg' | 'md' | 'sm';

/**
 * Componente que pode ser renderizado em um slot específico
 */
export interface SlotComponent {
  /** Tipo do slot onde o componente será renderizado */
  slot: SlotType;

  /** ID único do componente */
  componentId: string;

  /** Componente React a ser renderizado */
  component: ComponentType;

  /** ID do módulo/plataforma que fornece o componente */
  providedBy: string;

  /** Nome amigável do componente */
  name: string;

  /** Metadados adicionais opcionais */
  metadata?: Record<string, any>;
}

/**
 * Definição de uma composição de layout
 */
export interface Composition {
  /** ID único da composição */
  id: string;

  /** Nome amigável da composição */
  name: string;

  /** ID do módulo/plataforma que fornece a composição */
  providedBy: string;

  /** Definição de quais slots estão ativos nesta composição */
  slots: {
    navbar?: boolean;
    sidebar?: boolean;
    companion?: boolean;
    breadcrumb?: boolean;
    /** Desktop é sempre obrigatório (área principal de conteúdo) */
    desktop: true;
    footer?: boolean;
  };

  /** Mapeamento de slots para IDs de componentes */
  components: {
    navbar?: string;
    sidebar?: string;
    companion?: string;
    breadcrumb?: string;
    footer?: string;
  };

  /** Configuração de layout */
  layout: {
    /** Largura do layout: 'full' (100%), 'lg' (1024px), 'md' (768px), 'sm' (640px) */
    width: LayoutWidth;
  };

  /** Metadados adicionais opcionais */
  metadata?: Record<string, any>;
}

/**
 * Composição com componentes resolvidos prontos para renderização
 */
export interface ResolvedComposition extends Composition {
  /** Componentes React resolvidos para cada slot */
  resolvedComponents: {
    navbar?: ComponentType;
    sidebar?: ComponentType;
    companion?: ComponentType;
    breadcrumb?: ComponentType;
    footer?: ComponentType;
  };
}
