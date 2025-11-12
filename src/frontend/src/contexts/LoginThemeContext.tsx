// Login Theme Context
// Provider isolado de tema apenas para a página de login

import { createContext, useContext, useEffect, useRef, type ReactNode } from 'react';
import type { LoginBrandingConfig } from '@/types/login-branding';
import type { BrandColor } from '@/types/theme';
import { applyLoginBrandColor, removeLoginBrandColor } from '@/lib/login-theme';
import { getStoredBrandColor } from '@/lib/theme';

interface LoginThemeContextValue {
  /** Configuração de branding aplicada */
  config: LoginBrandingConfig;

  /** Brand color efetiva sendo usada */
  brandColor: BrandColor;
}

const LoginThemeContext = createContext<LoginThemeContextValue | undefined>(undefined);

interface LoginThemeProviderProps {
  /** Configuração de branding a ser aplicada */
  config: LoginBrandingConfig;

  /** ID do realm (para resolver brand color do tema) */
  realmId: string;

  /** ID do portal (opcional, para resolver brand color do tema) */
  portalId?: string;

  children: ReactNode;
}

/**
 * Provider de tema isolado para página de login
 * Aplica brand color apenas dentro do container, sem afetar tema global
 *
 * Uso:
 * ```tsx
 * <LoginThemeProvider config={loginConfig} realmId="default">
 *   <LoginPage />
 * </LoginThemeProvider>
 * ```
 */
export function LoginThemeProvider({
  config,
  realmId,
  portalId,
  children,
}: LoginThemeProviderProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Resolve brand color: theme vs override
  const themeColor = getStoredBrandColor(realmId, portalId);
  const brandColor = config.useBrandColorFromTheme
    ? themeColor
    : config.brandColorOverride || themeColor;

  // Aplica brand color no container quando muda
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    applyLoginBrandColor(container, brandColor);

    // Cleanup: remove customizações ao desmontar
    return () => {
      removeLoginBrandColor(container);
    };
  }, [brandColor]);

  const contextValue: LoginThemeContextValue = {
    config,
    brandColor,
  };

  return (
    <LoginThemeContext.Provider value={contextValue}>
      <div ref={containerRef} data-login-theme="true" className="contents">
        {children}
      </div>
    </LoginThemeContext.Provider>
  );
}

/**
 * Hook para acessar o contexto de tema do login
 * Apenas disponível dentro de <LoginThemeProvider>
 */
export function useLoginTheme(): LoginThemeContextValue {
  const context = useContext(LoginThemeContext);

  if (!context) {
    throw new Error('useLoginTheme must be used within LoginThemeProvider');
  }

  return context;
}
