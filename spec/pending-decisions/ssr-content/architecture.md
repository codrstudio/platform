# Arquitetura SSR - Server-Side Rendering para Conteúdo

## Visão Geral

Sistema de renderização server-side que coexiste com a SPA React existente.

```
┌─────────────────────────────────────────────────┐
│  Request: GET /blog/meu-post                    │
└─────────────────┬───────────────────────────────┘
                  ↓
┌─────────────────────────────────────────────────┐
│  Backend Express - Middleware de Roteamento     │
│  "Esta rota precisa SSR?"                       │
└─────────────────┬───────────────────────────────┘
                  ↓
        ┌─────────┴─────────┐
        │ SIM               │ NÃO
        ↓                   ↓
┌───────────────┐   ┌──────────────┐
│  SSR Engine   │   │  Serve SPA   │
└───────┬───────┘   │  index.html  │
        ↓           └──────────────┘
┌───────────────┐
│  Cache Check  │
│  Existe?      │
└───────┬───────┘
        ↓
    ┌───┴───┐
    │ SIM   │ NÃO
    ↓       ↓
┌────────┐ ┌─────────────────┐
│ Serve  │ │ Renderiza React │
│ Cache  │ │ Server-Side     │
└────────┘ └────────┬────────┘
                    ↓
           ┌─────────────────┐
           │ Salva em Cache  │
           │ (se aplicável)  │
           └────────┬────────┘
                    ↓
           ┌─────────────────┐
           │  Retorna HTML   │
           └─────────────────┘
```

---

## Componentes do Sistema

### 1. Route Registry (Registro de Rotas SSR)

**Localização:** Core da plataforma

**Função:** Mapeia quais rotas precisam SSR.

**Estrutura:**
```typescript
{
  route: string,              // "/blog/:slug"
  moduleId: string,           // "website-estatico"
  renderMode: "cached" | "dynamic",
  cacheStrategy?: {
    ttl?: number,             // TTL em segundos (se mode = dynamic)
    versionKey: string        // Chave de versão (se mode = cached)
  }
}
```

**Exemplo:**
```typescript
// Módulo Website Estático registra:
{
  route: "/blog/:slug",
  moduleId: "website-estatico",
  renderMode: "cached",
  cacheStrategy: {
    versionKey: "blog_post_version"
  }
}

// Módulo Website Dinâmico registra:
{
  route: "/produtos/:id",
  moduleId: "website-dinamico",
  renderMode: "dynamic",
  cacheStrategy: {
    ttl: 60  // Cache de 1 minuto
  }
}
```

---

### 2. SSR Middleware (Middleware de Roteamento)

**Localização:** Backend Express

**Função:** Intercepta requests e decide: SSR ou SPA?

**Fluxo:**
1. Request chega: `GET /blog/meu-post`
2. Verifica Route Registry: "rota registrada para SSR?"
3. **SIM:** Passa para SSR Engine
4. **NÃO:** Serve `index.html` (SPA React)

**Prioridade:**
- Rotas SSR têm prioridade sobre SPA
- Rotas estáticas (`/assets/*`, `/api/*`) têm prioridade sobre SSR

---

### 3. SSR Engine (Motor de Renderização)

**Localização:** Core da plataforma

**Função:** Renderiza componentes React no servidor.

**Entrada:**
- Rota solicitada
- Dados da página (via JQEL)
- Template React

**Saída:**
- HTML completo
- Meta tags (SEO, Open Graph, Schema.org)

**Processo:**
```
1. Buscar dados da página (JQEL)
2. Identificar template React
3. Renderizar com renderToString()
4. Injetar meta tags
5. Retornar HTML completo
```

---

### 4. Cache Manager (Gerenciador de Cache)

**Localização:** Core da plataforma

**Função:** Armazena e recupera HTML renderizado.

**Storage:** Redis

**Estrutura de chaves:**
```
ssr:cached:{route}:{version}
ssr:dynamic:{route}
```

**Exemplos:**
```
ssr:cached:/blog/meu-post:v3
ssr:dynamic:/produtos/123
```

**Operações:**
- `get(route, version?)` - Busca HTML do cache
- `set(route, html, options)` - Salva HTML no cache
- `invalidate(route, version?)` - Invalida cache específico
- `invalidateAll(pattern)` - Invalida múltiplos caches

---

### 5. Version Manager (Gerenciador de Versões)

**Localização:** Core da plataforma

**Função:** Controla versões de conteúdo para invalidação de cache.

**Storage:** Banco de dados (via JQEL)

**Schema:**
```typescript
{
  resource: string,    // "blog_post:123"
  version: number,     // 3
  updatedAt: Date      // 2025-01-15T10:30:00Z
}
```

**Fluxo:**
1. Conteúdo é criado → versão = 1
2. Conteúdo é editado → versão incrementa (v2, v3, ...)
3. Cache usa versão na chave: `ssr:cached:/blog/post-123:v3`
4. Edição invalida cache antigo automaticamente

---

## Fluxo Completo - Website Estático (Cached)

### Primeiro Acesso

```
1. GET /blog/meu-post
2. SSR Middleware verifica: "rota SSR? SIM (cached)"
3. Cache Manager busca: ssr:cached:/blog/meu-post:v1
4. Cache não existe
5. SSR Engine:
   a. Busca dados (JQEL): post 123, versão 1
   b. Renderiza template BlogPost
   c. Gera HTML completo
6. Cache Manager salva: ssr:cached:/blog/meu-post:v1
7. Retorna HTML
```

### Segundo Acesso (Cache Hit)

```
1. GET /blog/meu-post
2. SSR Middleware verifica: "rota SSR? SIM (cached)"
3. Cache Manager busca: ssr:cached:/blog/meu-post:v1
4. Cache existe → retorna HTML (sem renderizar)
```

### Usuário Edita Post

```
1. POST /api/jqel (update post 123)
2. Backend atualiza post
3. Version Manager incrementa: versão 1 → 2
4. Cache anterior (v1) torna-se obsoleto
5. Próximo acesso busca v2 (não encontra) → renderiza novo
```

---

## Fluxo Completo - Website Dinâmico (Dynamic)

### Cada Acesso

```
1. GET /produtos/123
2. SSR Middleware verifica: "rota SSR? SIM (dynamic)"
3. Cache Manager busca: ssr:dynamic:/produtos/123 (TTL 60s)
4. Se cache válido: retorna
5. Se expirado ou não existe:
   a. SSR Engine renderiza
   b. Salva em cache com TTL
   c. Retorna HTML
```

**Diferença:** Cache expira por tempo, não por versão.

---

## Integração com Plataforma Existente

### React Router

**Problema:** React Router gerencia rotas no frontend.

**Solução:** SSR Middleware intercepta ANTES do React Router.

```
Request → Express Middleware → SSR? → SIM: Renderiza HTML
                                    → NÃO: index.html → React Router
```

### PWA Service Worker

**Problema:** Service Worker pode cachear HTML desatualizado.

**Solução:** Usar estratégia network-first para rotas SSR (já especificado em SPEC-A-PWA-023).

### TanStack Query

**Problema:** Dados já buscados no servidor (SSR) seriam rebuscados no cliente.

**Solução:** SSR injeta dados iniciais no HTML (hydration).

```html
<script>
  window.__INITIAL_DATA__ = { post: {...} };
</script>
```

React usa esses dados sem refetch.

---

## Performance e Escalabilidade

### Website Estático (Cached)
- **Primeiro acesso:** ~100-200ms (renderização)
- **Acessos seguintes:** ~10-20ms (cache)
- **Escalabilidade:** Excelente (Redis distribui cache)

### Website Dinâmico (Dynamic)
- **Cada acesso:** ~100-200ms (renderização)
- **Com cache TTL:** ~10-20ms (se dentro do TTL)
- **Escalabilidade:** Boa (cache reduz carga)

### Otimizações Futuras
- CDN para servir cache (Cloudflare, AWS CloudFront)
- Pre-rendering assíncrono (n8n dispara render antecipado)
- Lazy hydration (React 19 Server Components)

---

## Segurança

### Isolamento Multi-Tenant

Cada cliente tem prefixo isolado:
```
ssr:cached:tenant-123:/blog/post
ssr:cached:tenant-456:/blog/post
```

### XSS Prevention

- Sanitização de HTML em templates
- Content Security Policy headers
- Escape de dados injetados

### Cache Poisoning

- Validação de versões
- Assinatura de cache (HMAC)

---

## Monitoramento

### Métricas

- Taxa de cache hit/miss
- Tempo de renderização SSR
- Uso de memória Redis
- Invalidações de cache por minuto

### Logs

- Toda renderização SSR logada
- Cache misses investigáveis
- Erros de renderização reportados

---

## Próximos Passos

1. Implementar Route Registry
2. Implementar SSR Middleware
3. Implementar SSR Engine básico
4. Implementar Cache Manager (Redis)
5. Implementar Version Manager
6. Criar módulo Website Estático (primeiro caso de uso)
7. Testar com Google Search Console
8. Criar módulo Website Dinâmico (segundo caso de uso)
