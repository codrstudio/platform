# Network-First Strategy Update - TanStack Query

**Date**: 2025-11-06
**Prototype**: prototype-1
**Status**: ✅ IMPLEMENTED

---

## Mudança Realizada

### TanStack Query - Network-First Completo

**Arquivo modificado**: `src/prototype-1/frontend/src/providers/QueryProvider.tsx`

**Mudança**:
```typescript
// ANTES (Cache-First):
queries: {
  staleTime: 5 * 60 * 1000,  // 5 minutos
  refetchOnWindowFocus: false
}

// DEPOIS (Network-First):
queries: {
  staleTime: 0,              // Sempre revalida
  refetchOnWindowFocus: true // Revalida ao focar janela
}
```

---

## Por Que Essa Mudança?

### Problema Anterior
Com `staleTime: 5min`, o TanStack Query cacheava dados de configuração por 5 minutos:

```
1. Usuário ativa módulo "auth" via Setup
2. Configuração salva no backend
3. useJQEL busca config via TanStack Query
4. TanStack Query retorna dados CACHEADOS (< 5min)
5. Portal não vê novo módulo
6. Rotas antigas permanecem
7. React Router renderiza rotas antigas
```

### Solução: Network-First

Com `staleTime: 0`, o TanStack Query sempre revalida:

```
1. Usuário ativa módulo "auth" via Setup
2. Configuração salva no backend
3. useJQEL busca config via TanStack Query
4. TanStack Query SEMPRE busca da rede (staleTime: 0)
5. Portal vê novo módulo imediatamente
6. Rotas atualizadas
7. React Router renderiza novas rotas ✅
```

---

## Conformidade com Especificações

Esta mudança garante conformidade com:

- **SPEC-A-PWA-009**: "A plataforma DEVE usar estratégia network-first para dados"
- **SPEC-R-LD-018**: "Service Worker DEVE usar estratégia network-first para HTML"
- **SPEC-R-LD-019**: "HTML em cache DEVE ser usado apenas quando rede não estiver disponível"
- **SPEC-LOAD-D-018**: "Cache de HTML NÃO DEVE impedir ativação em runtime de funcionar"
- **SPEC-LOAD-D-019**: "Estratégia network-first para HTML DEVE garantir mudanças refletidas"
- **SPEC-CF-AS-014**: "Respostas HTML DEVEM usar estratégia de cache network-first"
- **SPEC-CF-AS-015**: "Service Worker DEVE buscar HTML atualizado após mutations"

---

## Impacto no Sistema

### Roteamento (React Router)

O React Router **não faz cache próprio** - ele renderiza baseado no array `routes` fornecido:

```
usePortalRoutes() hook
   ↓ usa
useJQEL({ schema: 'backend', select: 'portal' })
   ↓ usa
TanStack Query (AGORA: staleTime: 0) ✅
   ↓ busca
Backend /api/jqel (sempre atualizado)
   ↓ retorna
Portal config com activeModules[]
   ↓ gera
Array de rotas atualizado
   ↓ renderiza
React Router com rotas corretas ✅
```

### Outros Hooks JQEL

**Todos os hooks `useJQEL`** agora usam network-first automaticamente:
- `usePortalRoutes()` - Configuração de portais
- Qualquer query JQEL de módulos
- Qualquer query JQEL de instâncias

---

## Performance

### Build Results

```
✓ built in 1.90s
dist/assets/index-BeITLL6a.js  205.46 kB │ gzip: 64.21 kB
```

**Targets mantidos**:
- ✅ Bundle inicial: 64.21 KB gzipped (< 200 KB target)
- ✅ Build time: 1.90s
- ✅ Zero erros TypeScript

### Cache Ainda Funciona

Apesar de `staleTime: 0`:
- **gcTime: 10min** - Dados permanecem em memória por 10 minutos
- Cache usado como fallback se rede falhar
- Validação rápida com HTTP 304 (Not Modified)

### Offline

- Service Worker continua servindo HTML cacheado quando offline
- TanStack Query usa dados cacheados quando rede falha
- Funcionalidade offline preservada (SPEC-A-PWA-005)

---

## Validação

### ✅ Build Passou
```bash
cd src/prototype-1/frontend
npm run build
# ✓ built in 1.90s
```

### 📋 Testes Recomendados

1. **Ativação de Módulo**:
   ```
   - Ir para Setup portal
   - Ativar novo módulo (ex: "auth")
   - Navegar para rota do módulo (F5 ou link)
   - Verificar: Rota funciona imediatamente ✅
   ```

2. **Desativação de Módulo**:
   ```
   - Ir para Setup portal
   - Desativar módulo existente
   - Tentar navegar para rota do módulo
   - Verificar: Erro apropriado (404 ou "module not active") ✅
   ```

3. **Window Focus**:
   ```
   - Abrir app em uma aba
   - Ativar módulo em outra aba/janela
   - Voltar para primeira aba (focar janela)
   - Verificar: Config atualiza automaticamente ✅
   ```

4. **Offline**:
   ```
   - DevTools → Application → Service Workers
   - Check "Offline"
   - Refresh
   - Verificar: App carrega do cache ✅
   ```

---

## Arquivos Modificados

```
src/prototype-1/frontend/src/providers/QueryProvider.tsx
  - staleTime: 5 * 60 * 1000 → staleTime: 0
  - refetchOnWindowFocus: false → refetchOnWindowFocus: true
  - Comentários SPEC adicionados
```

---

## Compatibilidade com Implementação Anterior

Esta mudança **complementa** a implementação de Service Worker existente:

- ✅ Service Worker: Network-first para **HTML** (já implementado)
- ✅ Service Worker: Cache-first para **assets** (já implementado)
- ✅ TanStack Query: Network-first para **dados** (AGORA implementado)

**Resultado**: Sistema totalmente network-first para dados e HTML, com cache-first apenas para assets estáticos.

---

## Próximos Passos

1. ✅ Mudança implementada
2. ✅ Build validado
3. ⏳ Testes manuais (recomendado antes de deployment)
4. ⏳ Lighthouse audit (verificar performance mantida)

---

**Implementação por**: Claude Code
**Data**: 2025-11-06
**Review Status**: Aguardando testes manuais
