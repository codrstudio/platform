/**
 * PWA Integration Example
 *
 * Este arquivo demonstra como integrar o Service Worker PWA
 * gerado pelo vite-plugin-pwa na aplicação React.
 *
 * IMPORTANTE: O vite-plugin-pwa já registra o Service Worker automaticamente
 * através do arquivo registerSW.js gerado. Este exemplo é apenas para
 * casos onde você precisa de controle manual ou notificações de atualização.
 */

/*
 * REGISTRO AUTOMÁTICO (Implementação Atual)
 *
 * Com a configuração atual (registerType: 'autoUpdate'), o Service Worker
 * é registrado automaticamente via registerSW.js injetado no HTML.
 *
 * Você NÃO precisa fazer nenhuma integração adicional no código React.
 * O PWA está pronto para uso assim que a aplicação é carregada.
 */

/*
 * EXEMPLO: Hook personalizado para gerenciar o Service Worker PWA
 *
 * Este hook usa o virtual module 'virtual:pwa-register/react' fornecido
 * pelo vite-plugin-pwa para controlar o ciclo de vida do SW.
 *
 * Para usar este exemplo:
 * 1. Instale as type definitions: npm install -D vite-plugin-pwa/client
 * 2. Adicione /// <reference types="vite-plugin-pwa/client" /> no topo do arquivo
 * 3. Descomente o código abaixo
 *
 * import { useEffect, useState } from 'react';
 *
 * export function usePWA() {
 *   const [needRefresh, setNeedRefresh] = useState(false);
 *   const [offlineReady, setOfflineReady] = useState(false);
 *
 *   useEffect(() => {
 *     import('virtual:pwa-register/react')
 *       .then(({ useRegisterSW }) => {
 *         const {
 *           needRefresh: [, setNeedRefreshState],
 *           offlineReady: [, setOfflineReadyState],
 *         } = useRegisterSW({
 *           onRegistered(registration: ServiceWorkerRegistration) {
 *             console.log('PWA: Service Worker registered', registration);
 *           },
 *           onRegisterError(error: Error) {
 *             console.error('PWA: Service Worker registration error', error);
 *           },
 *           onOfflineReady() {
 *             console.log('PWA: App ready to work offline');
 *             setOfflineReady(true);
 *           },
 *           onNeedRefresh() {
 *             console.log('PWA: New version available');
 *             setNeedRefresh(true);
 *           },
 *         });
 *       })
 *       .catch((error) => {
 *         console.warn('PWA module not available:', error);
 *       });
 *   }, []);
 *
 *   return { needRefresh, offlineReady };
 * }
 */

/*
 * EXEMPLO: Componente de notificação de atualização PWA
 *
 * export function PWAUpdateNotification() {
 *   const { needRefresh, offlineReady } = usePWA();
 *
 *   if (!needRefresh && !offlineReady) {
 *     return null;
 *   }
 *
 *   return (
 *     <div className="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg p-4">
 *       {offlineReady && (
 *         <div className="text-sm text-green-600">
 *           ✓ App ready to work offline
 *         </div>
 *       )}
 *
 *       {needRefresh && (
 *         <div className="space-y-2">
 *           <div className="text-sm text-blue-600">New version available!</div>
 *           <button
 *             className="px-4 py-2 bg-blue-600 text-white rounded"
 *             onClick={() => window.location.reload()}
 *           >
 *             Update Now
 *           </button>
 *         </div>
 *       )}
 *     </div>
 *   );
 * }
 */

/*
 * INSTALAÇÃO AUTOMÁTICA (Padrão)
 *
 * Por padrão, o vite-plugin-pwa com registerType: 'autoUpdate'
 * registra o Service Worker automaticamente através do registerSW.js
 * incluído no index.html.
 *
 * Você NÃO precisa fazer nada manualmente. O SW será registrado automaticamente.
 */

/*
 * INSTALAÇÃO MANUAL (Opcional)
 *
 * Se você quiser controle total sobre o registro do SW,
 * configure vite-plugin-pwa com registerType: 'prompt' e use:
 *
 * import { registerSW } from 'virtual:pwa-register';
 *
 * const updateSW = registerSW({
 *   onNeedRefresh() {
 *     // Notificar usuário que nova versão está disponível
 *   },
 *   onOfflineReady() {
 *     // App pronto para funcionar offline
 *   },
 * });
 *
 * // Para atualizar manualmente
 * updateSW(true);
 */

/*
 * ESTRATÉGIAS DE ATUALIZAÇÃO
 *
 * 1. autoUpdate (Atual)
 *    - SW atualiza automaticamente quando nova versão disponível
 *    - Melhor para apps que não podem ter versões desatualizadas
 *
 * 2. prompt
 *    - SW espera confirmação do usuário para atualizar
 *    - Melhor para apps onde o usuário pode perder trabalho não salvo
 */

/*
 * VERIFICAÇÃO DE INSTALAÇÃO PWA
 *
 * Você pode verificar se a aplicação está instalada como PWA:
 *
 * export function isPWAInstalled(): boolean {
 *   return window.matchMedia('(display-mode: standalone)').matches ||
 *          (window.navigator as any).standalone === true ||
 *          document.referrer.includes('android-app://');
 * }
 */

/*
 * EXEMPLO DE USO NO App.tsx
 *
 * import { PWAUpdateNotification } from './pwa-integration-example';
 *
 * function App() {
 *   return (
 *     <>
 *       <YourApp />
 *       <PWAUpdateNotification />
 *     </>
 *   );
 * }
 */

// Este arquivo é apenas documentação e exemplos.
// O PWA está configurado e funcionando automaticamente via vite-plugin-pwa.
export {};
