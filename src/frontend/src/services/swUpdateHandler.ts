/**
 * Service Worker Update Handler
 *
 * Detecta quando um novo Service Worker está disponível e gerencia o processo
 * de atualização da aplicação.
 *
 * Features:
 * - Escuta evento 'controllerchange' do Service Worker
 * - Notifica usuário sobre updates disponíveis
 * - Suporta auto-reload ou prompt manual
 *
 * Refs: PLAN_4-Cache-Invalidation.md - FASE 3.1
 */

type UpdateCallback = () => void;

class SWUpdateHandler {
  private autoReload: boolean;
  private updateAvailableCallbacks: Set<UpdateCallback> = new Set();

  constructor(autoReload = false) {
    this.autoReload = autoReload;
    this.init();
  }

  private init() {
    if (!('serviceWorker' in navigator)) {
      console.log('[SWUpdate] Service Worker not supported');
      return;
    }

    // Listener para quando um novo Service Worker assume controle
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('[SWUpdate] New service worker activated');

      if (this.autoReload) {
        this.forceReload();
      } else {
        this.promptForUpdate();
      }
    });

    // Check manual periódico (opcional - a cada 5 minutos)
    if (this.autoReload === false) {
      this.setupPeriodicUpdateCheck();
    }

    console.log('[SWUpdate] Handler initialized (autoReload:', this.autoReload, ')');
  }

  /**
   * Configura verificação periódica de updates (a cada 5 minutos)
   * Mitiga limitação de browsers que só verificam updates em navigation
   */
  private setupPeriodicUpdateCheck() {
    const CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutos

    setInterval(() => {
      navigator.serviceWorker.getRegistration().then((registration) => {
        if (registration) {
          console.log('[SWUpdate] Checking for updates...');
          registration.update();
        }
      });
    }, CHECK_INTERVAL);
  }

  /**
   * Notifica callbacks registrados que há update disponível
   */
  promptForUpdate() {
    console.log('[SWUpdate] Update available, notifying callbacks');
    this.updateAvailableCallbacks.forEach((callback) => callback());
  }

  /**
   * Força reload da página para aplicar novo Service Worker
   */
  forceReload() {
    console.log('[SWUpdate] Forcing page reload');
    window.location.reload();
  }

  /**
   * Registra callback para ser chamado quando update estiver disponível
   * @returns Função para remover o callback
   */
  onUpdateAvailable(callback: UpdateCallback): () => void {
    this.updateAvailableCallbacks.add(callback);
    return () => {
      this.updateAvailableCallbacks.delete(callback);
    };
  }

  /**
   * Permite alterar modo de auto-reload em runtime
   */
  setAutoReload(enabled: boolean) {
    this.autoReload = enabled;
    console.log('[SWUpdate] Auto-reload', enabled ? 'enabled' : 'disabled');
  }

  /**
   * Trigger manual de verificação de update
   */
  async checkForUpdate(): Promise<boolean> {
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) {
      console.log('[SWUpdate] No registration found');
      return false;
    }

    console.log('[SWUpdate] Manual update check triggered');
    await registration.update();

    // Retorna true se há um worker esperando
    return !!registration.waiting;
  }

  /**
   * Força ativação imediata do Service Worker em espera
   */
  async activateWaitingSW(): Promise<void> {
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration?.waiting) {
      console.log('[SWUpdate] No waiting service worker found');
      return;
    }

    console.log('[SWUpdate] Activating waiting service worker');

    // Envia mensagem para o SW em espera pedir skipWaiting
    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
  }
}

// Instância singleton (não inicializar aqui, será feito no main.tsx)
export let swUpdateHandler: SWUpdateHandler;

/**
 * Inicializa o handler (chamado no main.tsx após SW registration)
 */
export function initSWUpdateHandler(autoReload = false): SWUpdateHandler {
  if (!swUpdateHandler) {
    swUpdateHandler = new SWUpdateHandler(autoReload);
  }
  return swUpdateHandler;
}
