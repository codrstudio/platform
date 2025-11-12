// useLoginBranding Hook
// Hook para gerenciar configuração de branding da página de login

import { useState, useEffect } from 'react';
import type { LoginBrandingConfig } from '@/types/login-branding';
import type { BrandColor } from '@/types/theme';
import {
  getLoginBranding,
  getLoginBrandColor,
  hasLoginBranding,
} from '@/lib/login-branding';

interface UseLoginBrandingReturn {
  /** Configuração de branding */
  config: LoginBrandingConfig;

  /** Brand color resolvida (tema ou override) */
  brandColor: BrandColor;

  /** Se há configuração customizada */
  hasCustomBranding: boolean;

  /** Se está carregando */
  isLoading: boolean;

  /** Recarrega configuração */
  reload: () => void;
}

/**
 * Hook para usar configuração de branding do login
 *
 * @param realmId - ID do realm
 * @param portalId - ID do portal (opcional, para resolver cor do tema)
 *
 * @example
 * ```tsx
 * function LoginPage() {
 *   const { config, brandColor } = useLoginBranding('default');
 *
 *   return (
 *     <div>
 *       {config.logoUrl && (
 *         <img
 *           src={config.logoUrl}
 *           alt="Logo"
 *           style={{ height: `${config.logoHeight}px` }}
 *         />
 *       )}
 *       <h1>{config.texts.title}</h1>
 *     </div>
 *   );
 * }
 * ```
 */
export function useLoginBranding(
  realmId: string,
  portalId?: string
): UseLoginBrandingReturn {
  const [config, setConfig] = useState<LoginBrandingConfig>(() =>
    getLoginBranding(realmId)
  );
  const [brandColor, setBrandColor] = useState<BrandColor>(() =>
    getLoginBrandColor(realmId, portalId)
  );
  const [isLoading, setIsLoading] = useState(false);

  // Carregar configuração
  const reload = () => {
    try {
      setIsLoading(true);
      const newConfig = getLoginBranding(realmId);
      const newBrandColor = getLoginBrandColor(realmId, portalId);

      setConfig(newConfig);
      setBrandColor(newBrandColor);
    } catch (error) {
      console.error('Erro ao carregar login branding:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Recarregar quando realm ou portal mudar
  useEffect(() => {
    reload();
  }, [realmId, portalId]);

  // Listener para mudanças no localStorage (sincroniza entre tabs)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === `realm:${realmId}:login-branding`) {
        reload();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [realmId]);

  return {
    config,
    brandColor,
    hasCustomBranding: hasLoginBranding(realmId),
    isLoading,
    reload,
  };
}
