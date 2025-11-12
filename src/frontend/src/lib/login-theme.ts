// Login Theme Utilities
// Funções para aplicar brand color de forma isolada apenas na página de login

import type { BrandColor } from '@/types/theme';
import { hslToString } from './theme';

/**
 * Aplica brand color de forma isolada a um container específico
 * Modifica apenas CSS variables dentro do escopo [data-login-theme]
 *
 * @param container - HTMLElement que contém o login (com data-login-theme="true")
 * @param color - Cor do brand a ser aplicada
 */
export function applyLoginBrandColor(container: HTMLElement, color: BrandColor): void {
  // Aplica cor primária
  container.style.setProperty('--primary', hslToString(color));

  // Calcula cor de foreground baseada na luminosidade
  const foreground: BrandColor = color.lightness > 50
    ? { hue: color.hue, saturation: color.saturation, lightness: 10 }
    : { hue: color.hue, saturation: color.saturation, lightness: 98 };

  container.style.setProperty('--primary-foreground', hslToString(foreground));
}

/**
 * Remove brand color customizada de um container
 * Restaura para valores padrão herdados do tema global
 *
 * @param container - HTMLElement que contém o login
 */
export function removeLoginBrandColor(container: HTMLElement): void {
  container.style.removeProperty('--primary');
  container.style.removeProperty('--primary-foreground');
}

/**
 * Verifica se um elemento está dentro de um container de login theme
 *
 * @param element - Elemento a verificar
 * @returns true se está dentro de [data-login-theme="true"]
 */
export function isWithinLoginTheme(element: HTMLElement): boolean {
  return element.closest('[data-login-theme="true"]') !== null;
}
