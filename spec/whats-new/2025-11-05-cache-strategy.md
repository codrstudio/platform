# What's New: Service Worker Cache Strategy

**Data**: 2025-11-05
**Tipo**: Atualização de Especificação
**Impacto**: Médio - Requer implementação em protótipos
**Decisão Relacionada**: `spec/pending-desicions/cache-strategy.md`

---

## Resumo

A estratégia de cache do Service Worker foi atualizada para usar **network-first para HTML** e **cache-first para assets**. Esta mudança garante que mudanças de configuração de portais e módulos sejam imediatamente refletidas sem necessidade de hard refresh.

---

## Mudanças nas Especificações

### 1. SPEC-architecture.md

**Seção afetada**: `3. Progressive Web App (PWA)` → Nova subseção "Estratégia de Cache HTML"

**Novos requisitos adicionados**:

- **SPEC-A-PWA-023**: Requisições de navegação HTML DEVEM usar estratégia network-first
- **SPEC-A-PWA-024**: Arquivos HTML (`/`, `/index.html`) NÃO DEVEM ser incluídos no precache do Service Worker
- **SPEC-A-PWA-025**: Service Worker DEVE detectar requisições de navegação (`request.mode === 'navigate'`)
- **SPEC-A-PWA-026**: Requisições de navegação DEVEM buscar da rede primeiro, usando cache apenas como fallback offline
- **SPEC-A-PWA-027**: Backend DEVE definir header `Cache-Control: no-cache` para respostas HTML
- **SPEC-A-PWA-028**: Assets estáticos (JS, CSS, imagens, fontes) DEVEM continuar usando estratégia cache-first
- **SPEC-A-PWA-029**: Assets com hash de conteúdo no filename PODEM usar `Cache-Control: immutable`

**Justificativa documentada**:
> HTML usa network-first para garantir que mudanças na configuração de portais/módulos sejam imediatamente refletidas, ativação de módulos em runtime funcione sem reload, usuários sempre recebam a estrutura de rotas atual, e funcionalidade offline seja preservada via fallback de cache.

---

### 2. SPEC-routing.md

**Seção afetada**: `6. Carregamento Dinâmico de Módulos` → Subseção "Ativação em Runtime"

**Novos requisitos adicionados**:

- **SPEC-R-LD-018**: Service Worker DEVE usar estratégia network-first para HTML para suportar mudanças em runtime
- **SPEC-R-LD-019**: HTML em cache DEVE ser usado apenas quando rede não estiver disponível (fallback offline)

**Contexto**: Estes requisitos reforçam que a ativação de módulos em runtime (SPEC-R-LD-006 a SPEC-R-LD-010) depende de HTML atualizado.

---

### 3. SPEC-module-loading.md

**Seção afetada**: `5. Carregamento Dinâmico (Runtime)` → Subseção "Ativação em Runtime"

**Novos requisitos adicionados**:

- **SPEC-LOAD-D-018**: Cache de HTML NÃO DEVE impedir ativação em runtime de funcionar
- **SPEC-LOAD-D-019**: Estratégia network-first para HTML DEVE ser usada para garantir que mudanças de configuração sejam refletidas

**Contexto**: Clarifica que o carregamento dinâmico (SPEC-LOAD-D-001 a SPEC-LOAD-D-004) requer HTML atualizado para funcionar corretamente.

---

### 4. SPEC-configuration.md

**Seção afetada**: `7. Application Settings (Persistência)` → Subseção "Edição"

**Novos requisitos adicionados**:

- **SPEC-CF-AS-014**: Respostas HTML DEVEM usar estratégia de cache network-first para refletir mudanças de configuração
- **SPEC-CF-AS-015**: Service Worker DEVE buscar HTML atualizado da rede após mutations de configuração

**Contexto**: Application Settings (SPEC-CF-AS-001 a SPEC-CF-AS-013) afetam o HTML carregado. Network-first garante que mudanças sejam refletidas.

---

## Problema Resolvido

### Antes (Cache-First para HTML)

```
1. Usuário ativa módulo "auth" via Setup
2. Configuração atualizada em backend
3. Usuário navega para /login (F5 ou link)
4. Service Worker serve HTML CACHEADO (antigo)
5. HTML antigo não conhece módulo "auth"
6. Resultado: "Portal Not Found" ❌
```

**Workaround necessário**: Hard refresh (Ctrl+Shift+R)

### Depois (Network-First para HTML)

```
1. Usuário ativa módulo "auth" via Setup
2. Configuração atualizada em backend
3. Usuário navega para /login (F5 ou link)
4. Service Worker busca HTML ATUALIZADO da rede
5. HTML atualizado carrega módulo "auth"
6. Resultado: Rota /login renderizada corretamente ✅
```

**Workaround**: Nenhum necessário

---

## Impacto na Implementação

### O que precisa ser implementado/corrigido

#### 1. Service Worker (Frontend)

**Arquivo**: `src/prototype-X/frontend/public/sw.js` (ou equivalente)

**Mudanças necessárias**:

1. **Remover HTML do precache** (SPEC-A-PWA-024):
   ```javascript
   // ANTES:
   const PRECACHE_ASSETS = [
     '/',              // ❌ Remover
     '/index.html',    // ❌ Remover
     '/manifest.json',
     '/icons/...'
   ];

   // DEPOIS:
   const PRECACHE_ASSETS = [
     '/manifest.json',
     '/icons/favicon.svg',
     '/icons/icon-192x192.png',
     '/icons/icon-512x512.png'
   ];
   ```

2. **Detectar navegação e aplicar network-first** (SPEC-A-PWA-025, SPEC-A-PWA-026):
   ```javascript
   // ANTES:
   event.respondWith(cacheFirst(request));

   // DEPOIS:
   if (request.mode === 'navigate') {
     event.respondWith(networkFirst(request));  // HTML
   } else {
     event.respondWith(cacheFirst(request));    // Assets
   }
   ```

3. **Bump cache version** (força invalidação):
   ```javascript
   const CACHE_VERSION = 'v6';  // Incrementar versão atual
   ```

**Estimativa**: ~10 linhas modificadas

---

#### 2. Backend (Middleware)

**Arquivo**: `src/prototype-X/backend/src/index.ts` (ou equivalente)

**Mudanças necessárias**:

1. **Adicionar middleware de cache headers** (SPEC-A-PWA-027):
   ```typescript
   app.use((req, res, next) => {
     if (req.path === '/' ||
         req.path === '/index.html' ||
         req.accepts('html')) {
       res.setHeader('Cache-Control', 'no-cache');
     }
     next();
   });
   ```

**Estimativa**: ~7 linhas adicionadas

---

### Validação Obrigatória

Após implementação, os seguintes cenários DEVEM ser testados:

#### Funcional
- [ ] Ativar módulo via Setup → Navegar para rota do módulo (F5) → Rota funciona ✅
- [ ] Ativar módulo via Setup → Navegar para rota do módulo (link) → Rota funciona ✅
- [ ] Ativar módulo via Setup → Navegar para rota do módulo (URL direta) → Rota funciona ✅
- [ ] Desativar módulo → Navegar para rota → Exibe erro apropriado ✅

#### Performance (manter targets)
- [ ] Landing page < 1s em 3G (SPEC-A-LL-006)
- [ ] Initial bundle < 200KB gzipped (SPEC-A-LL-007)
- [ ] Module chunks < 500KB gzipped (SPEC-A-LL-009)

#### Offline
- [ ] Desconectar rede → Navegar para rota cacheada → HTML servido do cache ✅
- [ ] Offline → Tentar nova rota → Mensagem offline apropriada ✅

#### PWA
- [ ] App permanece instalável após mudança
- [ ] Service Worker atualiza corretamente (SPEC-A-PWA-021)

---

## Alinhamento com Requisitos Existentes

Esta mudança **resolve violações** de requisitos existentes:

### Requisitos que estavam sendo violados

- **SPEC-R-LD-010**: "Usuário NÃO DEVE precisar recarregar página"
  - ❌ Antes: Hard refresh (Ctrl+Shift+R) era necessário
  - ✅ Depois: F5 normal funciona

- **SPEC-LOAD-D-013**: Mesmo requisito no contexto de module loading
  - ❌ Antes: Violado por cache-first HTML
  - ✅ Depois: Cumprido com network-first HTML

- **SPEC-CF-TI-015**: "Alteração de Application Settings NÃO DEVE requerer restart"
  - ❌ Antes: Requeria hard refresh (equivalente a "restart" do navegador)
  - ✅ Depois: Mudanças refletidas em navegação normal

### Consistência com requisitos de dados

- **SPEC-A-PWA-009**: "A plataforma DEVE usar estratégia network-first para dados"
  - Agora HTML está alinhado com dados (ambos network-first)
  - HTML depende de dados de configuração → faz sentido usar mesma estratégia

---

## Padrão da Indústria

Esta mudança alinha a plataforma com as **práticas recomendadas** por:

- **Google Workbox** (biblioteca oficial de Service Worker)
- **Create React App** (PWA template)
- **Next.js PWA**
- **Vite PWA Plugin**

Todos esses frameworks usam **network-first para HTML** e **cache-first para assets**.

---

## Riscos e Mitigações

### Risco 1: Performance em redes lentas
**Descrição**: Fetch de HTML da rede pode ser lento em 3G
**Mitigação**:
- HTML é pequeno (< 10KB)
- `Cache-Control: no-cache` permite validação rápida (ETag)
- Browsers fazem conditional request (304 Not Modified)
- **Validar**: Testar em 3G throttling

### Risco 2: Funcionalidade offline
**Descrição**: Network-first pode falhar quando offline
**Mitigação**:
- Cache fallback está implementado
- Offline users recebem HTML cacheado
- Este é o comportamento esperado (SPEC-A-PWA-005)
- **Validar**: Testar cenários offline

### Risco 3: Compatibilidade de browsers
**Descrição**: `request.mode === 'navigate'` pode não funcionar em todos
**Mitigação**:
- Feature suportada desde 2017
- Fallback: `request.destination === 'document'`
- **Validar**: Testar em Chrome, Firefox, Safari

---

## Próximos Passos

### Para Implementadores

1. **Identificar protótipo**: Qual prototype você está trabalhando?
2. **Localizar arquivos**:
   - Service Worker: `src/prototype-X/frontend/public/sw.js`
   - Backend: `src/prototype-X/backend/src/index.ts`
3. **Implementar mudanças**: Seguir seção "Impacto na Implementação"
4. **Executar validação**: Checklist completo na seção "Validação Obrigatória"
5. **Testar edge cases**: Offline, slow network, cross-browser
6. **Build production**: Verificar bundle sizes (performance targets)

### Para Revisores

1. **Verificar conformidade**: Implementação segue SPEC-A-PWA-023 a 029?
2. **Testar funcionalmente**: Todos os cenários de validação passam?
3. **Verificar performance**: Targets mantidos (< 1s, < 200KB, < 500KB)?
4. **Testar offline**: PWA funciona offline como esperado?

---

## Referências

- **Decisão completa**: `spec/pending-desicions/cache-strategy.md`
- **SPEC primária**: `spec/SPEC-architecture.md` (seção 3: PWA)
- **SPEC secundárias**:
  - `spec/SPEC-routing.md` (seção 6: Dynamic Loading)
  - `spec/SPEC-module-loading.md` (seção 5: Runtime Activation)
  - `spec/SPEC-configuration.md` (seção 7: Application Settings)

---

## Histórico de Aprovação

- **2025-11-05**: Decisão proposta em `pending-desicions/cache-strategy.md`
- **2025-11-05**: Análise completa de impacto realizada
- **2025-11-05**: Decisão aprovada
- **2025-11-05**: Especificações atualizadas (4 arquivos)
- **2025-11-05**: Documento whats-new criado

---

**Nota**: Este documento serve como referência para implementação. Consulte as especificações originais para requisitos formais completos.
