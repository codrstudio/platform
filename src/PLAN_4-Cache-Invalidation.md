# PLAN_CACHE-INVALIDATION.md - Sistema de Invalidação de Cache PWA

**Objetivo**: Implementar sistema robusto de invalidação de cache para garantir que mudanças no servidor SEMPRE se reflitam no browser, eliminando completamente o problema de conteúdo obsoleto em arquivos estáticos (favicon, manifest, icons).

---

## 📋 RESUMO EXECUTIVO

### Problemas Identificados
1. ❌ **Cache de assets estáticos nunca invalida**: Favicon, manifest e PWA icons permanecem em cache indefinidamente mesmo após deploys
2. ❌ **Usuários com tabs abertas não recebem updates**: Service Worker só verifica updates em page load/navigation
3. ⚠️ **Browser-level caching fora do controle do SW**: Favicons têm cache agressivo independente do Service Worker

### Solução (Baseada em Padrões)
- ✅ **Cache Epoch System**: Versionamento global (GUID) validado antes de usar qualquer recurso cacheado
- ✅ **Clear-Site-Data Header**: Limpeza forçada via HTTP header para deploys críticos (Chrome DevRel)
- ✅ **SW Update Detection**: Detecção automática + reload forçado quando novo Service Worker disponível
- ✅ **Network-First Strategy**: Favicon/manifest sempre tentam buscar da rede quando online
- ✅ **SSE Integration**: Invalidação em tempo real via Server-Sent Events

---

## 🎯 FASE 1: CACHE EPOCH SYSTEM

### 1.1. Backend - Geração e Exposição do Epoch

- [ ] Criar serviço `CacheEpochService` em `src/backend/src/services/cache-epoch.service.ts`
  - [ ] Gerar GUID na inicialização do servidor (usando `crypto.randomUUID()`)
  - [ ] Armazenar epoch em memória (singleton)
  - [ ] Método `getCurrentEpoch()` para consulta
  - [ ] Método `refreshEpoch()` para forçar nova geração
- [ ] Criar middleware `cacheEpochMiddleware` em `src/backend/src/middleware/cache-epoch.middleware.ts`
  - [ ] Adicionar header `X-Cache-Epoch` em todos os responses
  - [ ] Aplicar globalmente em `app.ts`
- [ ] Criar endpoint `GET /api/cache/epoch` em `src/backend/src/routes/cache.routes.ts`
  - [ ] Retornar `{ epoch: string }` no formato JResult
- [ ] ✅ **Checkpoint**: Backend expõe epoch em header e endpoint

**Leitura de Referência**
- Chrome DevRel: Removing buggy service workers (https://developer.chrome.com/docs/workbox/remove-buggy-service-workers)
- MDN: Clear-Site-Data Header (https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Clear-Site-Data)

**Código de Referência**:
```typescript
// cache-epoch.service.ts
import crypto from 'crypto';

class CacheEpochService {
  private currentEpoch: string;

  constructor() {
    this.currentEpoch = crypto.randomUUID();
    console.log('[CacheEpoch] Initialized:', this.currentEpoch);
  }

  getCurrentEpoch(): string {
    return this.currentEpoch;
  }

  refreshEpoch(): string {
    const oldEpoch = this.currentEpoch;
    this.currentEpoch = crypto.randomUUID();
    console.log('[CacheEpoch] Refreshed:', oldEpoch, '->', this.currentEpoch);
    return this.currentEpoch;
  }
}

export const cacheEpochService = new CacheEpochService();
```

---

### 1.2. Frontend - Cache Validator Service

- [ ] Criar serviço `cacheValidator.ts` em `src/frontend/src/services/cacheValidator.ts`
  - [ ] Armazenar epoch atual em memória e localStorage (`cache_epoch`)
  - [ ] Método `getCurrentEpoch()` para consulta
  - [ ] Método `updateEpoch(newEpoch)` para atualização
  - [ ] Método `isValid(resourceEpoch)` para validação
  - [ ] Método `invalidateAll()` para limpeza total
- [ ] Criar hook `useCacheValidator` em `src/frontend/src/hooks/useCacheValidator.ts`
  - [ ] Expor métodos do serviço via React hook
  - [ ] Listener para mudanças de epoch
- [ ] ✅ **Checkpoint**: Frontend consegue armazenar e validar epochs

**Código de Referência**:
```typescript
// cacheValidator.ts
const STORAGE_KEY = 'cache_epoch';

class CacheValidator {
  private currentEpoch: string | null = null;

  constructor() {
    this.currentEpoch = localStorage.getItem(STORAGE_KEY);
  }

  getCurrentEpoch(): string | null {
    return this.currentEpoch;
  }

  updateEpoch(newEpoch: string): void {
    if (this.currentEpoch && this.currentEpoch !== newEpoch) {
      console.log('[CacheValidator] Epoch changed, invalidating cache');
      this.invalidateAll();
    }
    this.currentEpoch = newEpoch;
    localStorage.setItem(STORAGE_KEY, newEpoch);
  }

  isValid(resourceEpoch: string | null): boolean {
    return resourceEpoch === this.currentEpoch;
  }

  async invalidateAll(): Promise<void> {
    console.log('[CacheValidator] Invalidating all caches');
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
    }
  }
}

export const cacheValidator = new CacheValidator();
```

---

### 1.3. Frontend - Epoch Sync na Inicialização

- [ ] Adicionar lógica de sync em `src/frontend/src/App.tsx`
  - [ ] Buscar epoch do servidor no mount (`/api/cache/epoch`)
  - [ ] Comparar com epoch local
  - [ ] Se diferente: chamar `invalidateAll()` e atualizar
- [ ] Adicionar interceptor no `jqelClient.ts` para extrair `X-Cache-Epoch` header
  - [ ] Atualizar epoch automaticamente em cada response
- [ ] ✅ **Checkpoint**: Frontend sincroniza epoch automaticamente

---

### 1.4. Testar Fase 1 Completa

**Checklist de Testes**:
- [ ] **Teste 1: Epoch gerado no backend**
  - [ ] Iniciar backend
  - [ ] Verificar log de console mostrando epoch gerado
  - [ ] Fazer request para `/api/cache/epoch`
  - [ ] ✅ **Verificar**: Response contém GUID válido

- [ ] **Teste 2: Header X-Cache-Epoch presente**
  - [ ] Fazer request para qualquer endpoint (ex: `/api/1/auth/login`)
  - [ ] Inspecionar response headers no DevTools
  - [ ] ✅ **Verificar**: Header `X-Cache-Epoch` presente com GUID

- [ ] **Teste 3: Frontend sincroniza epoch**
  - [ ] Abrir aplicação no browser
  - [ ] Verificar localStorage key `cache_epoch`
  - [ ] Reiniciar backend (novo epoch gerado)
  - [ ] Recarregar página
  - [ ] ✅ **Verificar**: localStorage atualizado com novo epoch e caches limpos

**✅ CHECKPOINT FASE 1**: Sistema de Cache Epoch funcionando com sincronização automática

---

## 🎯 FASE 2: CLEAR-SITE-DATA HEADER

### 2.1. Backend - Middleware Clear-Site-Data

- [ ] Criar middleware `clearSiteDataMiddleware` em `src/backend/src/middleware/clear-site-data.middleware.ts`
  - [ ] Adicionar header `Clear-Site-Data: "cache"` condicionalmente
  - [ ] Ler flag do ambiente: `FORCE_CACHE_CLEAR=true`
  - [ ] Aplicar apenas quando flag ativa
- [ ] Adicionar variável ao `.env.example`
  - [ ] `FORCE_CACHE_CLEAR=false` (default)
- [ ] Aplicar middleware em rotas críticas (opcional)
  - [ ] `/` (index.html)
  - [ ] `/api/cache/epoch`
- [ ] ✅ **Checkpoint**: Backend pode forçar limpeza de cache via header HTTP

**Código de Referência**:
```typescript
// clear-site-data.middleware.ts
export const clearSiteDataMiddleware = (req, res, next) => {
  const forceClear = process.env.FORCE_CACHE_CLEAR === 'true';

  if (forceClear) {
    res.setHeader('Clear-Site-Data', '"cache"');
    console.log('[ClearSiteData] Header added to response');
  }

  next();
};
```

---

### 2.2. Backend - Endpoint Manual de Invalidação

- [ ] Criar endpoint `POST /api/cache/invalidate` em `src/backend/src/routes/cache.routes.ts`
  - [ ] Requer autenticação (admin only)
  - [ ] Chama `cacheEpochService.refreshEpoch()`
  - [ ] Publica evento Redis `cache:invalidate` com novo epoch
  - [ ] Retorna novo epoch no response
- [ ] ✅ **Checkpoint**: Admin pode forçar invalidação via API

---

### 2.3. Testar Fase 2 Completa

**Checklist de Testes**:
- [ ] **Teste 1: Clear-Site-Data header ativo**
  - [ ] Configurar `FORCE_CACHE_CLEAR=true` no `.env`
  - [ ] Reiniciar backend
  - [ ] Fazer request para `/`
  - [ ] ✅ **Verificar**: Header `Clear-Site-Data: "cache"` presente

- [ ] **Teste 2: Endpoint de invalidação manual**
  - [ ] Fazer login como admin
  - [ ] POST para `/api/cache/invalidate` com token JWT
  - [ ] ✅ **Verificar**: Response retorna novo epoch diferente do anterior

**✅ CHECKPOINT FASE 2**: Sistema de limpeza forçada via HTTP header funcionando

---

## 🎯 FASE 3: SERVICE WORKER UPDATE DETECTION

### 3.1. Frontend - SW Update Handler

- [ ] Criar serviço `swUpdateHandler.ts` em `src/frontend/src/services/swUpdateHandler.ts`
  - [ ] Listener para evento `controllerchange`
  - [ ] Método `promptForUpdate()` para notificar usuário
  - [ ] Método `forceReload()` para recarregar página
  - [ ] Flag `autoReload` configurável (default: false)
- [ ] Adicionar inicialização em `src/frontend/src/main.tsx`
  - [ ] Registrar listener após SW registration
- [ ] ✅ **Checkpoint**: Frontend detecta quando SW atualiza

**Código de Referência**:
```typescript
// swUpdateHandler.ts
class SWUpdateHandler {
  constructor(private autoReload = false) {
    this.init();
  }

  private init() {
    if (!('serviceWorker' in navigator)) return;

    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('[SWUpdate] New service worker activated');

      if (this.autoReload) {
        this.forceReload();
      } else {
        this.promptForUpdate();
      }
    });
  }

  promptForUpdate() {
    // Implementar toast/modal aqui (FASE 3.2)
    console.log('[SWUpdate] Update available, prompting user');
  }

  forceReload() {
    console.log('[SWUpdate] Forcing page reload');
    window.location.reload();
  }
}

export const swUpdateHandler = new SWUpdateHandler();
```

---

### 3.2. Frontend - UI de Notificação de Update

- [ ] Criar componente `UpdateNotification.tsx` em `src/frontend/src/components/UpdateNotification.tsx`
  - [ ] Toast/Banner "Nova versão disponível"
  - [ ] Botão "Atualizar agora" → chama `forceReload()`
  - [ ] Botão "Mais tarde" → fecha toast
  - [ ] Auto-hide após 30 segundos
- [ ] Integrar com `swUpdateHandler.promptForUpdate()`
- [ ] Adicionar ao layout principal
- [ ] ✅ **Checkpoint**: Usuário vê notificação visual quando há update

---

### 3.3. Testar Fase 3 Completa

**Checklist de Testes**:
- [ ] **Teste 1: Detecção de novo SW**
  - [ ] Abrir aplicação em 2 tabs
  - [ ] Fazer rebuild do frontend (npm run build)
  - [ ] Recarregar tab 1
  - [ ] ✅ **Verificar**: Tab 2 mostra notificação de update

- [ ] **Teste 2: Reload forçado funciona**
  - [ ] Ver notificação de update
  - [ ] Clicar em "Atualizar agora"
  - [ ] ✅ **Verificar**: Página recarrega e nova versão carregada

**✅ CHECKPOINT FASE 3**: Sistema de notificação de updates funcionando

---

## 🎯 FASE 4: NETWORK-FIRST STRATEGY

### 4.1. Vite Config - Ajustar Precache

- [ ] Editar `src/frontend/vite.config.ts`
  - [ ] Remover `favicon.ico` do array `includeAssets`
  - [ ] Manter apenas PWA icons: `['pwa-192x192.svg', 'pwa-512x512.svg']`
- [ ] ✅ **Checkpoint**: Favicon não mais precacheado

---

### 4.2. Vite Config - Adicionar Runtime Cache Network-First

- [ ] Adicionar configuração `runtimeCaching` no `workbox` object
  - [ ] Padrão: `/favicon\.ico$/` e `/manifest\.webmanifest$/`
  - [ ] Handler: `NetworkFirst`
  - [ ] Cache name: `critical-assets`
  - [ ] Expiração: 24 horas, max 10 entries
  - [ ] Network timeout: 3 segundos
- [ ] ✅ **Checkpoint**: Favicon e manifest usam Network-First

**Código de Referência**:
```typescript
// vite.config.ts (dentro de VitePWA)
workbox: {
  cleanupOutdatedCaches: true,
  skipWaiting: true,
  clientsClaim: true,
  runtimeCaching: [
    // Adicionar ANTES dos outros runtime caches
    {
      urlPattern: /\/(favicon\.ico|manifest\.webmanifest)$/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'critical-assets',
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 60 * 60 * 24, // 24 horas
        },
        networkTimeoutSeconds: 3,
      },
    },
    // ... resto dos runtime caches (Google Fonts, images, etc)
  ],
}
```

---

### 4.3. Testar Fase 4 Completa

**Checklist de Testes**:
- [ ] **Teste 1: Favicon tenta network primeiro**
  - [ ] Rebuild frontend
  - [ ] Abrir DevTools → Network tab
  - [ ] Recarregar página
  - [ ] Filtrar por `favicon.ico`
  - [ ] ✅ **Verificar**: Request vai para a rede (não vem de Service Worker)

- [ ] **Teste 2: Fallback offline funciona**
  - [ ] Abrir página online (favicon carrega)
  - [ ] Desligar servidor
  - [ ] Recarregar página
  - [ ] ✅ **Verificar**: Favicon ainda aparece (vem do cache)

**✅ CHECKPOINT FASE 4**: Estratégia Network-First aplicada a recursos críticos

---

## 🎯 FASE 5: INTEGRAÇÃO COM SSE

### 5.1. Backend - Evento SSE de Invalidação

- [ ] Criar evento `cache-invalidate` em `src/backend/src/services/sse.service.ts`
  - [ ] Tipo: `cache-invalidate`
  - [ ] Payload: `{ newEpoch: string, scope: 'global' | 'favicon' | 'manifest' | 'assets' }`
  - [ ] Publicar no Redis channel `platform:events`
- [ ] Integrar com `CacheEpochService.refreshEpoch()`
  - [ ] Quando epoch muda, publicar evento SSE
- [ ] ✅ **Checkpoint**: Backend publica eventos de invalidação via SSE

**Código de Referência**:
```typescript
// Dentro de cacheEpochService.refreshEpoch()
import { publishEvent } from './sse.service';

refreshEpoch(scope = 'global'): string {
  const oldEpoch = this.currentEpoch;
  this.currentEpoch = crypto.randomUUID();

  // Publicar evento SSE
  publishEvent({
    type: 'cache-invalidate',
    target: 'global',
    data: {
      newEpoch: this.currentEpoch,
      scope,
    },
  });

  return this.currentEpoch;
}
```

---

### 5.2. Frontend - Handler de Evento cache-invalidate

- [ ] Adicionar handler em `src/frontend/src/hooks/useSSE.ts` ou `EventContext`
  - [ ] Escutar evento tipo `cache-invalidate`
  - [ ] Extrair `newEpoch` e `scope` do payload
  - [ ] Chamar `cacheValidator.updateEpoch(newEpoch)`
  - [ ] Se scope é `global`: invalidar tudo
  - [ ] Se scope específico: invalidar apenas cache relacionado
- [ ] ✅ **Checkpoint**: Frontend responde a eventos SSE de invalidação

**Código de Referência**:
```typescript
// useSSE.ts ou EventContext
useEffect(() => {
  const handleEvent = (event: MessageEvent) => {
    const data = JSON.parse(event.data);

    if (data.type === 'cache-invalidate') {
      const { newEpoch, scope } = data.data;
      console.log('[SSE] Cache invalidation received:', scope, newEpoch);

      cacheValidator.updateEpoch(newEpoch);

      if (scope === 'global') {
        // Invalidar tudo + recarregar
        swUpdateHandler.forceReload();
      }
      // Scopes específicos: invalidar seletivamente (implementar se necessário)
    }
  };

  eventSource?.addEventListener('message', handleEvent);
  return () => eventSource?.removeEventListener('message', handleEvent);
}, [eventSource]);
```

---

### 5.3. Testar Fase 5 Completa

**Checklist de Testes**:
- [ ] **Teste 1: Evento SSE de invalidação enviado**
  - [ ] Abrir aplicação e conectar ao SSE
  - [ ] Via Postman/curl: POST para `/api/cache/invalidate`
  - [ ] Verificar DevTools → Network → EventSource messages
  - [ ] ✅ **Verificar**: Evento `cache-invalidate` recebido com novo epoch

- [ ] **Teste 2: Frontend invalida cache ao receber evento**
  - [ ] Abrir DevTools → Console
  - [ ] Trigger invalidação (POST `/api/cache/invalidate`)
  - [ ] ✅ **Verificar**: Console mostra "Cache invalidation received" e página recarrega

- [ ] **Teste 3: Tabs abertas recebem invalidação em tempo real**
  - [ ] Abrir aplicação em 3 tabs diferentes
  - [ ] Trigger invalidação
  - [ ] ✅ **Verificar**: Todas as tabs recarregam automaticamente

**✅ CHECKPOINT FASE 5**: Sistema completo de invalidação via SSE funcionando em tempo real

---

## 📝 NOTAS DE IMPLEMENTAÇÃO

### Decisões Arquiteturais
- **Cache Epoch como GUID**: Preferido sobre timestamp para evitar problemas de sincronização de relógio entre servidor e clientes
- **Network-First para favicon/manifest**: Garante busca na rede quando online, mantendo fallback offline para PWA
- **Clear-Site-Data como kill switch**: Header HTTP agressivo usado apenas em emergências (flag de ambiente)
- **SSE como canal de invalidação**: Aproveita infraestrutura SSE existente para push de invalidações em tempo real
- **Auto-reload em invalidação global**: Decisão de UX para garantir atualização imediata em mudanças críticas

### Limitações Conhecidas
- **Browser HTTP cache de favicons**: Mesmo com Network-First, browsers podem cachear favicon independentemente. Clear-Site-Data ajuda mas não é 100% garantido em todos os browsers.
  - Mitigação: Usar versioned favicon URLs (ex: `favicon.ico?v=123`) quando mudar
  - Alternativa futura: Favicon SVG inline no HTML (sem request externa)

- **Usuários offline não recebem invalidação**: SSE não funciona offline. Invalidação ocorrerá no próximo connect.
  - Mitigação: Epoch sync na reconexão garante que cache antigo seja detectado e limpo

- **Service Worker update delay**: Browsers verificam updates do SW apenas em navigation/reload.
  - Mitigação: Manual update check via `registration.update()` a cada X minutos (opcional)

### Referências
- Chrome DevRel: Removing buggy service workers - https://developer.chrome.com/docs/workbox/remove-buggy-service-workers
- MDN: Clear-Site-Data Header - https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Clear-Site-Data
- Workbox: Cache Strategies - https://developer.chrome.com/docs/workbox/modules/workbox-strategies
- W3C Spec: Clear Site Data - https://www.w3.org/TR/clear-site-data/
- Service Worker Lifecycle - https://web.dev/service-worker-lifecycle/
