// Login Branding Storage Utilities
// Funções para gerenciar configuração de branding da página de login

import type { BrandColor } from '@/types/theme';
import { DEFAULT_BRAND_COLOR } from '@/types/theme';
import { getStoredBrandColor } from './theme';
import type { LoginBrandingConfig } from '@/types/login-branding';
import {
  DEFAULT_LOGIN_BRANDING,
  validateLoginBranding,
  mergeWithDefaults,
} from '@/types/login-branding';

/**
 * Chave do localStorage para branding de login
 * Formato: realm:{realmId}:login-branding
 */
function getStorageKey(realmId: string): string {
  return `realm:${realmId}:login-branding`;
}

/**
 * Obtém configuração de branding do localStorage
 * Se não existir, retorna defaults
 */
export function getLoginBranding(realmId: string): LoginBrandingConfig {
  try {
    const stored = localStorage.getItem(getStorageKey(realmId));

    if (!stored) {
      return DEFAULT_LOGIN_BRANDING;
    }

    const parsed = JSON.parse(stored);
    const validated = validateLoginBranding(parsed);

    return validated;
  } catch (error) {
    console.error('Erro ao carregar login branding:', error);
    return DEFAULT_LOGIN_BRANDING;
  }
}

/**
 * Salva configuração de branding no localStorage
 */
export function setLoginBranding(
  realmId: string,
  config: LoginBrandingConfig
): void {
  try {
    // Validar antes de salvar
    const validated = validateLoginBranding(config);
    const json = JSON.stringify(validated);

    localStorage.setItem(getStorageKey(realmId), json);
  } catch (error) {
    console.error('Erro ao salvar login branding:', error);
    throw error;
  }
}

/**
 * Atualiza configuração parcialmente (merge com existente)
 */
export function updateLoginBranding(
  realmId: string,
  partial: Partial<LoginBrandingConfig>
): LoginBrandingConfig {
  const current = getLoginBranding(realmId);
  const updated = mergeWithDefaults({ ...current, ...partial });

  setLoginBranding(realmId, updated);

  return updated;
}

/**
 * Remove configuração de branding (volta aos defaults)
 */
export function removeLoginBranding(realmId: string): void {
  try {
    localStorage.removeItem(getStorageKey(realmId));
  } catch (error) {
    console.error('Erro ao remover login branding:', error);
  }
}

/**
 * Verifica se existe configuração customizada
 */
export function hasLoginBranding(realmId: string): boolean {
  try {
    return localStorage.getItem(getStorageKey(realmId)) !== null;
  } catch {
    return false;
  }
}

/**
 * Resolve brand color para login (tema ou override)
 *
 * LÓGICA:
 * 1. Se useBrandColorFromTheme = true → usa cor do tema (getStoredBrandColor)
 * 2. Se useBrandColorFromTheme = false → usa brandColorOverride
 * 3. Fallback: DEFAULT_BRAND_COLOR
 *
 * @param realmId - ID do realm
 * @param portalId - ID do portal (opcional, para resolver cor do tema)
 */
export function getLoginBrandColor(
  realmId: string,
  portalId?: string
): BrandColor {
  const config = getLoginBranding(realmId);

  if (config.useBrandColorFromTheme) {
    // Usa cor do tema (já implementado em lib/theme.ts)
    // Resolução: Portal override → Realm → System default
    return getStoredBrandColor(realmId, portalId);
  } else {
    // Usa cor customizada do login
    return config.brandColorOverride || DEFAULT_BRAND_COLOR;
  }
}

/**
 * Define brand color override para login
 */
export function setLoginBrandColorOverride(
  realmId: string,
  color: BrandColor | null
): void {
  const config = getLoginBranding(realmId);

  const updated: LoginBrandingConfig = {
    ...config,
    useBrandColorFromTheme: color === null, // Se null, volta a usar do tema
    brandColorOverride: color,
  };

  setLoginBranding(realmId, updated);
}

/**
 * Define que login deve usar cor do tema
 */
export function useThemeBrandColor(realmId: string): void {
  setLoginBrandColorOverride(realmId, null);
}

/**
 * Atualiza URL da logo
 */
export function setLoginLogoUrl(
  realmId: string,
  url: string | null
): void {
  updateLoginBranding(realmId, { logoUrl: url });
}

/**
 * Atualiza altura da logo
 */
export function setLoginLogoHeight(realmId: string, height: number): void {
  updateLoginBranding(realmId, { logoHeight: height });
}

/**
 * Atualiza textos do login
 */
export function setLoginTexts(
  realmId: string,
  texts: Partial<LoginBrandingConfig['texts']>
): void {
  const config = getLoginBranding(realmId);

  updateLoginBranding(realmId, {
    texts: {
      ...config.texts,
      ...texts,
    },
  });
}

/**
 * Reseta configuração para defaults
 */
export function resetLoginBranding(realmId: string): void {
  setLoginBranding(realmId, DEFAULT_LOGIN_BRANDING);
}

/**
 * Exporta configuração como JSON (para backup)
 */
export function exportLoginBranding(realmId: string): string {
  const config = getLoginBranding(realmId);
  return JSON.stringify(config, null, 2);
}

/**
 * Importa configuração de JSON (restaura backup)
 */
export function importLoginBranding(
  realmId: string,
  json: string
): LoginBrandingConfig {
  try {
    const parsed = JSON.parse(json);
    const validated = validateLoginBranding(parsed);

    setLoginBranding(realmId, validated);

    return validated;
  } catch (error) {
    console.error('Erro ao importar login branding:', error);
    throw new Error('JSON inválido ou configuração malformada');
  }
}
