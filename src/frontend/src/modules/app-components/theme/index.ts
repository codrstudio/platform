/**
 * Theme Configuration for App Components
 *
 * Configura todos os componentes do módulo para respeitar o tema da plataforma.
 */

import { useEffect } from 'react';

export interface AppComponentsThemeConfig {
  theme: 'light' | 'dark' | 'system';
  brandColor: string;
  tokens: DesignTokens;
}

export interface DesignTokens {
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  destructive: string;
  info: string;
  muted: string;
  background: string;
  foreground: string;
  border: string;
  ring: string;
}

/**
 * Configuração global do tema dos app components
 */
let currentThemeConfig: AppComponentsThemeConfig | null = null;

/**
 * Configura o tema de todos os app components
 */
export function configureAppComponents(config: AppComponentsThemeConfig): void {
  currentThemeConfig = config;

  // Aplicar tema ao FullCalendar
  applyFullCalendarTheme(config);

  // Aplicar tema ao TipTap
  applyTipTapTheme(config);

  // Outros componentes (Recharts, DnD Kit) usam CSS variables automaticamente
}

/**
 * Obtém a configuração atual do tema
 */
export function getThemeConfig(): AppComponentsThemeConfig | null {
  return currentThemeConfig;
}

/**
 * Aplica tema ao FullCalendar
 */
function applyFullCalendarTheme(config: AppComponentsThemeConfig): void {
  // FullCalendar usa CSS variables, então apenas garantimos que estejam definidas
  const root = document.documentElement;

  // Aplicar classe de tema
  if (config.theme === 'dark') {
    root.classList.add('fc-theme-dark');
  } else {
    root.classList.remove('fc-theme-dark');
  }
}

/**
 * Aplica tema ao TipTap
 */
function applyTipTapTheme(_config: AppComponentsThemeConfig): void {
  // TipTap usa a classe 'prose' do Tailwind Typography
  // que automaticamente respeita dark mode via dark:prose-invert
  // Nenhuma configuração adicional necessária
}

/**
 * Hook para auto-configurar app components baseado no tema atual
 *
 * Integra com o ThemeContext da plataforma (SPEC-MC-AP-024, SPEC-MC-CF-005)
 *
 * Nota: Este hook é opcional. Os componentes usam CSS custom properties
 * automaticamente. Use apenas se precisar de configuração imperativa.
 */
export function useAppComponentsTheme(): void {
  useEffect(() => {
    // Ler tema e brand color do DOM (CSS custom properties)
    const root = document.documentElement;
    const isDark = root.classList.contains('dark');
    const theme = isDark ? 'dark' : 'light';

    // Configurar app components
    configureAppComponents({
      theme,
      brandColor: getComputedStyle(root).getPropertyValue('--primary').trim(),
      tokens: {
        primary: getComputedStyle(root).getPropertyValue('--primary').trim(),
        secondary: getComputedStyle(root).getPropertyValue('--secondary').trim(),
        success: getComputedStyle(root).getPropertyValue('--success').trim(),
        warning: getComputedStyle(root).getPropertyValue('--warning').trim(),
        destructive: getComputedStyle(root).getPropertyValue('--destructive').trim(),
        info: getComputedStyle(root).getPropertyValue('--info').trim(),
        muted: getComputedStyle(root).getPropertyValue('--muted').trim(),
        background: getComputedStyle(root).getPropertyValue('--background').trim(),
        foreground: getComputedStyle(root).getPropertyValue('--foreground').trim(),
        border: getComputedStyle(root).getPropertyValue('--border').trim(),
        ring: getComputedStyle(root).getPropertyValue('--ring').trim(),
      },
    });

    // Observar mudanças no tema (classe 'dark')
    const observer = new MutationObserver(() => {
      const isDark = root.classList.contains('dark');
      const theme = isDark ? 'dark' : 'light';

      configureAppComponents({
        theme,
        brandColor: getComputedStyle(root).getPropertyValue('--primary').trim(),
        tokens: {
          primary: getComputedStyle(root).getPropertyValue('--primary').trim(),
          secondary: getComputedStyle(root).getPropertyValue('--secondary').trim(),
          success: getComputedStyle(root).getPropertyValue('--success').trim(),
          warning: getComputedStyle(root).getPropertyValue('--warning').trim(),
          destructive: getComputedStyle(root).getPropertyValue('--destructive').trim(),
          info: getComputedStyle(root).getPropertyValue('--info').trim(),
          muted: getComputedStyle(root).getPropertyValue('--muted').trim(),
          background: getComputedStyle(root).getPropertyValue('--background').trim(),
          foreground: getComputedStyle(root).getPropertyValue('--foreground').trim(),
          border: getComputedStyle(root).getPropertyValue('--border').trim(),
          ring: getComputedStyle(root).getPropertyValue('--ring').trim(),
        },
      });
    });

    observer.observe(root, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);
}
