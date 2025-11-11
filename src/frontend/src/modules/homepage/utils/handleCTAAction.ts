/**
 * handleCTAAction Utility
 *
 * Processa ações de botões CTA na homepage.
 *
 * @see spec/SPEC-module-homepage.md - Integração com Outros Módulos
 */

import type { CTAButton } from '../types';

interface HandleCTAActionOptions {
  /**
   * Função de navegação do React Router
   */
  navigate: (path: string) => void;

  /**
   * Scroll behavior para smooth scrolling
   * @default 'smooth'
   */
  scrollBehavior?: ScrollBehavior;
}

/**
 * Executa a ação configurada em um botão CTA
 *
 * @example
 * ```tsx
 * const navigate = useNavigate();
 *
 * <button onClick={() => handleCTAAction(ctaButton, { navigate })}>
 *   {ctaButton.label}
 * </button>
 * ```
 */
export function handleCTAAction(
  button: CTAButton,
  options: HandleCTAActionOptions
): void {
  const { navigate, scrollBehavior = 'smooth' } = options;

  switch (button.action) {
    case 'signup':
      // Redirect para rota de signup
      navigate('/auth/signup');
      break;

    case 'login':
      // Redirect para rota de login
      navigate('/auth/login');
      break;

    case 'scroll-to':
      // Smooth scroll para elemento target
      if (button.target) {
        const element = document.querySelector(button.target);
        if (element) {
          element.scrollIntoView({
            behavior: scrollBehavior,
            block: 'start',
          });
        } else {
          console.warn(`[handleCTAAction] Target element not found: ${button.target}`);
        }
      } else {
        console.warn('[handleCTAAction] scroll-to action requires a target');
      }
      break;

    case 'link':
      // Navegação interna via React Router
      if (button.target) {
        navigate(button.target);
      } else {
        console.warn('[handleCTAAction] link action requires a target');
      }
      break;

    case 'external':
      // Abrir URL externa em nova aba
      if (button.url) {
        window.open(button.url, '_blank', 'noopener,noreferrer');
      } else {
        console.warn('[handleCTAAction] external action requires a url');
      }
      break;

    default:
      console.warn(`[handleCTAAction] Unknown action: ${button.action}`);
  }
}

/**
 * Hook customizado para facilitar uso com React Router
 *
 * @example
 * ```tsx
 * function HeroSection({ config }) {
 *   const handleCTA = useHandleCTAAction();
 *
 *   return (
 *     <button onClick={() => handleCTA(config.primaryButton)}>
 *       {config.primaryButton.label}
 *     </button>
 *   );
 * }
 * ```
 */
export function useHandleCTAAction() {
  // Lazy import para evitar dependência circular
  const { useNavigate } = require('react-router-dom');
  const navigate = useNavigate();

  return (button: CTAButton) => {
    handleCTAAction(button, { navigate });
  };
}
