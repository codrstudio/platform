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
 * Nota: Este hook deve ser chamado no componente raiz da aplicação
 * quando o sistema de temas estiver implementado.
 */
export function useAppComponentsTheme(): void {
  useEffect(() => {
    // TODO: Integrar com useTheme quando o sistema de temas estiver implementado
    // Por enquanto, configurar com valores padrão
    configureAppComponents({
      theme: 'light',
      brandColor: 'hsl(var(--primary))',
      tokens: {
        primary: 'hsl(var(--primary))',
        secondary: 'hsl(var(--secondary))',
        success: 'hsl(var(--success))',
        warning: 'hsl(var(--warning))',
        destructive: 'hsl(var(--destructive))',
        info: 'hsl(var(--info))',
        muted: 'hsl(var(--muted))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        border: 'hsl(var(--border))',
        ring: 'hsl(var(--ring))',
      },
    });
  }, []);
}
