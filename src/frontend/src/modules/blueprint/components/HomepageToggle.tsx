// components/HomepageToggle.tsx
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toastSuccess, toastError } from '@/lib/toast';
import { usePortal, useUpdatePortal } from '@/hooks/jqel/usePortal';
import { useParams } from 'react-router-dom';

export function HomepageToggle() {
  const { portalId = 'main' } = useParams();
  const { data: portalResult } = usePortal(portalId);
  const updatePortal = useUpdatePortal();

  const portal = portalResult?.data?.[0];
  const isHomepage = portal?.homepage?.type === 'subroute' && portal?.homepage?.value === '/ola';

  const handleToggle = async (checked: boolean) => {
    try {
      await updatePortal.mutateAsync({
        values: {
          homepage: checked
            ? { type: 'subroute', value: '/ola' }
            : { type: 'none' }
        },
        where: { portalId: { $eq: portalId } }
      });

      toastSuccess(
        checked ? 'Homepage ativada' : 'Homepage desativada',
        {
          description: checked
            ? 'Este módulo agora é a homepage do portal'
            : 'Homepage removida do portal'
        }
      );
    } catch (error) {
      toastError('Erro', {
        description: 'Não foi possível atualizar a homepage'
      });
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Switch id="homepage" checked={isHomepage} onCheckedChange={handleToggle} />
      <Label htmlFor="homepage">Usar como homepage do portal</Label>
    </div>
  );
}
