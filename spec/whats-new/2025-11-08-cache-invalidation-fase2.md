# Cache Invalidation - Fase 2 Concluída

**Data**: 2025-11-08
**PLAN**: PLAN_4-Cache-Invalidation.md
**Fase**: 2 - CLEAR-SITE-DATA HEADER

## 📋 Resumo

Implementado sistema de limpeza forçada de cache via HTTP header `Clear-Site-Data` e endpoint manual de invalidação para administradores.

## ✅ Implementações

### 1. Middleware Clear-Site-Data

**Arquivo**: `src/backend/src/middleware/clear-site-data.middleware.ts`

- Adiciona header `Clear-Site-Data: "cache"` condicionalmente
- Controlado por variável de ambiente `FORCE_CACHE_CLEAR`
- Aplicado globalmente em todas as rotas após o `cacheEpochMiddleware`

**Uso**:
```typescript
// Ativar no .env
FORCE_CACHE_CLEAR=true

// Header será adicionado em TODAS as responses:
Clear-Site-Data: "cache"
```

### 2. Variável de Ambiente

**Arquivo**: `src/backend/.env.example`

Adicionada nova variável:
```env
# Optional: Cache Invalidation
FORCE_CACHE_CLEAR=false
```

### 3. Endpoint de Invalidação Manual

**Arquivo**: `src/backend/src/routes/cache.routes.ts`

Novo endpoint: `POST /api/cache/invalidate`

**Request**: Nenhum parâmetro necessário

**Response**:
```json
{
  "code": 200,
  "data": {
    "oldEpoch": "550e8400-e29b-41d4-a716-446655440000",
    "newEpoch": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    "timestamp": "2025-11-08T10:30:00.000Z"
  }
}
```

**Comportamento**:
1. Gera novo epoch via `cacheEpochService.refreshEpoch()`
2. Publica evento SSE `cache-invalidate` para todos os clientes conectados
3. Retorna epochs antigo e novo no response

**⚠️ TODO**: Adicionar autenticação (admin only)

### 4. Tipo de Evento SSE

**Arquivo**: `src/backend/src/types/event.types.ts`

Nova interface: `CacheInvalidateEvent`

```typescript
export interface CacheInvalidateEvent extends BaseEvent {
  type: 'cache-invalidate'
  data: {
    oldEpoch: string
    newEpoch: string
    scope: 'global' | 'favicon' | 'manifest' | 'assets'
  }
}
```

Adicionado ao `PlatformEvent` union type.

### 5. Helper publishEvent

**Arquivo**: `src/backend/src/services/sse.service.ts`

Nova função exportada:
```typescript
export async function publishEvent(
  event: PlatformEvent,
  channel = 'platform:events'
): Promise<void>
```

Wrapper conveniente para `redisService.publish` usado em route handlers.

## 📊 Arquivos Modificados

1. `src/backend/src/middleware/clear-site-data.middleware.ts` (novo)
2. `src/backend/.env.example` (modificado)
3. `src/backend/src/app.ts` (modificado - adiciona middleware)
4. `src/backend/src/routes/cache.routes.ts` (modificado - adiciona endpoint)
5. `src/backend/src/types/event.types.ts` (modificado - adiciona tipo)
6. `src/backend/src/services/sse.service.ts` (modificado - adiciona helper)

## 🎯 Próximos Passos

### Fase 3: Service Worker Update Detection
- Frontend: SW Update Handler
- Frontend: UI de Notificação de Update
- Detecção automática de novo SW
- Reload forçado quando necessário

### Pendências da Fase 2
- [ ] Adicionar autenticação admin ao endpoint `/api/cache/invalidate`
- [ ] Testar header Clear-Site-Data em diferentes browsers
- [ ] Testar endpoint de invalidação manual
- [ ] Validar que evento SSE é recebido por clientes conectados

## 📚 Referências

- Chrome DevRel: [Removing buggy service workers](https://developer.chrome.com/docs/workbox/remove-buggy-service-workers)
- MDN: [Clear-Site-Data Header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Clear-Site-Data)
- W3C Spec: [Clear Site Data](https://www.w3.org/TR/clear-site-data/)

## ⚠️ Notas Importantes

1. **Kill Switch**: `FORCE_CACHE_CLEAR=true` é um "kill switch" para emergências. Não deve ser usado em produção normalmente.

2. **Compatibilidade**: Header `Clear-Site-Data` tem suporte limitado:
   - ✅ Chrome/Edge 61+
   - ✅ Firefox 63+
   - ❌ Safari (não suportado)

3. **Escopo**: Header atual só limpa `"cache"`. Outros valores possíveis:
   - `"cookies"` - Limpa cookies
   - `"storage"` - Limpa localStorage/sessionStorage/IndexedDB
   - `"*"` - Limpa tudo (não recomendado)

4. **Redis**: Sistema depende de Redis funcionando para publicar eventos SSE. Se Redis não estiver disponível, o endpoint ainda funciona mas clientes não recebem notificação em tempo real.
