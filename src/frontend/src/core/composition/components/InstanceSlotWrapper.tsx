/**
 * Instance Slot Wrapper
 *
 * Componente wrapper que conecta slots de composição a instâncias de módulos.
 *
 * Responsabilidades:
 * - Busca configuração da instância via JQEL
 * - Valida se instância está ativa
 * - Passa configuração para componente base
 * - Retorna null se instância inativa ou inexistente
 *
 * Uso:
 * ```tsx
 * <InstanceSlotWrapper
 *   slotConfig={{ instanceId: 'default', portalId: 'sandbox', moduleId: 'sidebar' }}
 *   Component={SidebarComponent}
 * />
 * ```
 */

import type { ComponentType } from 'react';
import { useInstance } from '@/hooks/jqel/useInstance';
import { SidebarProvider } from '@/components/ui/sidebar';

/**
 * Configuração de slot que referencia uma instância
 */
export interface InstanceSlotConfig {
  instanceId: string;
  portalId: string;
  moduleId: string;
}

/**
 * Props do InstanceSlotWrapper
 */
export interface InstanceSlotWrapperProps {
  slotConfig: InstanceSlotConfig;
  Component: ComponentType<{ config: any }>;
}

/**
 * Wrapper que busca config de uma instância e renderiza componente base
 */
export function InstanceSlotWrapper({ slotConfig, Component }: InstanceSlotWrapperProps) {
  const { data: instanceResult, isLoading } = useInstance(
    slotConfig.instanceId,
    slotConfig.portalId,
    slotConfig.moduleId
  );

  // Aguardar carregamento
  if (isLoading) {
    return null;
  }

  const instance = instanceResult?.data?.[0];

  // Instância não encontrada ou inativa
  if (!instance || !instance.active) {
    return null;
  }

  // Instância sem configuração
  if (!instance.config) {
    console.warn(
      `[InstanceSlotWrapper] Instância ${slotConfig.instanceId} do módulo ${slotConfig.moduleId} não possui configuração`
    );
    return null;
  }

  // Renderizar componente com config da instância
  // Se for um módulo sidebar, envolver com SidebarProvider
  if (slotConfig.moduleId === 'sidebar') {
    return (
      <SidebarProvider defaultOpen={!instance.config?.defaultCollapsed}>
        <Component config={instance.config} />
      </SidebarProvider>
    );
  }

  return <Component config={instance.config} />;
}
