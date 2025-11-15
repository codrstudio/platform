// HomepageToggle - Componente genérico para configurar homepage do portal
// Pode ser usado por qualquer módulo que queira oferecer sua rota como homepage

import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toastSuccess, toastError } from '@/lib/toast';
import { usePortalHomepage, usePortal } from '@/hooks/jqel/usePortal';
import { useQueryClient } from '@tanstack/react-query';

export interface HomepageToggleProps {
  /**
   * ID do portal onde a homepage será configurada
   */
  portalId: string;

  /**
   * Rota do módulo que será definida como homepage
   * Exemplo: "/ola", "/chat", "/dashboard"
   */
  moduleRoute: string;

  /**
   * Label customizado (opcional)
   * Default: "Usar como homepage do portal"
   */
  label?: string;
}

/**
 * HomepageToggle - Define uma rota de módulo como homepage do portal
 *
 * @example
 * ```tsx
 * // No BlueprintConfigForm
 * <HomepageToggle
 *   portalId={portalId}
 *   moduleRoute={config.mainRoute || '/ola'}
 * />
 *
 * // No ChatConfigForm
 * <HomepageToggle
 *   portalId={portalId}
 *   moduleRoute="/chat"
 * />
 * ```
 */
export function HomepageToggle({
  portalId,
  moduleRoute,
  label = 'Usar como homepage do portal'
}: HomepageToggleProps) {
  const queryClient = useQueryClient();
  const { data: portalResult, refetch, isLoading, error } = usePortal(portalId);
  const { setHomepage, clearHomepage } = usePortalHomepage(portalId);

  // Check if current route is the homepage
  const portal = portalResult?.data?.[0];
  const isActive = portal?.homepage?.type === 'subroute' && portal?.homepage?.value === moduleRoute;

  // If portal doesn't exist or is loading, disable toggle
  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 opacity-50">
        <Switch disabled checked={false} />
        <Label>Carregando portal...</Label>
      </div>
    );
  }

  if (error || !portal) {
    console.error('Portal not found or error loading portal:', error);
    return (
      <div className="flex items-center space-x-2 opacity-50">
        <Switch disabled checked={false} />
        <Label>Portal não encontrado</Label>
      </div>
    );
  }

  const handleToggle = async (checked: boolean) => {
    try {
      if (checked) {
        await setHomepage(moduleRoute);
        // Force refetch to update UI immediately
        await refetch();
        toastSuccess('Homepage ativada', {
          description: `Rota ${moduleRoute} configurada como homepage do portal`
        });
      } else {
        await clearHomepage();
        // Force refetch to update UI immediately
        await refetch();
        toastSuccess('Homepage desativada', {
          description: 'Homepage removida do portal'
        });
      }
    } catch (error) {
      console.error('Error toggling homepage:', error);
      toastError('Erro', {
        description: 'Não foi possível atualizar a homepage'
      });
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Switch
        id="homepage"
        checked={isActive}
        onCheckedChange={handleToggle}
      />
      <Label htmlFor="homepage">{label}</Label>
    </div>
  );
}
