# Estratégia de Cache - SSR Content

## Visão Geral

Sistema de cache versionado para otimizar performance de conteúdo renderizado server-side.

**Objetivos:**
- Servir HTML rapidamente (baixa latência)
- Invalidar cache quando conteúdo muda
- Suportar múltiplos clientes (multi-tenant)
- Escalável e eficiente

---

## Dois Modos de Cache

### Modo 1: Cached (Website Estático)

**Quando usar:**
- Blog posts
- Landing pages
- Páginas institucionais
- Documentação
- Portfólios

**Características:**
- Cache infinito (até invalidação)
- Invalidação por versão
- Performance máxima

**Chave de cache:**
```
ssr:cached:{tenant}:{route}:{version}
```

**Exemplo:**
```
ssr:cached:empresa-a:/blog/tutorial-seo:v5
```

---

### Modo 2: Dynamic (Website Dinâmico)

**Quando usar:**
- E-commerce (preços, estoque)
- Fóruns
- Feeds sociais
- Dashboards públicos

**Características:**
- Cache com TTL (time-to-live)
- Expira automaticamente
- Conteúdo sempre "relativamente" atual

**Chave de cache:**
```
ssr:dynamic:{tenant}:{route}
```

**TTL:** Configurável por rota (padrão: 60 segundos)

**Exemplo:**
```
ssr:dynamic:loja-x:/produto/tenis-123  (TTL: 300s = 5min)
```

---

## Sistema de Versionamento

### Controle de Versão por Recurso

Cada conteúdo tem versão incremental.

**Tabela de versões (JQEL):**
```json
{
  "schema": "system",
  "entity": "ssr_version",
  "fields": {
    "resource": "string",      // "blog_post:123"
    "version": "number",        // 5
    "updatedAt": "datetime",    // 2025-01-15T14:30:00Z
    "updatedBy": "string"       // user-456
  }
}
```

### Fluxo de Versionamento

#### 1. Criação de Conteúdo

```
POST /api/jqel (insert blog_post)
→ Backend cria post
→ Version Manager cria: { resource: "blog_post:123", version: 1 }
```

#### 2. Edição de Conteúdo

```
POST /api/jqel (update blog_post 123)
→ Backend atualiza post
→ Version Manager incrementa: version 1 → 2
→ Cache antigo (v1) automaticamente obsoleto
```

#### 3. Acesso ao Conteúdo

```
GET /blog/tutorial-seo
→ SSR Middleware busca versão atual: v2
→ Cache Manager busca: ssr:cached:empresa-a:/blog/tutorial-seo:v2
→ Se não existe: renderiza e salva com chave v2
→ Cache antigo (v1) pode ser removido (garbage collection)
```

---

## Invalidação de Cache

### Invalidação Automática (Versionamento)

**Website Estático:** Não precisa invalidar manualmente.
- Versão muda → nova chave → cache antigo ignorado

### Invalidação Manual (Emergencial)

**API:**
```
POST /api/ssr/invalidate
{
  "route": "/blog/tutorial-seo",
  "tenant": "empresa-a"
}
```

**Ação:** Remove cache de todas as versões da rota.

### Invalidação em Massa

**API:**
```
POST /api/ssr/invalidate-pattern
{
  "pattern": "/blog/*",
  "tenant": "empresa-a"
}
```

**Uso:** Mudança de layout/tema que afeta múltiplas páginas.

---

## Integração com n8n (Automações)

### Cenário 1: Rebuild Automático

```
n8n Workflow: "Detectar mudança em categoria"
1. Trigger: JQEL mutation (update category)
2. Action: Buscar posts dessa categoria
3. Action: Incrementar versão de cada post
4. Result: Cache de todos os posts invalidado
```

### Cenário 2: Pre-warming de Cache

```
n8n Workflow: "Pre-aquecer cache de páginas importantes"
1. Schedule: Todo dia às 6h
2. Action: Lista top 100 páginas (analytics)
3. Action: Fazer GET em cada página (força renderização)
4. Result: Cache pronto antes do pico de acesso
```

### Cenário 3: Invalidação Programada

```
n8n Workflow: "Invalidar cache de ofertas expiradas"
1. Schedule: A cada hora
2. Action: Buscar ofertas que expiraram
3. Action: Incrementar versão das páginas de produto
4. Result: Preços/ofertas sempre atualizados
```

---

## Storage: Redis

### Estrutura de Dados

**Tipo:** String (HTML completo)

**Metadados:** Hash separado

```
ssr:cached:empresa-a:/blog/post:v3  → String (HTML)
ssr:meta:empresa-a:/blog/post:v3    → Hash { size, createdAt, hits }
```

### Expiração

**Website Estático:** Sem TTL (cache infinito)

**Website Dinâmico:** TTL configurável

```redis
SET ssr:dynamic:loja:/produto/123 "<html>..." EX 300
```

### Limpeza de Cache Antigo (Garbage Collection)

**Estratégia:** LRU (Least Recently Used)

Redis configurado com:
```
maxmemory-policy: allkeys-lru
```

Cache antigo (versões antigas) são removidos automaticamente quando memória fica cheia.

---

## Configuração por Módulo

Módulos definem estratégia de cache ao registrar rotas.

### Exemplo: Módulo Website Estático

```typescript
moduleRegistry.registerSSRRoute({
  route: "/blog/:slug",
  moduleId: "website-estatico",
  renderMode: "cached",
  cacheStrategy: {
    versionKey: (params) => `blog_post:${params.slug}`
  }
});
```

### Exemplo: Módulo Website Dinâmico

```typescript
moduleRegistry.registerSSRRoute({
  route: "/produto/:id",
  moduleId: "website-dinamico",
  renderMode: "dynamic",
  cacheStrategy: {
    ttl: 300  // 5 minutos
  }
});
```

---

## Casos Especiais

### 1. Páginas Personalizadas (Usuário Logado)

**Problema:** Conteúdo varia por usuário.

**Solução:** Não cachear (renderizar sempre) OU cachear partes estáticas.

```typescript
renderMode: "dynamic",
cacheStrategy: {
  ttl: 0  // Nunca cacheia
}
```

### 2. Páginas Multi-idioma

**Problema:** Mesma rota, múltiplos idiomas.

**Solução:** Incluir idioma na chave de cache.

```
ssr:cached:empresa:/sobre:pt-BR:v2
ssr:cached:empresa:/sobre:en-US:v2
```

### 3. A/B Testing

**Problema:** Múltiplas versões da mesma página.

**Solução:** Incluir variante na chave.

```
ssr:cached:empresa:/landing:variant-A:v1
ssr:cached:empresa:/landing:variant-B:v1
```

---

## Performance Esperada

### Website Estático (Cached)

| Métrica | Primeiro Acesso | Cache Hit |
|---------|----------------|-----------|
| Latência | 100-200ms | 10-20ms |
| CPU | Alta | Baixa |
| Memória | Alta | Baixa |
| Redis | Write | Read |

**Após cache warm:** 95%+ dos acessos são cache hits.

### Website Dinâmico (TTL 60s)

| Métrica | Cache Miss | Cache Hit |
|---------|-----------|-----------|
| Latência | 100-200ms | 10-20ms |
| CPU | Alta | Baixa |

**Cache hit rate:** 60-80% (depende do TTL e tráfego).

---

## Monitoramento

### Métricas Críticas

**Cache Hit Rate:**
```
cache_hits / (cache_hits + cache_misses) * 100
```

Meta: >90% (Website Estático), >60% (Website Dinâmico)

**Invalidações por Hora:**

Meta: <100 (evitar invalidações excessivas)

**Tempo de Renderização:**

Meta: <200ms (95th percentile)

### Alertas

- Cache hit rate <80% (Website Estático)
- Cache hit rate <50% (Website Dinâmico)
- Tempo de renderização >500ms
- Redis memory usage >80%

---

## Custo de Infraestrutura

### Estimativa de Memória Redis

**Média de HTML:** 50KB por página

**100 clientes, 100 páginas cada:**
- 10.000 páginas x 50KB = 500MB
- Com overhead: ~1GB Redis

**1.000 clientes, 100 páginas cada:**
- 100.000 páginas x 50KB = 5GB
- Com overhead: ~10GB Redis

**Conclusão:** Escalável até milhares de clientes.

---

## Decisões de Design

### Por que Versionamento em vez de Invalidação?

**Vantagens:**
- ✅ Simples (não precisa buscar e deletar)
- ✅ Atômico (nova versão disponível imediatamente)
- ✅ Rollback fácil (cache antigo ainda existe)

**Desvantagem:**
- ⚠️ Cache antigo fica órfão (resolvido por LRU)

### Por que Redis em vez de Filesystem?

**Vantagens:**
- ✅ Mais rápido (memória vs disco)
- ✅ Distribuído (múltiplos servidores backend)
- ✅ TTL nativo
- ✅ LRU automático

**Desvantagem:**
- ⚠️ Volatilidade (se Redis cair, cache perdido)
- **Mitigação:** Cache é regenerável (não é dado crítico)

---

## Próximos Passos

1. Implementar Version Manager
2. Implementar Cache Manager (Redis)
3. Definir API de invalidação
4. Criar dashboards de monitoramento
5. Testar com carga (stress test)
6. Documentar métricas de baseline
